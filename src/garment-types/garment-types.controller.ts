import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post as HttpPost,
  UseGuards,
} from '@nestjs/common';

import { GarmentTypesService } from './garment-types.service.js';
import { CreateGarmentTypeDto } from './dto/create_garment_type.dto.js';
import { UpdateGarmentTypeDto } from './dto/update_garment_type.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('garment-types')
export class GarmentTypesController {
  constructor(
    private readonly garmentTypesService: GarmentTypesService,
  ) {}

  @Get()
  findAll() {
    return this.garmentTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.garmentTypesService.findOne(id);
  }

  @HttpPost()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createGarmentTypeDto: CreateGarmentTypeDto) {
    return this.garmentTypesService.create(createGarmentTypeDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateGarmentTypeDto: UpdateGarmentTypeDto,
  ) {
    return this.garmentTypesService.update(id, updateGarmentTypeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.garmentTypesService.remove(id);
  }
}
