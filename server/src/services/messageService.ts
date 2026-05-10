import { Message } from '../models/Message.js';
import { Channel } from '../models/Channel.js';
import { Server } from '../models/Server.js';

export class MessageService {
  async getMessages(channelId: string, options: {
    page?: number;
    limit?: number;
    before?: string;
  } = {}) {
    const { page = 1, limit = 50, before } = options;

    const query: any = { channel: channelId };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username avatar discriminator status')
      .populate('mentions.users', 'username avatar discriminator')
      .populate('referencedMessage');

    const total = await Message.countDocuments(query);
    const hasMore = page * limit < total;

    return {
      messages: messages.reverse(),
      page,
      hasMore,
      total,
    };
  }

  async sendMessage(data: {
    content: string;
    channelId: string;
    authorId: string;
    serverId: string;
  }) {
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
      author: data.authorId,
      channel: data.channelId,
      server: data.serverId,
      mentions: {
        users: mentionedUsers,
        roles: [],
        everyone: everyoneMentioned,
      },
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('author', 'username avatar discriminator status')
      .populate('mentions.users', 'username avatar discriminator');

    return { message: populatedMessage };
  }

  async editMessage(messageId: string, userId: string, content: string) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw { status: 404, message: 'Message not found' };
    }

    if (message.author.toString() !== userId) {
      throw { status: 403, message: 'Can only edit your own messages' };
    }

    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('author', 'username avatar discriminator status');

    return { message: populatedMessage };
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw { status: 404, message: 'Message not found' };
    }

    if (message.author.toString() !== userId) {
      throw { status: 403, message: 'Can only delete your own messages' };
    }

    await message.deleteOne();

    return { message: 'Message deleted' };
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw { status: 404, message: 'Message not found' };
    }

    let reaction = message.reactions.find((r) => r.emoji === emoji);

    if (reaction) {
      // 已经反应过了，移除
      if (reaction.users.some((u) => u.toString() === userId)) {
        reaction.users = reaction.users.filter(
          (u) => u.toString() !== userId
        );
        if (reaction.users.length === 0) {
          message.reactions = message.reactions.filter(
            (r) => r.emoji !== emoji
          );
        }
      } else {
        // 添加反应
        reaction.users.push(userId as any);
      }
    } else {
      // 新建反应
      message.reactions.push({
        emoji,
        users: [userId as any],
      });
    }

    await message.save();

    return { reactions: message.reactions };
  }

  async searchMessages(serverId: string, query: string) {
    if (!query || query.length < 2) {
      throw { status: 400, message: 'Search query too short' };
    }

    const messages = await Message.find({
      server: serverId,
      $text: { $search: query },
    })
      .populate('author', 'username avatar discriminator')
      .populate('channel', 'name')
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .limit(25);

    return { messages };
  }

  async getPinnedMessages(channelId: string) {
    // 假设有pinned字段，这里只是示例
    const messages = await Message.find({
      channel: channelId,
      // pinned: true,
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username avatar discriminator');

    return { messages };
  }

  async bulkDeleteMessages(messageIds: string[], userId: string) {
    if (messageIds.length === 0) {
      throw { status: 400, message: 'No messages specified' };
    }

    if (messageIds.length > 100) {
      throw { status: 400, message: 'Can only delete up to 100 messages at once' };
    }

    const result = await Message.deleteMany({
      _id: { $in: messageIds },
      author: userId,
    });

    return {
      message: `${result.deletedCount} messages deleted`,
      deletedCount: result.deletedCount,
    };
  }
}

export const messageService = new MessageService();