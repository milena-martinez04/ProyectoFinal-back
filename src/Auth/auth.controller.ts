import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginGoogleDto } from './Dto/loginGoogle.DTO';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('google')
  loginGoogle(@Body() body: LoginGoogleDto) {
    return this.authService.loginGoogle(body.token);
  }
}
