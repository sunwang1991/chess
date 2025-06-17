import { EntityModel } from '@midwayjs/orm';
import { Column } from 'typeorm';
import { Base } from './Base';
// 字节跳动
@EntityModel('ttapp')
export class TTappEntity extends Base {
  @Column({ type: 'char', length: 32, unique: true, comment: '用户编号' })
  ttappNo: string;

  @Column({ type: 'varchar', length: 36, unique: true })
  openid: string;

  @Column({ type: 'char', length: 16, nullable: true })
  userNo: string;

  @Column({ type: 'varchar', length: 36, unique: true })
  unionid: string;
}
