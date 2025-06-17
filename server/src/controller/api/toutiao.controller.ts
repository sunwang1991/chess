import { Controller, Get, Inject, Query } from '@midwayjs/decorator';
import { Validate } from '@midwayjs/validate';
import { CONFIG_APPAUTH_INFO } from '../../constant';
import { AppauthUpsertDTO } from '../../dto/config.dto';
import { WxappLoginDTO } from '../../dto/wxapp.dto';
import { DefaultError } from '../../error/default.error';
import { ConfigService } from '../../service/config.service';
import { HttpService } from '../../service/http.service';
import { ToutiaoService } from '../../service/toutiao/toutiao.service';
import { UserService } from '../../service/user.service';
import { BaseController } from '../base.controller';

@Controller('/api/toutiao')
export class ToutiaoController extends BaseController {
  @Inject()
  configService: ConfigService;

  @Inject()
  httpService: HttpService;

  @Inject()
  userService: UserService;

  @Inject()
  toutiaoService: ToutiaoService;

  @Get('/login')
  @Validate()
  async login(@Query() loginDTO: WxappLoginDTO) {
    // 获取小程序配置
    const result = (await this.configService.getConfig(
      CONFIG_APPAUTH_INFO
    )) as AppauthUpsertDTO;
    if (!result.ttAppid || !result.ttAppSecret) {
      throw new DefaultError('暂无凭证信息配置');
    }
    const res = (await this.httpService.post(
      'https://developer.toutiao.com/api/apps/v2/jscode2session',
      {
        appid: result.ttAppid,
        secret: result.ttAppSecret,
        code: loginDTO.code,
      }
    )) as {
      err_no?: number;
      err_tips?: string;
      data: {
        openid?: string;
        session_key?: string;
        unionid?: string;
      };
    };
    if (res.err_no !== 0) {
      throw new DefaultError(res.err_tips);
    }
    const findRes = await this.toutiaoService.findByOpenid(res.data.openid);
    if (!findRes) {
      const ttappNo = this.nanoid(32);
      await this.toutiaoService.ttappEntity.insert({
        openid: res.data.openid,
        ttappNo,
        unionid: res.data.unionid,
      });
      return this.responseSuccess('ok', { ttappNo });
    }
    if (findRes.userNo) {
      const user = await this.userService.findByNo(findRes.userNo);
      if (user) {
        return this.responseSuccess('ok', {
          ttappNo: findRes.ttappNo,
          user: this.userService.getUserInfo(user),
        });
      }
    }
    return this.responseSuccess('ok', { ttappNo: findRes.ttappNo });
  }
}
