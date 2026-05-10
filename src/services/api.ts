const API_BASE = 'http://110.42.50.148:4000/api';

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  formData?: boolean;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, formData = false } = options;

    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    if (this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    if (!formData) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body) {
      config.body = formData ? body : JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, ...data };
    }

    return data;
  }

  // ============ 认证 ============
  async register(data: { username: string; email: string; password: string }) {
    const result = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: data,
    });
    this.setToken(result.token);
    return result;
  }

  async login(data: { email: string; password: string }) {
    const result = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: data,
    });
    this.setToken(result.token);
    return result;
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  // ============ 用户 ============
  async getUser(userId: string) {
    return this.request<{ user: any }>(`/users/${userId}`);
  }

  async updateUser(userId: string, data: any) {
    return this.request<{ user: any }>(`/users/${userId}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async searchUsers(query: string) {
    return this.request<{ users: any[] }>(`/users?q=${encodeURIComponent(query)}`);
  }

  async sendFriendRequest(userId: string) {
    return this.request<{ message: string }>(`/users/${userId}/friend-request`, {
      method: 'POST',
    });
  }

  // ============ 服务器 ============
  async createServer(data: { name: string; description?: string }) {
    return this.request<{ server: any }>('/servers', {
      method: 'POST',
      body: data,
    });
  }

  async getServer(serverId: string) {
    return this.request<{ server: any }>(`/servers/${serverId}`);
  }

  async getUserServers() {
    const result = await this.getMe();
    return { servers: result.user?.servers || [] };
  }

  async createInvite(serverId: string, options?: { maxUses?: number; expiresIn?: number }) {
    return this.request<{ invite: any }>(`/servers/${serverId}/invites`, {
      method: 'POST',
      body: options || {},
    });
  }

  async joinServer(inviteCode: string) {
    return this.request<{ serverId: string; name: string }>(`/servers/join/${inviteCode}`, {
      method: 'POST',
    });
  }

  async deleteServer(serverId: string) {
    return this.request<{ message: string }>(`/servers/${serverId}`, {
      method: 'DELETE',
    });
  }

  // ============ 频道 ============
  async createChannel(serverId: string, data: {
    name: string;
    type: 'text' | 'voice' | 'announcement' | 'forum';
    topic?: string;
    isNSFW?: boolean;
  }) {
    return this.request<{ channel: any }>(`/channels/server/${serverId}`, {
      method: 'POST',
      body: data,
    });
  }

  async deleteChannel(channelId: string) {
    return this.request<{ message: string }>(`/channels/${channelId}`, {
      method: 'DELETE',
    });
  }

  // ============ 消息 ============
  async getMessages(channelId: string, page = 1, limit = 50) {
    return this.request<{ messages: any[]; hasMore: boolean; total: number }>(
      `/messages/${channelId}?page=${page}&limit=${limit}`
    );
  }

  async sendMessage(channelId: string, content: string) {
    return this.request<{ message: any }>(`/messages/${channelId}`, {
      method: 'POST',
      body: { content },
    });
  }

  async editMessage(messageId: string, content: string) {
    return this.request<{ message: any }>(`/messages/${messageId}`, {
      method: 'PATCH',
      body: { content },
    });
  }

  async deleteMessage(messageId: string) {
    return this.request<{ message: string }>(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async addReaction(messageId: string, emoji: string) {
    return this.request<{ reactions: any[] }>(`/messages/${messageId}/reactions`, {
      method: 'POST',
      body: { emoji },
    });
  }

  async searchMessages(serverId: string, query: string) {
    return this.request<{ messages: any[] }>(
      `/messages/search/${serverId}?q=${encodeURIComponent(query)}`
    );
  }

  // ============ 文件上传 ============
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<{ file: any }>('/upload', {
      method: 'POST',
      body: formData,
      formData: true,
    });
  }
}

export const api = new ApiService();