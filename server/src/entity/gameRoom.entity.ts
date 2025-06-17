import { EntityModel } from '@midwayjs/orm';
import { Column } from 'typeorm';
import { CommonBase } from './Base';

@EntityModel('game_rooms')
export class GameRoomEntity extends CommonBase {
  @Column({ type: 'char', length: 16, unique: true, comment: '房间编号' })
  roomNo: string;

  @Column({ type: 'varchar', length: 50, comment: '房间名称' })
  roomName: string;

  @Column({ type: 'char', length: 50, comment: '创建者userid' })
  createUserId: string;

  @Column({ type: 'int', default: 1, comment: '房间状态: 0-关闭, 1-开放' })
  status: 0 | 1;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '备注' })
  remark: string;
}
