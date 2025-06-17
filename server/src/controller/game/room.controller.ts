import { Controller, Post, Inject, Body } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';

import { BaseController } from '../base.controller';
import { GameRoomEntity } from '../../entity/gameRoom.entity';
import { HttpService } from '../../service/http.service';
import { JWTService } from '../../service/jwt.service';
import { ConfigService } from '../../service/config.service';
import { GameRoomService } from '../../service/game/room.service';
import { RoomMemberService } from '../../service/game/roomMember.service';
import { SettlementService } from '../../service/game/settlement.service';
import { RoomMemberEntity } from '../../entity/roomMember.entity';
import { GameUserService } from '../../service/game/user.service';

@Controller('/game/room')
export class gameRoomController extends BaseController {
  @Inject()
  configService: ConfigService;

  @Inject()
  httpService: HttpService;

  @Inject()
  jwtService: JWTService;

  @Inject()
  gameRoomService: GameRoomService;

  @Inject()
  roomMemberService: RoomMemberService;

  @Inject()
  settlementService: SettlementService;

  @Inject()
  gameUserService: GameUserService;

  @InjectEntityModel(GameRoomEntity)
  gameRoomEntity: Repository<GameRoomEntity>;

  @InjectEntityModel(RoomMemberEntity)
  roomMemberEntity: Repository<RoomMemberEntity>;

  @Post('/createRoom')
  async createRoom() {
    const userid = this.ctx.request.header.userid as string;
    const rooms = await this.roomMemberService.findByUserid(userid);
    if (rooms.length > 0) {
      let roomNos: string[] = rooms.map(room => room.roomNo);
      let openRooms = await this.gameRoomService.findOpenRoom(roomNos);
      if (openRooms.length > 0) {
        const roomNo = openRooms[0].roomNo;
        const roomMembers = await this.roomMemberService.findByRoomNo(roomNo);
        //根据房间号查询支付记录，进行统计
        const settlement = await this.settlementService.findList(roomNo);
        const userIds = roomMembers.map(member => member.userId);
        const userInfos = await this.gameUserService.findByUserIds(userIds);
        const roomSettlement = roomMembers.map(member => {
          const nickName = userInfos.find(
            i => i.userId === member.userId
          ).nickName;
          const avatarUrl = userInfos.find(
            i => i.userId === member.userId
          ).avatarUrl;
          return {
            status: member.status,
            userId: member.userId,
            nickName: nickName,
            avatarUrl: avatarUrl,
            role: member.role,
            total: settlement
              .filter(item => item.userId == member.userId)
              .reduce((pre, cur) => pre + cur.amount, 0),
          };
        });

        let resObj = {
          roomName: openRooms[0].roomName,
          roomNo: openRooms[0].roomNo,
          createUserId: openRooms[0].createUserId,
          status: openRooms[0].status,
          roomMembers: roomSettlement,
        };
        return this.responseSuccess('ok', resObj);
      } else {
        await this.gameRoomService.createRoom(userid);
        return this.responseSuccess('ok', '创建成功');
      }
    } else {
      await this.gameRoomService.createRoom(userid);
      return this.responseSuccess('ok', '创建成功');
    }
  }

  @Post('/pay')
  async pay(@Body() data: { roomNo: string; amount: number; userId: string }) {
    const userId = this.ctx.request.header.userid as string;
    console.log('data', data);
    // 扣除自己账户
    await this.settlementService.addSettlement(
      data.roomNo,
      userId,
      -data.amount
    );
    // 增加对方账户
    await this.settlementService.addSettlement(
      data.roomNo,
      data.userId,
      data.amount
    );
    return this.responseSuccess('ok', '支付成功');
  }

  @Post('/joinRoom')
  async joinRoom(@Body() data: { roomNo: string }) {
    const userId = 'test_openid123456';
    const room = await this.gameRoomService.findOpenRoom([data.roomNo]);
    if (!room.length) {
      throw new Error('房间不存在');
    }
    await this.roomMemberService.createRoomMember(userId, room[0].roomNo);
    return this.responseSuccess('ok', '加入成功');
  }

  //结算
  @Post('/settlement')
  async settlement(@Body() data: { roomNo: string }) {
    const room = await this.gameRoomService.findOpenRoom([data.roomNo]);
    if (!room.length) {
      throw new Error('房间不存在');
    }
    let settleData = await this.gameRoomService.settle(data.roomNo);
    return this.responseSuccess('ok', settleData);
  }
}
