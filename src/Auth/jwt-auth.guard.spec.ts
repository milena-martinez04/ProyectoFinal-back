import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: any;

  beforeEach(() => {
    jwtService = {
      verify: jest.fn(),
    };
    guard = new JwtAuthGuard(jwtService);
  });

  const crearContexto = (request: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any);

  it('debe rechazar cuando no se proporciona el token de autenticación', () => {
    const ctx = crearContexto({
      headers: {},
    });

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    expect(jwtService.verify).not.toHaveBeenCalled();
  });

  it('debe rechazar cuando el encabezado Authorization no usa el esquema Bearer', () => {
    const ctx = crearContexto({
      headers: {
        authorization: 'Basic token123',
      },
    });

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    expect(jwtService.verify).not.toHaveBeenCalled();
  });

  it('debe rechazar cuando el token es inválido (verify falla)', () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    const ctx = crearContexto({
      headers: {
        authorization: 'Bearer token-invalido',
      },
    });

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    expect(jwtService.verify).toHaveBeenCalledWith('token-invalido', {
      secret: process.env.JWT_SECRET,
    });
  });

  it('debe rechazar cuando el token está expirado', () => {
    const error: any = new Error('expired token');
    error.name = 'TokenExpiredError';
    jwtService.verify.mockImplementation(() => {
      throw error;
    });

    const ctx = crearContexto({
      headers: {
        authorization: 'Bearer token-expirado',
      },
    });

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    expect(jwtService.verify).toHaveBeenCalledWith('token-expirado', {
      secret: process.env.JWT_SECRET,
    });
  });

  it('debe aceptar un token válido y establecer el usuario en la request', () => {
    const payload = { sub: 1, email: 'usuario@gmail.com' };
    jwtService.verify.mockReturnValue(payload);

    const request: any = {
      headers: {
        authorization: 'Bearer token-valido',
      },
    };
    const ctx = crearContexto(request);

    const resultado = guard.canActivate(ctx);

    expect(resultado).toBe(true);
    expect(jwtService.verify).toHaveBeenCalledWith('token-valido', {
      secret: process.env.JWT_SECRET,
    });
    expect(request.user).toEqual({
      id: 1,
      email: 'usuario@gmail.com',
    });
  });
});
