import { Rule, RuleType } from '@midwayjs/validate';

export class userLoginDTO {
  @Rule(RuleType.string().required())
  code: string;
}

export class userRegisterDTO {
  @Rule(RuleType.string().required())
  code: string;
  @Rule(RuleType.string())
  name: string;
  @Rule(RuleType.string())
  avatar: string;
}
