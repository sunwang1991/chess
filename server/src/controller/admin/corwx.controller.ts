import { Body, Controller, Inject, Post } from '@midwayjs/decorator';
import { Validate } from '@midwayjs/validate';
import { CorwxAppchatCreateDTO } from '../../dto/corwx.dto';
import { AdminMiddleware } from '../../middleware/admin.middleware';
import { CorwxService } from '../../service/wx/corwx.service';
import { BaseController } from '../base.controller';

@Controller('/admin/corwx', { middleware: [AdminMiddleware] })
export class AdminCorwxController extends BaseController {
  @Inject()
  corwxService: CorwxService;

  @Post('/appchat/create')
  @Validate()
  async createAppchat(@Body() dto: CorwxAppchatCreateDTO) {
    const result = await this.corwxService.create(
      dto.name,
      dto.owner,
      dto.userlist
    );
    return this.responseSuccess('ok', result);
  }
}
