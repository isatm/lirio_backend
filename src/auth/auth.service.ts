import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as crypto from 'crypto';

@Injectable()
export class AuthService {

  constructor(
    private readonly jwtService: JwtService,
  ) {}

  generateToken(user: {
    id: string;
    email: string;
    user_name: string;
    role: string;
  }) {

    const payload = {
      sub: user.id,
      email: user.email,
      user_name: user.user_name,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    console.log(
      'TOKEN GENERADO HASH:',
      crypto
        .createHash('sha256')
        .update(token)
        .digest('hex'),
    );

    return token;
  }

}