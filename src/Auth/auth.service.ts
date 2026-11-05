import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class AuthService {
  client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

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

    const googleId = payload?.sub;

    if (!googleId) {
      throw new UnauthorizedException(
        'No se pudo obtener el identificador de Google',
      );
    }

    let usuario = await this.usuarioRepo.findOne({ where: { googleId } });

    if (!usuario) {
      usuario = this.usuarioRepo.create({
        email,
        nombre: payload?.name ?? '',
        foto: payload?.picture ?? null,
        googleId,
      });
      usuario = await this.usuarioRepo.save(usuario);
    }

    const jwtPayload = { sub: usuario.id, email: usuario.email };
    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: process.env.JWT_SECRET!,
      expiresIn: process.env.JWT_EXPIRATION ?? '1h',
    } as any);

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      foto: usuario.foto,
      accessToken,
    };
  }
}
