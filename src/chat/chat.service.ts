import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './chat.schema';

@Injectable()
export class ChatService {
  constructor(@InjectModel('ChatMessage') private chatModel: Model<Chat>) {}

  async saveMessage(
    roomId: string,
    sender: string,
    message: string,
  ): Promise<Chat> {
    const newMessage = new this.chatModel({ roomId, sender, message });
    return await newMessage.save();
  }

  async getMessages(roomId: string): Promise<Chat[]> {
    return await this.chatModel.find({ roomId }).exec();
  }
}
