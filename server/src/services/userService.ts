import { User } from '../models/User.js';

export class UserService {
  async getUserById(userId: string) {
    const user = await User.findById(userId)
      .select('-password -email')
      .populate('friends', 'username avatar status discriminator');

    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    return { user };
  }

  async updateUser(userId: string, requesterId: string, data: any) {
    // 只能更新自己的资料
    if (userId !== requesterId) {
      throw { status: 403, message: 'Can only update your own profile' };
    }

    const allowedUpdates = [
      'username',
      'bio',
      'avatar',
      'banner',
      'accentColor',
      'customStatus',
      'status',
    ];

    const updates: any = {};
    for (const key of allowedUpdates) {
      if (data[key] !== undefined) {
        updates[key] = data[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    return { user };
  }

  async sendFriendRequest(fromUserId: string, toUserId: string) {
    if (fromUserId === toUserId) {
      throw { status: 400, message: 'Cannot send friend request to yourself' };
    }

    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);

    if (!toUser) {
      throw { status: 404, message: 'User not found' };
    }

    // 检查是否已经是好友
    if (fromUser?.friends.includes(toUser._id)) {
      throw { status: 400, message: 'Already friends' };
    }

    // 检查是否已有待处理的请求
    const existingRequest = toUser.friendRequests.find(
      (r) => r.from.toString() === fromUserId && r.status === 'pending'
    );

    if (existingRequest) {
      throw { status: 400, message: 'Friend request already sent' };
    }

    toUser.friendRequests.push({
      from: fromUser._id,
      status: 'pending',
      createdAt: new Date(),
    });

    await toUser.save();

    return { message: 'Friend request sent' };
  }

  async handleFriendRequest(userId: string, fromUserId: string, action: 'accept' | 'decline') {
    const user = await User.findById(userId);

    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    const requestIndex = user.friendRequests.findIndex(
      (r) => r.from.toString() === fromUserId && r.status === 'pending'
    );

    if (requestIndex === -1) {
      throw { status: 404, message: 'No pending friend request from this user' };
    }

    if (action === 'accept') {
      user.friends.push(fromUserId as any);
      const fromUser = await User.findById(fromUserId);
      if (fromUser) {
        fromUser.friends.push(userId as any);
        await fromUser.save();
      }
    }

    user.friendRequests.splice(requestIndex, 1);
    await user.save();

    return { message: `Friend request ${action === 'accept' ? 'accepted' : 'declined'}` };
  }

  async searchUsers(query: string) {
    if (!query || query.length < 2) {
      throw { status: 400, message: 'Search query must be at least 2 characters' };
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
      ],
    })
      .select('username discriminator avatar status')
      .limit(20);

    return { users };
  }

  async updateStatus(userId: string, status: 'online' | 'idle' | 'dnd' | 'offline') {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          status,
          lastSeen: status === 'offline' ? new Date() : undefined,
        },
      },
      { new: true }
    ).select('username status discriminator');

    return { user };
  }
}

export const userService = new UserService();