import { Channel } from '../models/Channel.js';
import { Server } from '../models/Server.js';

export class ChannelService {
  async createChannel(serverId: string, userId: string, data: {
    name: string;
    type: 'text' | 'voice' | 'announcement' | 'forum';
    topic?: string;
    isNSFW?: boolean;
    parentCategory?: string;
    slowMode?: number;
  }) {
    const server = await Server.findById(serverId);

    if (!server) {
      throw { status: 404, message: 'Server not found' };
    }

    const channel = await Channel.create({
      ...data,
      server: serverId,
      position: server.channels.length,
    });

    server.channels.push(channel._id);

    if (data.parentCategory) {
      const category = server.categories.find(
        (c) => c.name === data.parentCategory
      );
      if (category) {
        category.channels.push(channel._id);
      }
    }

    await server.save();

    return { channel };
  }

  async updateChannel(channelId: string, userId: string, data: any) {
    const channel = await Channel.findById(channelId);

    if (!channel) {
      throw { status: 404, message: 'Channel not found' };
    }

    const allowedUpdates = ['name', 'topic', 'isNSFW', 'slowMode', 'position'];
    const updates: any = {};

    for (const key of allowedUpdates) {
      if (data[key] !== undefined) {
        updates[key] = data[key];
      }
    }

    const updatedChannel = await Channel.findByIdAndUpdate(
      channelId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return { channel: updatedChannel };
  }

  async deleteChannel(channelId: string, userId: string) {
    const channel = await Channel.findById(channelId);

    if (!channel) {
      throw { status: 404, message: 'Channel not found' };
    }

    await Server.findByIdAndUpdate(channel.server, {
      $pull: { channels: channelId },
    });

    await channel.deleteOne();

    return { message: 'Channel deleted' };
  }

  async getChannel(channelId: string) {
    const channel = await Channel.findById(channelId);

    if (!channel) {
      throw { status: 404, message: 'Channel not found' };
    }

    return { channel };
  }

  async joinVoiceChannel(channelId: string, userId: string) {
    const channel = await Channel.findById(channelId);

    if (!channel || channel.type !== 'voice') {
      throw { status: 400, message: 'Not a voice channel' };
    }

    if (!channel.voiceMembers) {
      channel.voiceMembers = [];
    }

    if (!channel.voiceMembers.includes(userId as any)) {
      channel.voiceMembers.push(userId as any);
      await channel.save();
    }

    return {
      voiceMembers: channel.voiceMembers,
      channelId: channel._id,
    };
  }

  async leaveVoiceChannel(channelId: string, userId: string) {
    const channel = await Channel.findById(channelId);

    if (!channel || !channel.voiceMembers) {
      throw { status: 400, message: 'Not a voice channel' };
    }

    channel.voiceMembers = channel.voiceMembers.filter(
      (id) => id.toString() !== userId
    );

    await channel.save();

    return {
      voiceMembers: channel.voiceMembers,
      channelId: channel._id,
    };
  }

  async getVoiceMembers(channelId: string) {
    const channel = await Channel.findById(channelId).populate(
      'voiceMembers',
      'username avatar discriminator status'
    );

    if (!channel) {
      throw { status: 404, message: 'Channel not found' };
    }

    return { voiceMembers: channel.voiceMembers || [] };
  }
}

export const channelService = new ChannelService();