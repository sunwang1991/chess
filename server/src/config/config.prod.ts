import { EggAppConfig, PowerPartial } from 'egg';
import { MidwayConfig } from '@midwayjs/core';

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default {
  keys: '_1647247784657_5669',
  orm: {
    /**
     * 单数据库实例
     */
    type: 'mysql',
    host: 'http://121.37.46.169',
    port: '3306',
    username: 'root',
    password: '123456',
    database: 'chess',
    synchronize: true, // 如果第一次使用，不存在表，有同步的需求可以写 true
    logging: false,
  },
  redis: {
    client: {
      port: '6379', // Redis port
      host: 'http://121.37.46.169', // Redis host
      password: '123456',
      db: 0,
    },
  },
  jwt: {
    privateKey: '{jwt_key}', //秘钥
    expiresIn: '168h', // 过期时间
  },
  egg: {
    port: 80,
  },
  security: {
    csrf: { enable: false },
  },
  task: {
    redis: {
      port: '{redis_port}', // Redis port
      host: '{redis_host}', // Redis host
      password: '{redis_password}',
      db: 0,
    },
    prefix: 'ddrun-task', // 这些任务存储的 key，都是 midway-task 开头，以便区分用户原有redis 里面的配置。
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
} as unknown & MidwayConfig & DefaultConfig ;
