import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(async () => {
    authService = { loginGoogle: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get(AuthController);
  });

  it('debe devolver el perfil del usuario autenticado (nombre, email, foto)', async () => {
    authService.loginGoogle.mockResolvedValue({
      id: 1,
      nombre: 'Usuario Test',
      email: 'usuario@gmail.com',
      foto: 'https://ejemplo.com/foto.jpg',
    });

    const result = await controller.loginGoogle({ token: 'token-valido' });

    expect(result).toEqual({
      id: 1,
      nombre: 'Usuario Test',
      email: 'usuario@gmail.com',
      foto: 'https://ejemplo.com/foto.jpg',
    });
    expect(authService.loginGoogle).toHaveBeenCalledWith('token-valido');
  });

  it('debe retornar error de no autorizado (401) cuando el token de Google es invalido', async () => {
    authService.loginGoogle.mockRejectedValue(
      new UnauthorizedException('Token de Google invalido'),
    );

    await expect(
      controller.loginGoogle({ token: 'token-invalido' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('debe retornar error de no autorizado (401) cuando el token de Google no tiene email', async () => {
    authService.loginGoogle.mockRejectedValue(
      new UnauthorizedException('No se pudo obtener el email de Google'),
    );

    await expect(
      controller.loginGoogle({ token: 'token-sin-email' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
