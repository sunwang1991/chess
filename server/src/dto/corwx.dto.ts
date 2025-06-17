import { Rule, RuleType } from '@midwayjs/validate';

export class CorwxAppchatCreateDTO {
  @Rule(RuleType.string().required())
  name: string;

  @Rule(RuleType.string().required())
  owner: string;

  @Rule(RuleType.array().required())
  userlist: string[];
}
