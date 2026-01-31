import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { KitchenJoinDto } from './dto/kitchen-join.dto';

@WebSocketGateway({
  namespace: 'kitchen',
  cors: { origin: '*' },
})
export class KitchenGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('kitchen:join')
  async handleJoin(
    @MessageBody() body: KitchenJoinDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = body?.room?.trim() || 'kitchen';
    await client.join(room);
    return { ok: true, room };
  }

  broadcastOrderSent(payload: unknown) {
    this.server.to('kitchen').emit('order:sent', payload);
  }

  broadcastItemUpdated(payload: unknown) {
    this.server.to('kitchen').emit('order:item:updated', payload);
  }

  broadcastOrderReady(payload: unknown) {
    this.server.to('cashier').emit('order:ready', payload);
  }
}
