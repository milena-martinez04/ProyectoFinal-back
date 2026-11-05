import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1787000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla producto (no depende de ninguna otra)
    await queryRunner.query(`
      CREATE TABLE producto (
        id_producto INT NOT NULL AUTO_INCREMENT,
        modelo VARCHAR(50) NOT NULL,
        memoria VARCHAR(20) NOT NULL,
        color VARCHAR(30) NOT NULL,
        estado_detalle TEXT NOT NULL,
        imei_serie VARCHAR(50) NOT NULL,
        fecha_ingreso DATE NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        PRIMARY KEY (id_producto)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Crear tabla compra (depende de producto)
    await queryRunner.query(`
      CREATE TABLE compra (
        id_compra INT NOT NULL AUTO_INCREMENT,
        fecha_compra DATE NOT NULL,
        precio_compra INT NOT NULL,
        id_producto INT NOT NULL,
        modelo VARCHAR(50) NOT NULL,
        memoria VARCHAR(20) NOT NULL,
        color VARCHAR(30) NOT NULL,
        estado_detalle TEXT NOT NULL,
        imei_serie VARCHAR(50) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        PRIMARY KEY (id_compra),
        CONSTRAINT FK_compra_producto FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Crear tabla venta (depende de producto y compra)
    await queryRunner.query(`
      CREATE TABLE venta (
        id_venta INT NOT NULL AUTO_INCREMENT,
        fecha_venta DATE NOT NULL,
        precio_venta DECIMAL(10,2) NOT NULL,
        medio_de_pago VARCHAR(100) NULL,
        monto DECIMAL(10,2) NOT NULL,
        pago_celular BOOLEAN NOT NULL,
        seña DECIMAL(10,2) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        modelo VARCHAR(50) NOT NULL,
        memoria VARCHAR(20) NOT NULL,
        color VARCHAR(30) NOT NULL,
        estado_detalle TEXT NOT NULL,
        imei_serie VARCHAR(50) NOT NULL,
        id_producto INT NOT NULL,
        valor_celular_recibido INT NULL,
        precio_compra DECIMAL(10,2) NOT NULL,
        id_compra INT NOT NULL,
        PRIMARY KEY (id_venta),
        CONSTRAINT FK_venta_producto FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
        CONSTRAINT FK_venta_compra FOREIGN KEY (id_compra) REFERENCES compra(id_compra)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar en orden inverso por las claves foráneas
    await queryRunner.query(`DROP TABLE venta`);
    await queryRunner.query(`DROP TABLE compra`);
    await queryRunner.query(`DROP TABLE producto`);
  }
}
