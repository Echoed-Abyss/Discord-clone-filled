import { Router, Request, Response } from 'express';
import { Channel } from '../models/Channel.js';
import { Server } from '../models/Server.js';
import { createChannelSchema } from '../utils/validator.js';

const router = Router();

// 创建频道
router.post('/server/:serverId', async (req: Request, res: Response) => {
  try {
    const data = createChannelSchema.parse(req.body);
    const server = await Server.findById(req.params.serverId);
    
    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }

    const channel = await Channel.create({
      ...data,
      server: server._id,
      position: server.channels.length,
    });

    // 添加到服务器
    server.channels.push(channel._id);
    
    // 添加到分类
    if (data.parentCategory) {
      const category = server.categories.find(c => c.name === data.parentCategory);
      if (category) {
        category.channels.push(channel._id);
      }
    }
    
    await server.save();

    res.status(201).json({ success: true, channel });
  } catch (error: any) {
    if (error.issues) {
      res.status(400).json({ error: 'Validation Error', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 加入语音频道
router.post('/:channelId/join-voice', async (req: Request, res: Response) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    
    if (!channel || channel.type !== 'voice') {
      res.status(400).json({ error: 'Not a voice channel' });
      return;
    }

    if (!channel.voiceMembers) channel.voiceMembers = [];
    
    if (!channel.voiceMembers.includes(req.user!.userId as any)) {
      channel.voiceMembers.push(req.user!.userId as any);
      await channel.save();
    }

    res.json({ success: true, voiceMembers: channel.voiceMembers });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;