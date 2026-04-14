import { Controller, Get, Query } from '@nestjs/common';
import { FakultasService } from './fakultas.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('fakultas')
export class FakultasController {
  constructor(private readonly fakultasService: FakultasService) {}

  @Public()
  @Get()
  getAllFakultas() {
    return {
      success: true,
      data: this.fakultasService.getAllFakultas(),
    };
  }

  @Public()
  @Get('list')
  getFakultasList() {
    return {
      success: true,
      data: this.fakultasService.getFakultasList(),
    };
  }

  @Public()
  @Get('jurusan')
  getJurusanByFakultas(@Query('fakultas') fakultas: string) {
    if (!fakultas) {
      return {
        success: false,
        error: {
          message: 'Fakultas parameter is required',
          statusCode: 400,
        },
      };
    }

    return {
      success: true,
      data: this.fakultasService.getJurusanByFakultas(fakultas),
    };
  }
}
