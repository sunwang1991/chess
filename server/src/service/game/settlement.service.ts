import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Context } from 'egg';
import { Repository } from 'typeorm';
import { GameSettlementEntity } from '../../entity/gameSettlement.entity';
// import { DefaultError } from '../../error/default.error';
import { BaseService } from '../base.service';
import { JWTService } from '../jwt.service';

// import { CONFIG_APPAUTH_INFO } from '../../constant';
import { ConfigService } from '../config.service';
import { HttpService } from '../http.service';

@Provide()
export class SettlementService extends BaseService {
  @InjectEntityModel(GameSettlementEntity)
  gameSettlementEntity: Repository<GameSettlementEntity>;

  @Inject()
  jwtService: JWTService;

  @Inject()
  http: HttpService;

  @Inject()
  ctx: Context;

  @Inject()
  configService: ConfigService;

  getTableName() {
    return this.gameSettlementEntity.metadata.tableName;
  }

  async addSettlement(roomNo: string, userId: string, amount: number) {
    return await this.gameSettlementEntity.insert({
      roomNo: roomNo,
      userId: userId,
      amount: amount,
    });
  }

  async findList(roomNo: string) {
    return await this.gameSettlementEntity.find({
      where: {
        roomNo: roomNo,
      },
    });
  }

  //结算
  async settlement(roomNo: string) {
    const list = await this.findList(roomNo);
    const userIds = list.map(item => item.userId);
    const userMap = {};
    userIds.forEach(userId => {
      userMap[userId] = 0;
    });
    list.forEach(item => {
      userMap[item.userId] += item.amount;
    });
    return userMap;
  }
}
