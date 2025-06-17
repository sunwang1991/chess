import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { CityListDTO } from '../dto/city.dto';
import { CitysEntity } from '../entity/citys.entity';
import { CitysTagGroupEntity } from '../entity/citysTagGroup.entity';
import { CitysWeightTagEntity } from '../entity/citysWeightTag.entity';
import { OrderEntity } from '../entity/orders.entity';
import { BaseService } from './base.service';
import { OrderService } from './order.service';
import { QueryService } from './query.service';
import { CorwxService } from './wx/corwx.service';
const dayjs = require('dayjs');

@Provide()
export class CitysService extends BaseService {
  @InjectEntityModel(CitysEntity)
  citysEntity: Repository<CitysEntity>;

  @InjectEntityModel(CitysTagGroupEntity)
  tagEntity: Repository<CitysTagGroupEntity>;

  @InjectEntityModel(CitysWeightTagEntity)
  weightEntity: Repository<CitysWeightTagEntity>;

  @Inject()
  queryService: QueryService;

  @Inject()
  corwxService: CorwxService;

  @Inject()
  orderService: OrderService;

  async list(listDTO: CityListDTO) {
    let wheres = '';
    if (listDTO.cityName)
      wheres += ` ${wheres ? 'and' : ''} cityName like "%${listDTO.cityName}%"`;

    if (listDTO.province) {
      wheres += ` ${wheres ? 'and' : ''} province like "%${listDTO.province}%"`;
    }

    if (listDTO.status !== undefined) {
      wheres += `  ${wheres ? 'and' : ''} status = ${listDTO.status}`;
    }

    return await this.queryService.select(this.citysEntity, {
      tables: this.citysEntity.metadata.tableName,
      wheres,
      current: listDTO.current,
      pageSize: listDTO.pageSize,
    });
  }

  async findByNo(no: string) {
    return await this.citysEntity.findOne({ where: { cityNo: no } });
  }

  async findByCity(province: string, key: string) {
    return await this.citysEntity.findOne({
      where: { province, cityName: key },
    });
  }

  async findByOnlyCity(city: string) {
    return await this.citysEntity.findOne({
      where: { cityName: city },
    });
  }

  async tagFindById(id: number) {
    return await this.tagEntity.findOne({ where: { id } });
  }

  async weightFindById(id: number) {
    return await this.weightEntity.findOne({ where: { id } });
  }

  /**
   * 发送一条订单信息
   */
  async sendMessageToChat(order: OrderEntity) {
    const city = await this.citysEntity.findOne({
      where: { cityName: order.city },
    });
    if (city && city.corwxChatid) {
      await this.corwxService.sendMarkdownMessage(
        city.corwxChatid,
        `有新订单
        >**详情**
        >下单时间: ${dayjs(order.createTime).format('YYYY-MM-DD HH:mm')}
        >订单类型: ${this.orderService.getServiceTypeLabel(order.serviceType)}
        >订单金额: ${order.payAmount}元
        >重量路程: ${order.weight}kg ${
          order.distance >= 1000
            ? this.filterNumber(order.distance / 1000) + 'km'
            : order.distance + 'm'
        }
        >物品描述: ${order.goodsDesc}
        `
      );
    }
  }
}
