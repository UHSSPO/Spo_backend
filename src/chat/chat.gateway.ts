import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
  ) {}
  @WebSocketServer() server: Server; // WebSocket
  private logger: Logger = new Logger('ChatGateway');

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string): void {
    client.join(room);
    client.emit('joinedRoom', room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string): void {
    client.leave(room);
    client.emit('leftRoom', room);
    this.logger.log(`Client ${client.id} left room ${room}`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    client: Socket,
    payload: { sender: string; message: string },
  ) {
    const token = client.handshake.query.token as string;
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
    this.server.to(decoded.email).emit('message', payload);
    const roomId = decoded.email;
    await this.chatService.saveMessage(roomId, payload.sender, payload.message);
    this.server.to(roomId).emit('message', payload);
  }

  afterInit(server: Server) {
    this.logger.log('Init', server);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    const token: string = client.handshake.query.token as string;
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      client.join(payload.email);
      this.loadChatHistory(client, payload.email);
      this.logger.log(`Client connected: ${client.id}`);
    } catch (error) {
      this.logger.error('Invalid token', args);
      client.disconnect();
    }
  }

  async loadChatHistory(client: Socket, roomId: string) {
    const messages = await this.chatService.getMessages(roomId);
    client.emit('chatHistory', messages);
  }
}
