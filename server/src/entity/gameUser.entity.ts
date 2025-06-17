import { EntityModel } from '@midwayjs/orm';
import { Column } from 'typeorm';
import { Base } from './Base';

@EntityModel('game_users')
export class GameUserEntity extends Base {
  @Column({ unique: true, length: 16 })
  userId: string;

  @Column({ unique: true, length: 50 })
  openid: string;

  @Column({ length: 50, nullable: true })
  nickName: string;

  @Column({ length: 255, nullable: true })
  avatarUrl: string;
}
