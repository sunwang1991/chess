import { EggAppConfig, PowerPartial } from 'egg';
import { MidwayConfig } from '@midwayjs/core';

export type DefaultConfig = PowerPartial<EggAppConfig>;

/**
 * 这里加入这段是因为 egg 默认的安全策略，在 post 请求的时候如果不传递 token 会返回 403
 * 由于大部分新手用户不太了解这个机制，所以在本地和单测环境做了默认处理
 * 请注意，线上环境依旧会有该错误，需要手动开启
 * 如果想了解更多细节，请访问 https://eggjs.org/zh-cn/core/security.html#安全威胁-csrf-的防范
 */
export default {
  keys: '_1647247784657_5669',
  egg: {
    port: 8001,
  },
  orm: {
    /**
     * 单数据库实例
     */
    type: 'mysql',
    host: '113.46.139.108',
    port: 3306,
    username: 'chess',
    password: '123456',
    database: 'chess',
    synchronize: true, // 如果第一次使用，不存在表，有同步的需求可以写 true
    logging: false,
  },
  redis: {
    client: {
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
      password: '123456',
      db: 0,
    },
  },

  jwt: {
    privateKey: 'rn89yfhfHFF59H8df4', //秘钥
    expiresIn: '168h', // 过期时间
  },
  security: {
    csrf: { enable: false },
  },
  task: {
    redis: {
      port: 6379, // Redis port
      host: '113.46.139.108', // Redis host
      password: '123456',
      db: 0,
    },
    prefix: 'chess-task', // 这些任务存储的 key，都是 midway-task 开头，以便区分用户原有redis 里面的配置。
    defaultJobOptions: {
      repeat: {
        tz: 'Asia/Shanghai', // Task 等参数里面设置的比如（0 0 0 * * *）本来是为了0点执行，但是由于时区不对，所以国内用户时区设置一下。
      },
    },
  },
  bodyParser: {
    enableTypes: ['json', 'form', 'text', 'xml'],
    formLimit: '1mb',
    jsonLimit: '1mb',
    textLimit: '1mb',
    xmlLimit: '1mb',
  },
} as unknown & MidwayConfig & DefaultConfig;
