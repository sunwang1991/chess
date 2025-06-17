import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Context } from 'egg';
import { Repository, In } from 'typeorm';
import { GameUserEntity } from '../../entity/gameUser.entity';
import { DefaultError } from '../../error/default.error';
import { BaseService } from '../base.service';
import { JWTService } from '../jwt.service';

import { CONFIG_APPAUTH_INFO } from '../../constant';
import { ConfigService } from '../config.service';
import { HttpService } from '../http.service';

@Provide()
export class GameUserService extends BaseService {
  @InjectEntityModel(GameUserEntity)
  gameUserModel: Repository<GameUserEntity>;

  @Inject()
  jwtService: JWTService;

  @Inject()
  http: HttpService;

  @Inject()
  ctx: Context;

  @Inject()
  configService: ConfigService;

  getTableName() {
    return this.gameUserModel.metadata.tableName;
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
    return await this.gameUserModel.findOne({
      where: {
        openid,
      },
    });
  }

  async findByUserId(userId: string) {
    return await this.gameUserModel.findOne({
      where: {
        userId,
      },
    });
  }

  findByUserIds(userIds: string[]) {
    return this.gameUserModel.find({
      where: {
        userId: In(userIds),
      },
    });
  }

  async createUser(openid: string) {
    return await this.gameUserModel.insert({
      openid: openid,
      userId: this.nanoid(16),
    });
  }

  //更新头像或者昵称
  async updateUser(userId: string, avatarUrl: string, nickName: string) {
    return await this.gameUserModel.update(
      {
        userId,
      },
      {
        avatarUrl,
        nickName,
      }
    );
  }
}
