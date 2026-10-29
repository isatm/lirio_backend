import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { OutfitsService } from './outfits.service.js';
import { CreateOutfitDto } from './dto/create-outfit.dto.js';
import { UpdateOutfitDto } from './dto/update-outfit.dto.js';

@Controller('outfits')
@UseGuards(JwtAuthGuard)
export class OutfitsController {
  constructor(private readonly outfitsService: OutfitsService) {}

  @Post()
  create(
    @Body() createOutfitDto: CreateOutfitDto,
    @Req() request: Request,
  ) {
    const user = request.user as { id: string };

    return this.outfitsService.create(createOutfitDto, user.id);
  }

  @Get('my')
  findMine(@Req() request: Request) {
    const user = request.user as { id: string };

    return this.outfitsService.findMine(user.id);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findAllForAdmin() {
    return this.outfitsService.findAllForAdmin();
  }

  @Delete('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  removeForAdmin(@Param('id') id: string) {
    return this.outfitsService.removeForAdmin(id);
  }

  @Get('public')
  findPublic() {
    return this.outfitsService.findPublic();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    const user = request.user as { id: string };

    return this.outfitsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOutfitDto: UpdateOutfitDto,
    @Req() request: Request,
  ) {
    const user = request.user as { id: string };

    return this.outfitsService.update(id, user.id, updateOutfitDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    const user = request.user as { id: string };

    return this.outfitsService.remove(id, user.id);
  }
}
