import { Server } from '../models/Server.js';
import { Channel } from '../models/Channel.js';
import { Role } from '../models/Role.js';
import { User } from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

export class ServerService {
  async createServer(data: { name: string; description?: string }, ownerId: string) {
    // 创建默认角色
    const everyoneRole = await Role.create({
      name: '@everyone',
      color: '#99aab5',
      permissions: '104324673',
      position: 0,
      hoist: false,
      mentionable: false,
    });

    // 创建默认文字频道
    const generalChannel = await Channel.create({
      name: 'general',
      type: 'text',
      position: 0,
    });

    // 创建默认语音频道
    const voiceChannel = await Channel.create({
      name: 'General',
      type: 'voice',
      position: 1,
    });

    // 创建服务器
    const server = await Server.create({
      name: data.name,
      description: data.description,
      owner: ownerId,
      members: [
        {
          user: ownerId,
          roles: [everyoneRole._id],
          joinedAt: new Date(),
        },
      ],
      channels: [generalChannel._id, voiceChannel._id],
      roles: [everyoneRole._id],
      categories: [
        {
          name: 'Text Channels',
          position: 0,
          channels: [generalChannel._id],
        },
        {
          name: 'Voice Channels',
          position: 1,
          channels: [voiceChannel._id],
        },
      ],
    });

    // 更新角色和频道的server引用
    everyoneRole.server = server._id;
    await everyoneRole.save();

    generalChannel.server = server._id;
    await generalChannel.save();

    voiceChannel.server = server._id;
    await voiceChannel.save();

    // 添加到用户的服务器列表
    await User.findByIdAndUpdate(ownerId, {
      $push: { servers: server._id },
    });

    const populatedServer = await Server.findById(server._id)
      .populate('channels')
      .populate('roles')
      .populate('members.user', 'username avatar discriminator status');

    return { server: populatedServer };
  }

  async getServer(serverId: string, userId: string) {
    const server = await Server.findById(serverId)
      .populate('channels')
      .populate('roles')
      .populate('members.user', 'username avatar discriminator status')
      .populate('owner', 'username avatar discriminator');

    if (!server) {
      throw { status: 404, message: 'Server not found' };
    }

    // 检查是否是成员
    const isMember = server.members.some(
      (m) => m.user._id.toString() === userId
    );

    if (!isMember) {
      throw { status: 403, message: 'Not a member of this server' };
    }

    return { server };
  }

  async getUserServers(userId: string) {
    const servers = await Server.find({
      'members.user': userId,
    })
      .populate('channels')
      .populate('members.user', 'username avatar discriminator status')
      .sort({ updatedAt: -1 });

    return { servers };
  }

  async updateServer(serverId: string, userId: string, data: any) {
    const server = await Server.findById(serverId);

    if (!server) {
      throw { status: 404, message: 'Server not found' };
    }

    if (server.owner.toString() !== userId) {
      throw { status: 403, message: 'Only the server owner can update server' };
    }

    const allowedUpdates = ['name', 'description', 'icon', 'banner'];
    const updates: any = {};

    for (const key of allowedUpdates) {
      if (data[key] !== undefined) {
        updates[key] = data[key];
      }
    }

    const updatedServer = await Server.findByIdAndUpdate(
      serverId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('channels');

    return { server: updatedServer };
  }

  async deleteServer(serverId: string, userId: string) {
    const server = await Server.findById(serverId);

    if (!server) {
      throw { status: 404, message: 'Server not found' };
    }

    if (server.owner.toString() !== userId) {
      throw { status: 403, message: 'Only the server owner can delete server' };
    }

    // 删除所有频道和角色
    await Channel.deleteMany({ server: serverId });
    await Role.deleteMany({ server: serverId });

    // 从用户中移除服务器
    await User.updateMany(
      { servers: serverId },
      { $pull: { servers: serverId } }
    );

    await server.deleteOne();

    return { message: 'Server deleted' };
  }

  async createInvite(serverId: string, userId: string, options?: { maxUses?: number; expiresIn?: number }) {
    const server = await Server.findById(serverId);

    if (!server) {
      throw { status: 404, message: 'Server not found' };
    }

    const isMember = server.members.some((m) => m.user.toString() === userId);
    if (!isMember) {
      throw { status: 403, message: 'Not a member' };
    }

    const invite = {
      code: uuidv4().substring(0, 8),
      createdBy: userId as any,
      uses: 0,
      maxUses: options?.maxUses || 0,
      expiresAt: options?.expiresIn
        ? new Date(Date.now() + options.expiresIn * 1000)
        : undefined,
      createdAt: new Date(),
    };

    server.invites.push(invite as any);
    await server.save();

    return { invite };
  }

  async joinServer(inviteCode: string, userId: string) {
    const server = await Server.findOne({
      'invites.code': inviteCode,
    });

    if (!server) {
      throw { status: 404, message: 'Invalid invite code' };
    }

    const invite = server.invites.find((i) => i.code === inviteCode);

    if (invite?.expiresAt && new Date(invite.expiresAt) < new Date()) {
      throw { status: 400, message: 'Invite has expired' };
    }

    if (invite?.maxUses && invite.uses >= invite.maxUses) {
      throw { status: 400, message: 'Invite has reached maximum uses' };
    }

    const isMember = server.members.some(
      (m) => m.user.toString() === userId
    );

    if (isMember) {
      throw { status: 400, message: 'Already a member' };
    }

    const everyoneRole = server.roles[0];
    server.members.push({
      user: userId as any,
      roles: [everyoneRole],
      joinedAt: new Date(),
    });

    invite!.uses += 1;
    await server.save();

    await User.findByIdAndUpdate(userId, {
      $push: { servers: server._id },
    });

    return { serverId: server._id, name: server.name };
  }

  async getServerMembers(serverId: string, userId: string) {
    const server = await Server.findById(serverId)
      .populate('members.user', 'username avatar discriminator status');

    if (!server) {
      throw { status: 404, message: 'Server not found' };
    }

    return { members: server.members };
  }
}

export const serverService = new ServerService();