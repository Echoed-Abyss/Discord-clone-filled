import { Router, Request, Response } from 'express';
import { User } from '../models/User.js';

const router = Router();

// 获取用户信息
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -email')
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

// 更新用户资料
router.patch('/:userId', async (req: Request, res: Response) => {
  try {
    // 只能更新自己的资料
    if (req.user?.userId !== req.params.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const allowedUpdates = ['username', 'bio', 'avatar', 'banner', 'accentColor', 'customStatus'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 发送好友请求
router.post('/:userId/friend-request', async (req: Request, res: Response) => {
  try {
    const fromUser = await User.findById(req.user?.userId);
    const toUser = await User.findById(req.params.userId);

    if (!toUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // 检查是否已经是好友
    if (fromUser?.friends.includes(toUser._id)) {
      res.status(400).json({ error: 'Already friends' });
      return;
    }

    // 检查是否已有待处理的请求
    const existingRequest = toUser.friendRequests.find(
      r => r.from.toString() === req.user?.userId && r.status === 'pending'
    );
    if (existingRequest) {
      res.status(400).json({ error: 'Friend request already sent' });
      return;
    }

    toUser.friendRequests.push({
      from: fromUser!._id,
      status: 'pending',
      createdAt: new Date(),
    });

    await toUser.save();

    res.json({ success: true, message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 搜索用户
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || query.length < 2) {
      res.status(400).json({ error: 'Search query too short' });
      return;
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
    .select('username discriminator avatar status')
    .limit(20);

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;