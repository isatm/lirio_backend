
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CloudinaryService } from '../posts/cloudinary/cloudinary.service.js';
import { GarmentsService } from './garments.service.js';
import { CreateGarmentDto } from './dto/create_garment.dto.js';
import { UpdateGarmentDto } from './dto/update_garment.dto.js';

@Controller('garments')
@UseGuards(JwtAuthGuard)
export class GarmentsController {
  constructor(
    private readonly garmentsService: GarmentsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() createGarmentDto: CreateGarmentDto,
    @UploadedFile() file: { buffer: Buffer } | undefined,
    @Req() request: Request,
  ) {
    if (!file) {
      throw new BadRequestException('La foto de la prenda es obligatoria');
    }

    const user = request.user as { id: string };

    const result = await this.cloudinaryService.uploadImage(file);
    const imageUrl = (result as { secure_url: string }).secure_url;

    return this.garmentsService.create(
      createGarmentDto,
      user.id,
      imageUrl,
    );
  }

  @Get('my')
  findMyGarments(@Req() request: Request) {
    const user = request.user as { id: string };

    return this.garmentsService.findMyGarments(user.id);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    const user = request.user as { id: string };

    return this.garmentsService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateGarmentDto: UpdateGarmentDto,
    @UploadedFile() file: { buffer: Buffer } | undefined,
    @Req() request: Request,
  ) {
    const user = request.user as { id: string };
    let imageUrl: string | undefined;

    if (file) {
      const result = await this.cloudinaryService.uploadImage(file);
      imageUrl = (result as { secure_url: string }).secure_url;
    }

    return this.garmentsService.update(
      id,
      user.id,
      updateGarmentDto,
      imageUrl,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    const user = request.user as { id: string };

    return this.garmentsService.remove(id, user.id);
  }
}
