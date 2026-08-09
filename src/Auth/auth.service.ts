import { Injectable } from '@nestjs/common';
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

    console.log(payload);

    return {
      nombre: payload?.name,
      email: payload?.email,
      foto: payload?.picture,
    };
  }
}
