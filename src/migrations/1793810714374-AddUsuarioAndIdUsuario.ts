import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsuarioAndIdUsuario1793810714374 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla usuario
    await queryRunner.query(`
      CREATE TABLE usuario (
        id INT NOT NULL AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        foto VARCHAR(500) NULL,
        googleId VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        PRIMARY KEY (id),
        UNIQUE KEY UK_usuario_email (email),
        UNIQUE KEY UK_usuario_googleId (googleId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Agregar columna id_usuario a producto
    await queryRunner.query(`
      ALTER TABLE producto
      ADD COLUMN id_usuario INT NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE producto
      ADD CONSTRAINT FK_producto_usuario
      FOREIGN KEY (id_usuario) REFERENCES usuario(id)
    `);

    // Agregar columna id_usuario a compra
    await queryRunner.query(`
      ALTER TABLE compra
      ADD COLUMN id_usuario INT NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE compra
      ADD CONSTRAINT FK_compra_usuario
      FOREIGN KEY (id_usuario) REFERENCES usuario(id)
    `);

    // Agregar columna id_usuario a venta
    await queryRunner.query(`
      ALTER TABLE venta
      ADD COLUMN id_usuario INT NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE venta
      ADD CONSTRAINT FK_venta_usuario
      FOREIGN KEY (id_usuario) REFERENCES usuario(id)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign keys y columnas id_usuario
    await queryRunner.query(`
      ALTER TABLE venta DROP FOREIGN KEY FK_venta_usuario
    `);
    await queryRunner.query(`
      ALTER TABLE venta DROP COLUMN id_usuario
    `);

    await queryRunner.query(`
      ALTER TABLE compra DROP FOREIGN KEY FK_compra_usuario
    `);
    await queryRunner.query(`
      ALTER TABLE compra DROP COLUMN id_usuario
    `);

    await queryRunner.query(`
      ALTER TABLE producto DROP FOREIGN KEY FK_producto_usuario
    `);
    await queryRunner.query(`
      ALTER TABLE producto DROP COLUMN id_usuario
    `);

    // Eliminar tabla usuario
    await queryRunner.query(`
      DROP TABLE usuario
    `);
  }
}
