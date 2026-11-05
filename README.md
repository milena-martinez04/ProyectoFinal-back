# IphoneFY — Backend

API REST para gestión de compra-venta de celulares (iPhone), desarrollada con NestJS, TypeORM y MySQL. Permite autenticación con Google OAuth, manejo de productos (celulares), compras, ventas (incluyendo celulares tomados como parte de pago) y reportes de ganancias, con aislamiento de datos por usuario autenticado.

## Tecnologías utilizadas

- [NestJS](https://nestjs.com/) (framework Node.js)
- TypeScript
- [TypeORM](https://typeorm.io/) (ORM)
- MySQL / [mysql2](https://www.npmjs.com/package/mysql2)
- [class-validator](https://github.com/typestack/class-validator) y [class-transformer](https://github.com/typestack/class-transformer) (validación y transformación de DTOs)
- [@nestjs/config](https://docs.nestjs.com/techniques/configuration) (variables de entorno)
- [@nestjs/jwt](https://docs.nestjs.com/security/authentication) (JWT)
- [google-auth-library](https://github.com/googleapis/google-auth-library-nodejs) (verificación de tokens de Google OAuth)
- Jest (tests)

## Requisitos previos

- Node.js instalado (v18 o superior recomendado)
- MySQL server instalado y corriendo (local o remoto)
- Cuenta de Google con credenciales de OAuth (Client ID) para el login
- Un archivo `.env` en la raíz del proyecto con las variables de entorno requeridas

## Instalación de dependencias

Desde la raíz del proyecto:

```bash
npm install
```

## Configuración de variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables. Los valores son ejemplo; reemplazar por los reales del entorno:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=nombre_base_datos

JWT_SECRET=secreto_para_firmar_jwt
JWT_EXPIRATION=1h

DB_SSL=false
# DB_CA_CERT=ruta/al/certificado/ca.pem  # solo si DB_SSL=true

GOOGLE_CLIENT_ID=tu_client_id_de_google.apps.googleusercontent.com

FRONTEND_URL=http://localhost:5173
PORT=3000
```

Variables obligatorias para la conexión a MySQL: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME`.  
`DB_SSL` es opcional; si se establece en `true`, también se requiere `DB_CA_CERT` con la ruta al certificado CA de MySQL.  
`GOOGLE_CLIENT_ID` y `JWT_SECRET` son obligatorias para la autenticación.

## Configuración de MySQL local

1. Instalar MySQL y crear una base de datos vacía (por ejemplo, el nombre indicado en `DB_NAME`).
2. Configurar un usuario y contraseña con permisos sobre esa base de datos (`DB_USER`, `DB_PASSWORD`).
3. Completar el archivo `.env` con los datos de conexión.
4. El proyecto usa TypeORM con `synchronize: false`; el esquema se aplica mediante migraciones.

## Ejecución de migraciones

Los scripts de migración están definidos en `package.json` y apuntan al archivo `src/data-source/data-source.ts`:

```bash
# Ejecutar migraciones pendientes
npm run migration:run

# Revertir la última migración aplicada
npm run migration:revert
```

## Inicio del servidor

```bash
# Modo desarrollo (con recarga automática)
npm run start:dev

# Compilación para producción
npm run build

# Inicio en producción (después de build)
npm run start:prod

# Ejecutar tests
npm test
```

El servidor escucha en `PORT` (por defecto `3000`) y expone la API bajo el prefijo global `api/v1` (configurado en `src/main.ts`).

## Autenticación Google OAuth y JWT

El endpoint de autenticación es:

- `POST /api/v1/auth/google` — recibe `{ token }` (ID Token de Google), lo verifica con `google-auth-library`, crea o recupera el usuario por su `googleId`, y devuelve un JWT firmado (`accessToken`) junto con los datos del usuario (id, nombre, email, foto).

Los endpoints protegidos requieren el JWT en el encabezado `Authorization: Bearer <token>`, validado por el guard `JwtAuthGuard`.

## Identificación del usuario autenticado y aislamiento de datos

Cada request autenticada se identifica mediante el `sub` del payload del JWT (el `id` del usuario en la base de datos). El `JwtAuthGuard` inyecta el usuario en la request y el decorador `GetUser` lo expone a los controladores.

Todos los servicios filtran los datos por `id_usuario` en cada consulta (`find`, `findBy`, `findOne`, `softDelete`, etc.), de modo que un usuario solo puede acceder a sus propios productos, compras y ventas. Esto se aplica en:

- Producto: creación asociada al usuario, listado, búsqueda, actualización y eliminación filtrados por `id_usuario`.
- Compra: validación de que el producto pertenece al usuario antes de crear; listado, búsqueda, actualización y eliminación filtrados por `id_usuario`.
- Venta: validación de producto y compra del usuario; listado, búsqueda, actualización y eliminación filtrados por `id_usuario`. Al crear una venta, el producto vendido se desactiva (`softDelete`) vinculado al usuario autenticado.
- Ganancias: reportes calculados únicamente sobre las ventas del usuario autenticado.

La creación automática de una `Compra` al crear un `Producto` se conserva sin cambios.

## Endpoints principales

Todas las rutas están bajo el prefijo `api/v1`.

### Autenticación
| Método | Ruta | Cuerpo | Descripción |
|--------|------|--------|-------------|
| POST | `/auth/google` | `{ token: string }` | Login con Google OAuth y emisión de JWT |

### Productos (requiere autenticación)
| Método | Ruta | Cuerpo | Descripción |
|--------|------|--------|-------------|
| POST | `/producto` | `CreateProductoDTO` | Crea un producto y una compra asociada automáticamente |
| GET | `/producto` | — | Lista productos del usuario autenticado |
| GET | `/producto/:id` | — | Obtiene un producto por ID |
| GET | `/producto/fecha/:date` | — | Busca productos por fecha de ingreso |
| GET | `/producto/modelo/:modelo` | — | Busca productos por modelo |
| PATCH | `/producto/:id` | `UpdateProductoDTO` | Actualiza campos permitidos de un producto |
| DELETE | `/producto/:id` | — | Elimina (soft delete) un producto |

### Compras (requiere autenticación)
| Método | Ruta | Cuerpo | Descripción |
|--------|------|--------|-------------|
| POST | `/compra` | `CreateCompraDTO` | Registra una compra |
| GET | `/compra` | — | Lista compras del usuario autenticado |
| GET | `/compra/:id` | — | Obtiene una compra por ID |
| GET | `/compra/fecha/:date` | — | Busca compras por fecha |
| PATCH | `/compra/:id` | `UpdateCompraDTO` | Actualiza campos permitidos de una compra |
| DELETE | `/compra/:id` | — | Elimina (soft delete) una compra |

### Ventas (requiere autenticación)
| Método | Ruta | Cuerpo | Descripción |
|--------|------|--------|-------------|
| POST | `/venta` | `CreateVentaDTO` | Registra una venta (incluye celular como parte de pago si aplica) |
| GET | `/venta` | — | Lista ventas del usuario autenticado |
| GET | `/venta/:id` | — | Obtiene una venta por ID |
| GET | `/venta/fecha/:date` | — | Busca ventas por fecha |
| PATCH | `/venta/:id` | `UpdateVentaDTO` | Actualiza campos permitidos de una venta |
| DELETE | `/venta/:id` | — | Elimina (soft delete) una venta |

### Ganancias (requiere autenticación)
| Método | Ruta | Query params | Descripción |
|--------|------|--------------|-------------|
| GET | `/ganancia/ganancia-mensual` | `mes`, `anio` | Total de ventas, compras y ganancia de un mes |
| GET | `/ganancia/ganancia-semanal` | `fecha` | Total de ventas, compras y ganancia de una semana |
| GET | `/ganancia/resumen` | — | Resumen mensual acumulado de ganancias |

Los cuerpos de request (`CreateProductoDTO`, `UpdateProductoDTO`, `CreateCompraDTO`, `UpdateCompraDTO`, `CreateVentaDTO`, `UpdateVentaDTO`) están definidos como DTOs con `class-validator` en cada módulo.

## Estructura de carpetas y módulos principales

```
src/
├── main.ts                      # Punto de entrada, ValidationPipe global, validación de variables de entorno, CORS
├── app.module.ts                # Módulo raíz (ConfigModule, TypeORM, módulos de negocio)
├── app.controller.ts            # Endpoint raíz de salud
├── app.service.ts
├── Auth/
│   ├── auth.controller.ts       # POST /auth/google
│   ├── auth.service.ts          # Verificación Google, emisión JWT, creación/recuperación de usuario
│   ├── auth.module.ts
│   ├── jwt-auth.guard.ts        # Protección de endpoints con JWT
│   ├── get-user.decorator.ts    # Inyección del usuario autenticado en la request
│   ├── Dto/loginGoogle.DTO.ts
│   └── entities/usuario.entity.ts
├── Celular/
│   └── TomarCelularDto.ts       # DTO de celular recibido como parte de pago
├── Compra/
│   ├── compra.controller.ts
│   ├── compra.service.ts
│   ├── compra.module.ts
│   ├── Dto/
│   └── entities/compra.entity.ts
├── Producto/
│   ├── producto.controller.ts
│   ├── producto.service.ts
│   ├── producto.module.ts
│   ├── Dto/
│   └── entities/producto.entity.ts
├── Venta/
│   ├── venta.controller.ts
│   ├── venta.service.ts
│   ├── venta.module.ts
│   ├── Dto/
│   └── entities/venta.entity.ts
├── Ganancias/
│   ├── ganancia.controller.ts
│   ├── ganancia.service.ts
│   └── ganancia.module.ts
├── data-source/data-source.ts   # DataSource de TypeORM usado por las migraciones
└── migrations/                  # Migraciones de la base de datos
```

Cada módulo de negocio (Producto, Compra, Venta, Ganancias) importa `AuthModule` para reutilizar el guard de autenticación y garantizar el aislamiento de datos por usuario.
