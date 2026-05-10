import { Router, Request, Response } from 'express';
import { Server } from '../models/Server.js';
import { Channel } from '../models/Channel.js';
import { Role } from '../models/Role.js';
import { User } from '../models/User.js';
import { createServerSchema } from '../utils/validator.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 创建服务器
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createServerSchema.parse(req.body);
    
    // 创建默认角色
    const everyoneRole = await Role.create({
      name: '@everyone',
      color: '#99aab5',
      server: null, // 稍后更新
      permissions: '104324673',
      position: 0,
      hoist: false,
      mentionable: false,
    });

    // 创建默认频道
    const generalChannel = await Channel.create({
      name: 'general',
      type: 'text',
      server: null,
      position: 0,
    });

    // 创建服务器
    const server = await Server.create({
      ...data,
      owner: req.user!.userId,
      members: [{
        user: req.user!.userId,
        roles: [everyoneRole._id],
        joinedAt: new Date(),
      }],
      channels: [generalChannel._id],
      roles: [everyoneRole._id],
      categories: [{
        name: 'Text Channels',
        position: 0,
        channels: [generalChannel._id],
      }],
    });

    // 更新角色和频道的server引用
    everyoneRole.server = server._id;
    await everyoneRole.save();
    
    generalChannel.server = server._id;
    await generalChannel.save();

    // 将服务器添加到用户的服务器列表
    await User.findByIdAndUpdate(req.user!.userId, {
      $push: { servers: server._id },
    });

    // 填充数据返回
    const populatedServer = await Server.findById(server._id)
      .populate('channels')
      .populate('roles')
      .populate('members.user', 'username avatar discriminator status');

    res.status(201).json({ success: true, server: populatedServer });
  } catch (error: any) {
    if (error.issues) {
      res.status(400).json({ error: 'Validation Error', details: error.issues });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取服务器详情
router.get('/:serverId', async (req: Request, res: Response) => {
  try {
    const server = await Server.findById(req.params.serverId)
      .populate('channels')
      .populate('roles')
      .populate('members.user', 'username avatar discriminator status')
      .populate('owner', 'username avatar discriminator');

    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }

    res.json({ success: true, server });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 创建邀请链接
router.post('/:serverId/invites', async (req: Request, res: Response) => {
  try {
    const server = await Server.findById(req.params.serverId);
    
    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }

    const invite = {
      code: uuidv4().substring(0, 8),
      createdBy: req.user!.userId as any,
      uses: 0,
      maxUses: req.body.maxUses || 0,
      expiresAt: req.body.expiresAt || null,
      createdAt: new Date(),
    };

    server.invites.push(invite as any);
    await server.save();

    res.json({ success: true, invite });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 加入服务器（通过邀请码）
router.post('/join/:inviteCode', async (req: Request, res: Response) => {
  try {
    const server = await Server.findOne({
      'invites.code': req.params.inviteCode,
    });

    if (!server) {
      res.status(404).json({ error: 'Invalid invite code' });
      return;
    }

    const invite = server.invites.find(i => i.code === req.params.inviteCode);
    
    if (invite?.expiresAt && new Date(invite.expiresAt) < new Date()) {
      res.status(400).json({ error: 'Invite has expired' });
      return;
    }

    if (invite?.maxUses && invite.uses >= invite.maxUses) {
      res.status(400).json({ error: 'Invite has reached maximum uses' });
      return;
    }

    // 检查是否已经是成员
    const isMember = server.members.some(
      m => m.user.toString() === req.user?.userId
    );
    if (isMember) {
      res.status(400).json({ error: 'Already a member' });
      return;
    }

    // 添加成员
    const everyoneRole = server.roles[0];
    server.members.push({
      user: req.user!.userId as any,
      roles: [everyoneRole],
      joinedAt: new Date(),
    });

    // 更新邀请使用次数
    invite.uses += 1;
    await server.save();

    // 更新用户服务器列表
    await User.findByIdAndUpdate(req.user!.userId, {
      $push: { servers: server._id },
    });

    res.json({ success: true, serverId: server._id, name: server.name });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;