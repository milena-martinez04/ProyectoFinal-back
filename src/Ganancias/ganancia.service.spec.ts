import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GananciaService } from './ganancia.service';
import { Venta } from '../Venta/entities/venta.entity';
import { Usuario } from 'src/Auth/entities/usuario.entity';

describe('GananciaService - Aislamiento por usuario', () => {
  let service: GananciaService;
  let repoVenta: any;
  let repoUsuario: any;

  const usuarioA = { id: 1, email: 'a@gmail.com', googleId: 'google-a' } as Usuario;
  const usuarioB = { id: 2, email: 'b@gmail.com', googleId: 'google-b' } as Usuario;

  const ventaA: Venta = {
    id_venta: 1,
    id_usuario: 1,
    precio_venta: 700,
    precio_compra: 500,
    fecha_venta: new Date('2026-01-15'),
  } as any;

  const ventaB: Venta = {
    id_venta: 2,
    id_usuario: 2,
    precio_venta: 800,
    precio_compra: 600,
    fecha_venta: new Date('2026-01-15'),
  } as any;

  beforeEach(async () => {
    repoVenta = {
      find: jest.fn(),
    };
    repoUsuario = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GananciaService,
        { provide: getRepositoryToken(Venta), useValue: repoVenta },
        { provide: getRepositoryToken(Usuario), useValue: repoUsuario },
      ],
    }).compile();

    service = module.get(GananciaService);
  });

  it('gananciaMensual debe filtrar solo ventas del usuario autenticado', async () => {
    repoUsuario.findOneBy.mockResolvedValue(usuarioA);
    repoVenta.find.mockResolvedValue([ventaA]);

    const resultado = await service.gananciaMensual(1, 2026, usuarioA.id);

    expect(repoVenta.find).toHaveBeenCalledWith({
      where: {
        id_usuario: usuarioA.id,
        fecha_venta: expect.anything(),
      },
    });
    expect(resultado.totalVentas).toBe(ventaA.precio_venta);
    expect(resultado.totalCompras).toBe(ventaA.precio_compra);
    expect(resultado.ganancia).toBe(ventaA.precio_venta - ventaA.precio_compra);
  });

  it('gananciaMensual nunca incluye ventas de otro usuario (filtro por token)', async () => {
    repoUsuario.findOneBy.mockResolvedValue(usuarioA);
    repoVenta.find.mockResolvedValue([ventaB]);

    const resultado = await service.gananciaMensual(1, 2026, usuarioA.id);

    // El filtro aplicado al repositorio es estrictamente por el usuario autenticado (usuarioA),
    // nunca por el id de otro usuario (usuarioB).
    expect(repoVenta.find).toHaveBeenCalledWith({
      where: {
        id_usuario: usuarioA.id,
        fecha_venta: expect.anything(),
      },
    });
    expect(repoVenta.find).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { id_usuario: usuarioB.id } }),
    );
    // El cálculo se basa únicamente en las ventas del usuario autenticado.
    expect(resultado.totalVentas).toBe(ventaB.precio_venta);
    expect(resultado.ganancia).toBe(ventaB.precio_venta - ventaB.precio_compra);
  });

  it('gananciaSemanal debe filtrar solo ventas del usuario autenticado', async () => {
    repoUsuario.findOneBy.mockResolvedValue(usuarioA);
    repoVenta.find.mockResolvedValue([ventaA]);

    const resultado = await service.gananciaSemanal('2026-01-15', usuarioA.id);

    expect(repoVenta.find).toHaveBeenCalledWith({
      where: {
        id_usuario: usuarioA.id,
        fecha_venta: expect.anything(),
      },
    });
    expect(resultado.totalVentas).toBe(700);
  });

  it('resumenGanancias debe filtrar solo ventas del usuario autenticado', async () => {
    repoUsuario.findOneBy.mockResolvedValue(usuarioA);
    repoVenta.find.mockResolvedValue([ventaA]);

    const resultado = await service.resumenGanancias(usuarioA.id);

    expect(repoVenta.find).toHaveBeenCalledWith({
      where: { id_usuario: usuarioA.id },
      order: { fecha_venta: 'ASC' },
    });
    expect(resultado.length).toBe(1);
    expect(resultado[0].ganancia).toBe(200);
  });

  it('debe rechazar con 404 si el usuario no existe', async () => {
    repoUsuario.findOneBy.mockResolvedValue(null);

    await expect(
      service.gananciaMensual(1, 2026, 999),
    ).rejects.toThrow(NotFoundException);
  });
});
