import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('google')
  loginGoogle(@Body() body: any) {
    return this.authService.loginGoogle(body.token);
  }
}
