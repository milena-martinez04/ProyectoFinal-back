import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as fs from 'fs';

function validarVariablesDeEntorno() {
  const requeridas = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'GOOGLE_CLIENT_ID',
    'JWT_SECRET',
  ];
  const faltantes = requeridas.filter((key) => !process.env[key]);

  if (faltantes.length > 0) {
    throw new Error(
      `Faltan variables de entorno requeridas: ${faltantes.join(', ')}. Definí estas variables antes de iniciar la aplicación.`,
    );
  }

  // DB_PORT debe ser un número de puerto válido
  const dbPort = Number(process.env.DB_PORT);
  if (!Number.isInteger(dbPort) || dbPort <= 0 || dbPort > 65535) {
    throw new Error(
      `DB_PORT debe ser un número de puerto válido (entre 1 y 65535). Valor actual: "${process.env.DB_PORT}".`,
    );
  }

  // DB_SSL es opcional. Si se activa, se requiere el certificado de CA.
  if (process.env.DB_SSL === 'true') {
    const caCert = process.env.DB_CA_CERT;
    if (!caCert) {
      throw new Error(
        'DB_SSL está activada pero falta la variable DB_CA_CERT con la ruta al certificado CA de MySQL.',
      );
    }
    if (!fs.existsSync(caCert)) {
      throw new Error(
        `El certificado CA configurado en DB_CA_CERT no existe: ${caCert}`,
      );
    }
  }
}

async function bootstrap() {
  validarVariablesDeEntorno();

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      validationError: { target: false },
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();
