import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { Usuario } from './entities/usuario.entity';

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

describe('AuthService', () => {
  let service: AuthService;
  let repo: any;
  let jwtService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'fake-jwt-token'),
          },
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn((dto: any) => dto),
            save: jest.fn((usuario: any) =>
              Promise.resolve({ ...usuario, id: usuario.id ?? 1 }),
            ),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    repo = module.get(getRepositoryToken(Usuario));
    jwtService = module.get(JwtService);
    (service.client.verifyIdToken as jest.Mock).mockReset();
    process.env.JWT_SECRET = 'test-secret-jwt';
  });

  it('debe aceptar cualquier cuenta de Google válida (sin restricción ALLOWED_GOOGLE_EMAIL)', async () => {
    const payload = {
      email: 'cualquier.usuario@gmail.com',
      name: 'Cualquier Usuario',
      picture: 'https://ejemplo.com/foto.jpg',
      sub: 'google-id-999',
    };
    (service.client.verifyIdToken as jest.Mock).mockResolvedValue({
      getPayload: () => payload,
    } as any);
    repo.findOne.mockResolvedValue(null);

    const result = await service.loginGoogle('cualquier-token-valido');

    expect(result.email).toBe('cualquier.usuario@gmail.com');
    expect(result.nombre).toBe('Cualquier Usuario');
    expect(result.foto).toBe('https://ejemplo.com/foto.jpg');
    expect(result.id).toBeDefined();
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: payload.email, googleId: payload.sub }),
    );
    expect(repo.save).toHaveBeenCalled();
    expect(jwtService.sign).toHaveBeenCalledWith(
      { sub: expect.any(Number), email: payload.email },
      expect.objectContaining({ secret: expect.any(String) }),
    );
    expect(result.accessToken).toBe('fake-jwt-token');
  });

  it('debe recuperar el usuario existente sin duplicar al iniciar sesión nuevamente', async () => {
    const payload = {
      email: 'existente@gmail.com',
      name: 'Existente',
      picture: null,
      sub: 'google-id-existente',
    };
    const existente: Usuario = {
      id: 7,
      email: payload.email,
      nombre: payload.name,
      foto: payload.picture,
      googleId: payload.sub,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    } as any;
    (service.client.verifyIdToken as jest.Mock).mockResolvedValue({
      getPayload: () => payload,
    } as any);
    repo.findOne.mockResolvedValue(existente);

    const result = await service.loginGoogle('token-usuario-existente');

    expect(result.id).toBe(7);
    expect(result.email).toBe('existente@gmail.com');
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('debe rechazar con 401 cuando el token de Google no tiene email', async () => {
    (service.client.verifyIdToken as jest.Mock).mockResolvedValue({
      getPayload: () => ({ sub: 'google-id-sin-email' }),
    } as any);

    await expect(service.loginGoogle('token-sin-email')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('debe rechazar con 401 cuando el token de Google es invalido', async () => {
    (service.client.verifyIdToken as jest.Mock).mockRejectedValue(
      new Error('Token invalido'),
    );

    await expect(service.loginGoogle('token-invalido')).rejects.toThrow(
      'Token invalido',
    );
  });
});
