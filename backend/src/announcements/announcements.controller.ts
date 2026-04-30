import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('announcements')
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  /**
   * GET /api/announcements/active
   * Tersedia untuk semua user yang sudah login.
   * Mengembalikan pengumuman yang aktif hari ini.
   */
  @Get('active')
  async getActive() {
    const data = await this.announcementsService.findActive();
    return { success: true, data };
  }

  /**
   * GET /api/announcements
   * Admin only — daftar semua pengumuman.
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async findAll() {
    const data = await this.announcementsService.findAll();
    return { success: true, data };
  }

  /**
   * POST /api/announcements
   * Admin only — buat pengumuman baru.
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async create(
    @Request() req: { user: { sub: string } },
    @Body() dto: CreateAnnouncementDto,
  ) {
    const data = await this.announcementsService.create(req.user.sub, dto);
    return { success: true, data, message: 'Pengumuman berhasil dibuat' };
  }

  /**
   * PATCH /api/announcements/:id
   * Admin only — edit pengumuman.
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
    const data = await this.announcementsService.update(id, dto);
    return { success: true, data, message: 'Pengumuman berhasil diperbarui' };
  }

  /**
   * DELETE /api/announcements/:id
   * Admin only — hapus pengumuman.
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    const result = await this.announcementsService.remove(id);
    return { success: true, ...result };
  }
}
