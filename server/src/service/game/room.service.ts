import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Context } from 'egg';
import { Repository, In } from 'typeorm';
import { GameRoomEntity } from '../../entity/gameRoom.entity';
import { DefaultError } from '../../error/default.error';
import { BaseService } from '../base.service';
import { JWTService } from '../jwt.service';

import { CONFIG_APPAUTH_INFO } from '../../constant';
import { ConfigService } from '../config.service';
import { HttpService } from '../http.service';
import { RoomMemberService } from './roomMember.service';
import { SettlementService } from './settlement.service';

@Provide()
export class GameRoomService extends BaseService {
  @InjectEntityModel(GameRoomEntity)
  gameRoomEntity: Repository<GameRoomEntity>;

  @Inject()
  jwtService: JWTService;

  @Inject()
  http: HttpService;

  @Inject()
  ctx: Context;

  @Inject()
  configService: ConfigService;

  @Inject()
  roomMemberService: RoomMemberService;

  @Inject()
  settlementService: SettlementService;

  getTableName() {
    return this.gameRoomEntity.metadata.tableName;
  }

  // 根据房间号数组，查询状态为1的房间
  async findOpenRoom(roomNos: string[]) {
    const openRooms = await this.gameRoomEntity.find({
      where: {
        roomNo: In(roomNos), // 房间号数组
        status: 1, // 状态为1
      },
    });
    return openRooms;
  }

  async createRoom(userId: string) {
    let roomNo = this.nanoid(16);
    await this.gameRoomEntity.insert({
      roomNo: roomNo,
      createUserId: userId,
      roomName: userId + '的房间',
    });

    await this.roomMemberService.createRoomMember(userId, roomNo);
  }

  async closeRoom(roomNo: string) {
    await this.gameRoomEntity.update(
      {
        roomNo: roomNo,
      },
      {
        status: 0,
      }
    );
  }

  //结算
  async settle(roomNo: string) {
    await this.closeRoom(roomNo); //关闭房间
    const settlement = await this.settlementService.settlement(roomNo); //结算
    return settlement; //返回结算结果
  }

  async jsCode2session(code: string) {
    try {
      // 获取配置信息
      const config = await this.configService.getConfig(CONFIG_APPAUTH_INFO);
      // 发送请求，获取session
      const result = await this.http.get(
        'https://api.weixin.qq.com/sns/jscode2session',
        {
          js_code: code,
          appid: config.wxAppId,
          secret: config.wxAppSecret,
          grant_type: 'authorization_code',
        }
      );
      // 检查返回数据结构，可能需要从 result.data 中获取
      const data = result.data || result;

      // 添加错误处理
      if (data.errcode) {
        throw new DefaultError(`微信接口错误: ${data.errmsg || data.errcode}`);
      }

      const session = {
        openid: data.openid,
        session_key: data.session_key,
        unionid: data.unionid,
      };
      return session;
    } catch (err) {
      throw new DefaultError(err);
    }
  }

  async findByOpenid(openid: string) {
    return await this.gameRoomEntity.findOne({
      where: {
        openid,
      },
    });
  }

  // async createRoom(openid: string) {
  //   return await this.gameRoomEntity.insert({
  //     openid: openid,
  //     userId: this.nanoid(16),
  //   });
  // }
}
