import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrecioCompraToProducto1787147873735 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    
    await queryRunner.query(`
      ALTER TABLE producto
      ADD COLUMN precio_compra DECIMAL(10,2) NULL
    `);

    await queryRunner.query(`
      UPDATE producto p
      INNER JOIN compra c
        ON c.id_producto = p.id_producto
      SET p.precio_compra = c.precio_compra
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE producto
      DROP COLUMN precio_compra
    `);
  }
}