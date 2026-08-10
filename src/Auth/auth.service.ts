import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async loginGoogle(token: string) {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload?.email;

    if (!email) {
      throw new UnauthorizedException('No se pudo obtener el email de Google');
    }

    if (email !== process.env.ALLOWED_GOOGLE_EMAIL) {
      throw new UnauthorizedException(
        'Este usuario no tiene acceso a la aplicación',
      );
    }

    return {
      nombre: payload?.name,
      email: email,
      foto: payload?.picture,
    };
  }
}
