import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { TTappEntity } from '../../entity/ttapp.entity';
import { BaseService } from '../base.service';

@Provide()
export class ToutiaoService extends BaseService {
  @InjectEntityModel(TTappEntity)
  ttappEntity: Repository<TTappEntity>;

  async findByOpenid(openid: string) {
    return await this.ttappEntity.findOne({ where: { openid } });
  }
}
