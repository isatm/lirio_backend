import {
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import * as crypto from 'crypto';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ) {

    const request =
      context.switchToHttp().getRequest();

    const authHeader =
      request.headers.authorization;

    const token =
      authHeader?.replace('Bearer ', '');

    return super.handleRequest(
      err,
      user,
      info,
      context,
    );
  }

}