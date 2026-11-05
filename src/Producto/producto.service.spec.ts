import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductoServices } from './producto.service';
import { Producto } from './entities/producto.entity';
import { Compra } from 'src/Compra/entities/compra.entity';
import { Usuario } from 'src/Auth/entities/usuario.entity';
import { CreateProductoDTO } from './Dto/createProducto.DTO';
import { UpdateProductoDTO } from './Dto/updateProducto.DTO';

describe('ProductoServices - Aislamiento por usuario', () => {
  let service: ProductoServices;
  let repoProducto: any;
  let repoCompra: any;
  let repoUsuario: any;

  const usuarioA = { id: 1, email: 'a@gmail.com', googleId: 'google-a' } as Usuario;
  const usuarioB = { id: 2, email: 'b@gmail.com', googleId: 'google-b' } as Usuario;

  const productoA: Producto = {
    id_producto: 10,
    id_usuario: 1,
    usuario: usuarioA,
    modelo: 'iPhone 13',
    memoria: '128GB',
    color: 'Negro',
    estado_detalle: 'Nuevo',
    imei_serie: 'IMEI-A',
    fecha_ingreso: new Date(),
    precio_compra: 500,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  } as any;

  const productoB: Producto = {
    id_producto: 20,
    id_usuario: 2,
    usuario: usuarioB,
    modelo: 'iPhone 14',
    memoria: '256GB',
    color: 'Blanco',
    estado_detalle: 'Nuevo',
    imei_serie: 'IMEI-B',
    fecha_ingreso: new Date(),
    precio_compra: 600,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  } as any;

  beforeEach(async () => {
    repoProducto = {
      create: jest.fn((dto: any) => dto),
      save: jest.fn((dto: any) => Promise.resolve({ ...dto, id_producto: 99 })),
      find: jest.fn(),
      findOne: jest.fn(),
      findBy: jest.fn(),
      softDelete: jest.fn(),
    };
    repoCompra = {
      save: jest.fn(),
    };
    repoUsuario = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoServices,
        { provide: getRepositoryToken(Producto), useValue: repoProducto },
        { provide: getRepositoryToken(Compra), useValue: repoCompra },
        { provide: getRepositoryToken(Usuario), useValue: repoUsuario },
      ],
    }).compile();

    service = module.get(ProductoServices);
  });

  it('findAll debe filtrar solo productos del usuario autenticado (no ve los de otro usuario)', async () => {
    repoProducto.find.mockResolvedValue([productoA]);

    const resultado = await service.findAll(usuarioA.id);

    expect(repoProducto.find).toHaveBeenCalledWith({
      where: { id_usuario: usuarioA.id },
    });
    expect(resultado).toEqual([productoA]);
    expect(resultado).not.toContain(productoB);
  });

  it('findById debe rechazar producto de otro usuario', async () => {
    repoProducto.findBy.mockResolvedValue([]);

    const resultado = await service.findById(productoB.id_producto, usuarioA.id);

    expect(repoProducto.findBy).toHaveBeenCalledWith({
      id_producto: productoB.id_producto,
      id_usuario: usuarioA.id,
    });
    expect(resultado).toEqual([]);
  });

  it('update debe rechazar modificar producto de otro usuario', async () => {
    repoProducto.findOne.mockResolvedValue(null);

    const dto: UpdateProductoDTO = { modelo: 'Modificado' };

    await expect(
      service.update(productoB.id_producto, dto, usuarioA.id),
    ).rejects.toThrow(NotFoundException);

    expect(repoProducto.findOne).toHaveBeenCalledWith({
      where: { id_producto: productoB.id_producto, id_usuario: usuarioA.id },
    });
  });

  it('delete debe rechazar eliminar producto de otro usuario', async () => {
    repoProducto.findOne.mockResolvedValue(null);

    await expect(
      service.delete(productoB.id_producto, usuarioA.id),
    ).rejects.toThrow(NotFoundException);

    expect(repoProducto.findOne).toHaveBeenCalledWith({
      where: { id_producto: productoB.id_producto, id_usuario: usuarioA.id },
    });
  });

  it('create debe asociar el producto y la compra automática al usuario autenticado', async () => {
    repoUsuario.findOneBy.mockResolvedValue(usuarioA);
    repoProducto.create.mockImplementation((dto: any) => dto);
    repoProducto.save.mockResolvedValue({ ...productoA, id_producto: 10 });

    const dto: CreateProductoDTO = {
      modelo: 'iPhone 15',
      memoria: '256GB',
      color: 'Azul',
      estado_detalle: 'Nuevo',
      imei_serie: 'IMEI-C',
      fecha_ingreso: new Date('2026-01-01'),
      precio_compra: 700,
    };

    const resultado = await service.create(dto, usuarioA.id);

    expect(repoProducto.create).toHaveBeenCalledWith(
      expect.objectContaining({ id_usuario: usuarioA.id, usuario: usuarioA }),
    );
    expect(repoCompra.save).toHaveBeenCalledWith(
      expect.objectContaining({ id_usuario: usuarioA.id }),
    );
    expect(resultado.id_usuario).toBe(usuarioA.id);
  });
});
