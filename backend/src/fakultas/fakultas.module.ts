import { Module } from '@nestjs/common';
import { FakultasController } from './fakultas.controller';
import { FakultasService } from './fakultas.service';

@Module({
  controllers: [FakultasController],
  providers: [FakultasService],
  exports: [FakultasService],
})
export class FakultasModule {}
