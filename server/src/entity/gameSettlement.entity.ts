import { EntityModel } from '@midwayjs/orm';
import { Column } from 'typeorm';
import { CommonBase } from './Base';

@EntityModel('game_settlements')
export class GameSettlementEntity extends CommonBase {
  @Column({ type: 'char', length: 16, comment: '房间号' })
  roomNo: string;

  @Column({ type: 'char', length: 50, comment: '玩家userid' })
  userId: string;

  @Column({ type: 'double', comment: '输赢金额' })
  amount: number;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '备注' })
  remark: string;
}
