import { Schema, Document } from 'mongoose';

export const ChatSchema = new Schema({
  roomId: String,
  sender: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

export interface Chat extends Document {
  id?: string;
  roomId: string;
  sender: string;
  message: string;
  timestamp: Date;
}
