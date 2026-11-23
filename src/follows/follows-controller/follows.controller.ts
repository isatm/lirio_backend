import {
    Controller,
    Delete,
    Get,
    Param,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { FollowsService } from '../follows-service/follows.service.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';

const currentId = (request: Request) => (request.user as { id: string }).id;

@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
    constructor(private readonly followsService: FollowsService) {}

  // Las rutas fijas van antes que las que usan :userId.
    @Get('me/following-ids')
    followingIds(@Req() request: Request) {
    return this.followsService.listFollowingIds(currentId(request));
    }

    @Get(':userId/status')
    status(@Req() request: Request, @Param('userId') userId: string) {
    return this.followsService.getStatus(currentId(request), userId);
    }

    @Get(':userId/followers')
    followers(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    ) {
    return this.followsService.listFollowers(
        userId,
        parseInt(page ?? '1', 10) || 1,
        parseInt(limit ?? '20', 10) || 20,
    );
    }

    @Put(':userId')
    follow(@Req() request: Request, @Param('userId') userId: string) {
    return this.followsService.follow(currentId(request), userId);
    }

    @Delete(':userId')
    unfollow(@Req() request: Request, @Param('userId') userId: string) {
    return this.followsService.unfollow(currentId(request), userId);
    }
}