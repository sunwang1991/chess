import { Inject, Provide } from '@midwayjs/decorator';
import { CONFIG_CORWX_INFO, CORWX_ACCESSTOKEN } from '../../constant';
import { ConfigCorwxDTO } from '../../dto/config.dto';
import { DefaultError } from '../../error/default.error';
import { BaseService } from '../base.service';
import { ConfigService } from '../config.service';

// 企业微信
@Provide()
export class CorwxService extends BaseService {
  @Inject()
  configService: ConfigService;

  async getAccessToken() {
    const accessToken = await this.redis.get(CORWX_ACCESSTOKEN);
    if (accessToken) {
      return accessToken;
    }
    const config = (await this.configService.getConfig(
      CONFIG_CORWX_INFO
    )) as ConfigCorwxDTO;

    const result = (await this.http.get(
      'https://qyapi.weixin.qq.com/cgi-bin/gettoken',
      {
        corpid: config.corpid,
        corpsecret: config.corpsecret,
      }
    )) as { access_token?: string; errmsg?: string; expires_in?: number };
    if (!result.access_token) {
      throw new DefaultError(result.errmsg);
    }
    await this.redis.set(
      CORWX_ACCESSTOKEN,
      result.access_token,
      'EX',
      result.expires_in - 10
    );
    return result.access_token;
  }

  // 发送审核消息
  async sendVerifyMessage() {
    const config = (await this.configService.getConfig(
      CONFIG_CORWX_INFO,
      false
    )) as ConfigCorwxDTO;
    if (!config) {
      return;
    }
    if (!config.verifyChatid) {
      return;
    }
    return await this.sendTextMessage(
      config.verifyChatid,
      '一个骑手正在等待审核'
    );
  }

  async sendTextMessage(chatid: string, text: string) {
    try {
      const accessToken = await this.getAccessToken();

      const result = await this.http.post(
        `https://qyapi.weixin.qq.com/cgi-bin/appchat/send?access_token=${accessToken}`,
        {
          chatid,
          msgtype: 'text',
          text: {
            content: text,
          },
          safe: 0,
        }
      );

      if ((result as any).errcode === 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  async sendMarkdownMessage(chatid: string, text: string) {
    try {
      const accessToken = await this.getAccessToken();

      const result = await this.http.post(
        `https://qyapi.weixin.qq.com/cgi-bin/appchat/send?access_token=${accessToken}`,
        {
          chatid,
          msgtype: 'markdown',
          markdown: {
            content: text,
          },
          safe: 0,
        }
      );

      if ((result as any).errcode === 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  // 创建群聊
  async create(name: string, owner: string, userlist: string[]) {
    const accessToken = await this.getAccessToken();
    const result = await this.http.post(
      `https://qyapi.weixin.qq.com/cgi-bin/appchat/create?access_token=${accessToken}`,
      {
        name,
        owner,
        userlist,
      }
    );
    if ((result as any).errcode !== 0) {
      throw new DefaultError('创建失败');
    }
    return (result as any).chatid;
  }
}
