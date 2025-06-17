import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Context } from 'egg';
import { Repository } from 'typeorm';
import { RoomMemberEntity } from '../../entity/roomMember.entity';
// import { DefaultError } from '../../error/default.error';
import { BaseService } from '../base.service';
import { JWTService } from '../jwt.service';

// import { CONFIG_APPAUTH_INFO } from '../../constant';
import { ConfigService } from '../config.service';
import { HttpService } from '../http.service';

@Provide()
export class RoomMemberService extends BaseService {
  @InjectEntityModel(RoomMemberEntity)
  roomMemberEntity: Repository<RoomMemberEntity>;

  @Inject()
  jwtService: JWTService;

  @Inject()
  http: HttpService;

  @Inject()
  ctx: Context;

  @Inject()
  configService: ConfigService;

  getTableName() {
    return this.roomMemberEntity.metadata.tableName;
  }

  async findByUserid(userId: string) {
    return await this.roomMemberEntity.find({
      where: {
        userId: userId,
      },
    });
  }

  async findByRoomNo(roomNo: string) {
    return await this.roomMemberEntity.find({
      where: {
        roomNo: roomNo,
      },
    });
  }

  async createRoomMember(userId: string, roomNo: string) {
    return await this.roomMemberEntity.insert({
      roomNo: roomNo,
      userId: userId,
    });
  }

  // async createRoom(openid: string) {
  //   return await this.gameRoomEntity.insert({
  //     openid: openid,
  //     userId: this.nanoid(16),
  //   });
  // }
}
