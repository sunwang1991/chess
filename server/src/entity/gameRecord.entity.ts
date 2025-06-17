import { EntityModel } from '@midwayjs/orm';
import { Column } from 'typeorm';
import { CommonBase } from './Base';

@EntityModel('game_records')
export class GameRecordEntity extends CommonBase {
  @Column({ type: 'char', length: 16, unique: true, comment: '游戏记录编号' })
  recordNo: string;
  
  @Column({ type: 'char', length: 16, comment: '房间编号' })
  roomNo: string;
  
  @Column({ type: 'varchar', length: 50, comment: '游戏类型' })
  gameType: string;
  
  @Column({ type: 'datetime', comment: '开始时间' })
  startTime: Date;
  
  @Column({ type: 'datetime', nullable: true, comment: '结束时间' })
  endTime: Date;
  
  @Column({ type: 'int', default: 0, comment: '状态: 0-进行中, 1-已结束' })
  status: 0 | 1;
}