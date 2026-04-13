import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

interface JwtRequest extends Request {
  user: {
    sub: string;
    role: string;
    email: string;
    name: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Update current user's own profile
   */
  @Patch('me')
  updateMe(@Request() req: JwtRequest, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.sub, updateUserDto);
  }

  /**
   * Upload current user's own photo
   */
  @Patch('me/photo')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadMyPhoto(
    @Request() req: JwtRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const uploadResult = await this.cloudinaryService.uploadImage(file);
    return this.usersService.updatePhoto(req.user.sub, uploadResult.url);
  }

  /**
   * Get current user profile
   */
  @Get('me')
  findMe(@Request() req: JwtRequest) {
    return this.usersService.findOne(req.user.sub);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  /**
   * Upload user photo
   */
  @Patch(':id/photo')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const uploadResult = await this.cloudinaryService.uploadImage(file);
    return this.usersService.updatePhoto(id, uploadResult.url);
  }

  /**
   * Delete user photo
   */
  @Delete(':id/photo')
  @Roles('ADMIN')
  async deletePhoto(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (user.photo) {
      const publicId = this.cloudinaryService.extractPublicId(user.photo);
      if (publicId) {
        await this.cloudinaryService.deleteImage(publicId);
      }
    }
    return this.usersService.updatePhoto(id, null);
  }
}
