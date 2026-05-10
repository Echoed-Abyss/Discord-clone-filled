import { Router, Request, Response } from 'express';
import { User } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { registerSchema, loginSchema } from '../utils/validator.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

// 注册
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    
    // 检查是否已存在
    const existingUser = await User.findOne({ 
      $or: [{ email: data.email }, { username: data.username }] 
    });
    
    if (existingUser) {
      res.status(400).json({
        error: 'Conflict',
        message: existingUser.email === data.email 
          ? 'Email already registered' 
          : 'Username already taken',
      });
      return;
    }

    // 生成discriminator
    const UserModel = User as any;
    const discriminator = await UserModel.generateDiscriminator(data.username);

    // 创建用户
    const user = await User.create({
      ...data,
      discriminator,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        discriminator: user.discriminator,
        avatar: user.avatar,
        status: user.status,
        accentColor: user.accentColor,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    if (error.issues) {
      res.status(400).json({ 
        error: 'Validation Error',
        details: error.issues 
      });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 登录
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    
    // 查找用户（包含密码字段）
    const user = await User.findOne({ email: data.email }).select('+password');
    
    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
      return;
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
      return;
    }

    // 更新在线状态
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        discriminator: user.discriminator,
        avatar: user.avatar,
        status: user.status,
        bio: user.bio,
        accentColor: user.accentColor,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    if (error.issues) {
      res.status(400).json({ 
        error: 'Validation Error',
        details: error.issues 
      });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取当前用户
router.get('/me', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId)
      .populate('servers')
      .populate('friends', 'username avatar status discriminator');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;