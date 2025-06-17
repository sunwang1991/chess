import { IMiddleware, NextFunction } from '@midwayjs/core';
import { Middleware } from '@midwayjs/decorator';
import { Context } from 'egg';
import { LoginError } from '../error/login.error';
import { QQService } from '../service/qq/qq.service';
import { ToutiaoService } from '../service/toutiao/toutiao.service';
import { WxappService } from '../service/wxapp.service';

@Middleware()
export class AppMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const wxappService = await ctx.requestContext.getAsync(WxappService);
      const qqappService = await ctx.requestContext.getAsync(QQService);
      const ttappService = await ctx.requestContext.getAsync(ToutiaoService);
      const wxappNo = ctx.request.header.wxappno as string;
      const qqappNo = ctx.request.header.qqappno as string;
      const ttappNo = ctx.request.header.ttappno as string;
      if (!wxappNo && !qqappNo && !ttappNo) {
        throw new LoginError('请重新登录');
      }
      // 用户端类型
      let userType = '';
      let user = null as any;
      if (wxappNo) {
        user = await wxappService.findByNo(wxappNo);
        userType = 'weixin';
      } else if (qqappNo) {
        user = await qqappService.qqappEntity.findOne({ where: { qqappNo } });
        userType = 'qq';
      } else if (ttappNo) {
        user = await ttappService.ttappEntity.findOne({ where: { ttappNo } });
        userType = 'toutiao';
      }
      if (!user) {
        throw new LoginError('请重新登录');
      }

      if (!user.userNo) {
        throw new LoginError('请先登录/注册');
      }
      ctx.userInfo = Object.assign(user, { userType });
      ctx.userInfo = user;
      return await next();
    };
  }
}
