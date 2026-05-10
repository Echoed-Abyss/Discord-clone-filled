import { User, IUser } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

export class AuthService {
  async register(data: { username: string; email: string; password: string }) {
    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    });

    if (existingUser) {
      throw {
        status: 400,
        message: existingUser.email === data.email
          ? 'Email already registered'
          : 'Username already taken',
      };
    }

    // 生成discriminator
    const discriminator = await this.generateDiscriminator(data.username);

    const user = await User.create({
      ...data,
      discriminator,
    });

    const token = generateToken(user);

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await User.findOne({ email: data.email }).select('+password');

    if (!user) {
      throw {
        status: 401,
        message: 'Invalid email or password',
      };
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      throw {
        status: 401,
        message: 'Invalid email or password',
      };
    }

    // 更新在线状态
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user);

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async getMe(userId: string) {
    const user = await User.findById(userId)
      .populate('servers')
      .populate('friends', 'username avatar status discriminator');

    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    return { user };
  }

  private async generateDiscriminator(username: string): Promise<string> {
    let attempts = 0;
    while (attempts < 100) {
      const discriminator = Math.floor(1000 + Math.random() * 9000).toString();
      const existing = await User.findOne({ username, discriminator });
      if (!existing) return discriminator;
      attempts++;
    }
    throw { status: 500, message: 'Failed to generate discriminator' };
  }

  private sanitizeUser(user: IUser) {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      discriminator: user.discriminator,
      avatar: user.avatar,
      banner: user.banner,
      bio: user.bio,
      status: user.status,
      customStatus: user.customStatus,
      accentColor: user.accentColor,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();