import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompraService } from './compra.service';
import { Compra } from './entities/compra.entity';
import { Producto } from 'src/Producto/entities/producto.entity';
import { Usuario } from 'src/Auth/entities/usuario.entity';
import { CreateCompraDTO } from './Dto/createCompra.DTO';
import { UpdateCompraDTO } from './Dto/updateCompra.DTO';

describe('CompraService - Aislamiento por usuario', () => {
  let service: CompraService;
  let repoCompra: any;
  let repoProducto: any;
  let repoUsuario: any;

  const usuarioA = { id: 1, email: 'a@gmail.com', googleId: 'google-a' } as Usuario;
  const usuarioB = { id: 2, email: 'b@gmail.com', googleId: 'google-b' } as Usuario;

  const productoA: Producto = {
    id_producto: 10,
    id_usuario: 1,
    modelo: 'iPhone 13',
    memoria: '128GB',
    color: 'Negro',
    estado_detalle: 'Nuevo',
    imei_serie: 'IMEI-A',
    precio_compra: 500,
  } as any;

  const compraA: Compra = {
    id_compra: 100,
    id_usuario: 1,
    id_producto: 10,
    producto: productoA,
    fecha_compra: new Date(),
    precio_compra: 500,
    modelo: 'iPhone 13',
    memoria: '128GB',
    color: 'Negro',
    estado_detalle: 'Nuevo',
    imei_serie: 'IMEI-A',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  } as any;

  const compraB: Compra = {
    id_compra: 200,
    id_usuario: 2,
    id_producto: 20,
    fecha_compra: new Date(),
    precio_compra: 600,
    modelo: 'iPhone 14',
    memoria: '256GB',
    color: 'Blanco',
    estado_detalle: 'Nuevo',
    imei_serie: 'IMEI-B',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  } as any;

  beforeEach(async () => {
    repoCompra = {
      create: jest.fn((dto: any) => dto),
      save: jest.fn((dto: any) => Promise.resolve({ ...dto, id_compra: 999 })),
      find: jest.fn(),
      findOne: jest.fn(),
      findBy: jest.fn(),
      softDelete: jest.fn(),
    };
    repoProducto = {
      findOneBy: jest.fn(),
    };
    repoUsuario = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompraService,
        { provide: getRepositoryToken(Compra), useValue: repoCompra },
        { provide: getRepositoryToken(Producto), useValue: repoProducto },
        { provide: getRepositoryToken(Usuario), useValue: repoUsuario },
      ],
    }).compile();

    service = module.get(CompraService);
  });

  it('findAll debe filtrar solo compras del usuario autenticado', async () => {
    repoCompra.find.mockResolvedValue([compraA]);

    const resultado = await service.findAll(usuarioA.id);

    expect(repoCompra.find).toHaveBeenCalledWith({
      where: { id_usuario: usuarioA.id },
      relations: { producto: true },
      order: { fecha_compra: 'DESC' },
    });
    expect(resultado).toEqual([compraA]);
    expect(resultado).not.toContain(compraB);
  });

  it('findById debe rechazar compra de otro usuario', async () => {
    repoCompra.findBy.mockResolvedValue([]);

    const resultado = await service.findById(compraB.id_compra, usuarioA.id);

    expect(repoCompra.findBy).toHaveBeenCalledWith({
      id_compra: compraB.id_compra,
      id_usuario: usuarioA.id,
    });
    expect(resultado).toEqual([]);
  });

  it('update debe rechazar modificar compra de otro usuario', async () => {
    repoCompra.findOne.mockResolvedValue(null);

    const dto: UpdateCompraDTO = { precio_compra: 999 };

    await expect(
      service.update(compraB.id_compra, dto, usuarioA.id),
    ).rejects.toThrow(NotFoundException);

    expect(repoCompra.findOne).toHaveBeenCalledWith({
      where: { id_compra: compraB.id_compra, id_usuario: usuarioA.id },
    });
  });

  it('delete debe rechazar eliminar compra de otro usuario', async () => {
    repoCompra.findOne.mockResolvedValue(null);

    await expect(
      service.delete(compraB.id_compra, usuarioA.id),
    ).rejects.toThrow(NotFoundException);

    expect(repoCompra.findOne).toHaveBeenCalledWith({
      where: { id_compra: compraB.id_compra, id_usuario: usuarioA.id },
    });
  });

  it('create debe rechazar si el producto no pertenece al usuario autenticado', async () => {
    repoUsuario.findOneBy.mockResolvedValue(usuarioA);
    repoProducto.findOneBy.mockResolvedValue(null);

    const dto: CreateCompraDTO = {
      id_producto: 999,
      fecha_compra: new Date('2026-01-01'),
      precio_compra: 100,
    };

    await expect(service.create(dto, usuarioA.id)).rejects.toThrow(
      NotFoundException,
    );

    expect(repoProducto.findOneBy).toHaveBeenCalledWith({
      id_producto: 999,
      id_usuario: usuarioA.id,
    });
  });
});
