import { EntityModel } from '@midwayjs/orm';
import { Column } from 'typeorm';
import { CommonBase } from './Base';

@EntityModel('room_members')
export class RoomMemberEntity extends CommonBase {
  @Column({ type: 'char', length: 16, comment: '房间编号' })
  roomNo: string;

  @Column({ type: 'char', length: 50, comment: '成员userid' })
  userId: string;

  @Column({ type: 'int', default: 0, comment: '成员角色: 0-普通成员, 1-房主' })
  role: 0 | 1;

  @Column({ type: 'int', default: 1, comment: '状态: 0-离开, 1-在房间中' })
  status: 0 | 1;
}
