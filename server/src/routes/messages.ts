import { Router, Request, Response } from 'express';
import { Message } from '../models/Message.js';
import { Channel } from '../models/Channel.js';
import { sendMessageSchema } from '../utils/validator.js';
import { messageLimiter } from '../middleware/rateLimit.js';

const router = Router();

// 获取频道消息（分页）
router.get('/:channelId', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const before = req.query.before as string;

    let query: any = { channel: req.params.channelId };
    
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username avatar discriminator status')
      .populate('mentions.users', 'username avatar discriminator');

    const total = await Message.countDocuments(query);
    const hasMore = (page * limit) < total;

    res.json({
      success: true,
      messages: messages.reverse(),
      page,
      hasMore,
      total,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 发送消息
router.post('/:channelId', messageLimiter, async (req: Request, res: Response) => {
  try {
    const data = sendMessageSchema.parse(req.body);
    const channel = await Channel.findById(req.params.channelId);
    
    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    // 解析提及
    const mentionRegex = /<@!?(\w+)>/g;
    const mentionedUsers: string[] = [];
    let match;
    while ((match = mentionRegex.exec(data.content)) !== null) {
      mentionedUsers.push(match[1]);
    }

    const everyoneMentioned = data.content.includes('@everyone');

    const message = await Message.create({
      content: data.content,
      author: req.user!.userId,
      channel: channel._id,
      server: channel.server,
      mentions: {
        users: mentionedUsers,
        roles: [],
        everyone: everyoneMentioned,
      },
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('author', 'username avatar discriminator status');

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error: any) {
    if (error.issues) {
      res.status(400).json({ error: 'Validation Error', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 编辑消息
router.patch('/:messageId', async (req: Request, res: Response) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    if (message.author.toString() !== req.user?.userId) {
      res.status(403).json({ error: 'Can only edit your own messages' });
      return;
    }

    message.content = req.body.content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除消息
router.delete('/:messageId', async (req: Request, res: Response) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    if (message.author.toString() !== req.user?.userId) {
      res.status(403).json({ error: 'Can only delete your own messages' });
      return;
    }

    await message.deleteOne();
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 添加反应
router.post('/:messageId/reactions', async (req: Request, res: Response) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    let reaction = message.reactions.find(r => r.emoji === emoji);
    
    if (reaction) {
      if (reaction.users.includes(req.user!.userId as any)) {
        // 移除反应
        reaction.users = reaction.users.filter(
          u => u.toString() !== req.user?.userId
        );
        if (reaction.users.length === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        // 添加反应
        reaction.users.push(req.user!.userId as any);
      }
    } else {
      // 新建反应
      message.reactions.push({
        emoji,
        users: [req.user!.userId as any],
      });
    }

    await message.save();
    res.json({ success: true, reactions: message.reactions });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 搜索消息
router.get('/search/:serverId', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || query.length < 2) {
      res.status(400).json({ error: 'Search query too short' });
      return;
    }

    const messages = await Message.find({
      server: req.params.serverId,
      $text: { $search: query },
    })
    .populate('author', 'username avatar discriminator')
    .populate('channel', 'name')
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .limit(25);

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;