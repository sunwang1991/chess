import { Controller, Post, Inject, Body } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';

import { BaseController } from '../base.controller';
import { GameUserEntity } from '../../entity/gameUser.entity';
import { HttpService } from '../../service/http.service';
import { JWTService } from '../../service/jwt.service';
import { ConfigService } from '../../service/config.service';
import { GameUserService } from '../../service/game/user.service';

@Controller('/game/user')
export class gameUserController extends BaseController {
  @Inject()
  configService: ConfigService;

  @Inject()
  httpService: HttpService;

  @Inject()
  jwtService: JWTService;

  @Inject()
  gameUserService: GameUserService;

  @InjectEntityModel(GameUserEntity)
  gameUserEntity: Repository<GameUserEntity>;

  @Post('/login')
  async login(@Body() data: { code: string }) {
    const session = await this.gameUserService.jsCode2session(data.code);
    const user = await this.gameUserService.findByOpenid(session.openid);
    if (!user) {
      //创建新用户
      await this.gameUserService.createUser(session.openid);
      return this.responseSuccess('ok', '创建成功');
    }
    return this.responseSuccess('ok', {
      avatarUrl: user.avatarUrl,
      nickName: user.nickName,
      userId: user.userId,
    });
  }

  @Post('/update')
  async update(@Body() data: { avatarUrl: string; nickName: string }) {
    const userId = this.ctx.request.header.userid as string; //获取用户id
    await this.gameUserService.updateUser(
      userId,
      data.avatarUrl,
      data.nickName
    );
    return this.responseSuccess('ok', '更新成功');
  }
}
