# Proposal

## Why

IphoneFY actualmente permite el inicio de sesión con una sola cuenta de Google (restringida por la variable de entorno `ALLOWED_GOOGLE_EMAIL`), por lo que solo una persona puede usar la aplicación. Además, no existe una entidad de usuario y los productos, compras y ventas son globales y compartidos, sin aislamiento entre personas. El módulo de Ganancias tampoco filtra por usuario. Este cambio permitirá que múltiples usuarios ingresen con sus propias cuentas de Google y que cada uno gestione de forma independiente y segura sus propios productos, compras, ventas y ganancias.

## What Changes

- Reemplazar la restricción de un solo correo permitido (`ALLOWED_GOOGLE_EMAIL`) por autenticación multiusuario con Google OAuth, aceptando cualquier cuenta de Google.
- Crear una entidad `Usuario` vinculada a la cuenta de Google (email, nombre, foto, identificador de Google).
- Asociar los datos de producto, compra y venta a un usuario autenticado, de modo que cada usuario solo pueda consultar, crear, modificar y eliminar sus propios registros. Un usuario nunca debe poder acceder ni modificar información de otro usuario.
- Incluir el módulo de Ganancias dentro del alcance de aislamiento: todas las consultas y cálculos de ganancias deben considerar exclusivamente los datos del usuario autenticado.
- Agregar cambios en el frontend de React: gestión de sesión, autenticación, envío de credenciales o tokens y manejo de respuestas no autorizadas (401).
- Proteger las peticiones posteriores al login con Google mediante un JWT propio generado por el backend tras validar el token de Google. El frontend guarda el JWT en `localStorage` y lo envía en las peticiones protegidas mediante el encabezado `Authorization: Bearer <token>`.
- Asegurar que la identidad del usuario se obtenga desde una autenticación validada por el backend, nunca confiando en un ID enviado libremente desde el frontend.
- **BREAKING**: Se elimina el comportamiento de un único usuario autorizado; cualquier cuenta de Google podrá iniciar sesión. Los datos existentes no se migran.

## Capabilities

### New Capabilities

- `user-auth`: Autenticación multiusuario con Google OAuth, creación y gestión de identidades de usuario, y principio de aislamiento de datos por usuario.
- `data-isolation`: Aislamiento de datos de productos, compras, ventas y ganancias por usuario autenticado. Cada operación de lectura, creación, modificación y eliminación filtra o asocia los datos exclusivamente al usuario autenticado.
- `ganancias-usuario`: Módulo de Ganancias aislado por usuario; todas las consultas y cálculos consideran solo los datos del usuario autenticado.
- `frontend-auth`: Gestión de sesión, autenticación con Google, envío de credenciales/tokens y manejo de respuestas no autorizadas en el frontend React.

### Modified Capabilities

- (ninguno: no existen especificaciones previas en el proyecto)

## Impact

- Código backend: `src/Auth/` (servicio y controlador de autenticación), nueva entidad `Usuario`, módulos `Producto`, `Compra`, `Venta` y `Ganancias` (asociación a usuario, filtros de aislamiento y protección de endpoints).
- Código frontend: servicios de API (`src/services`), hooks (`src/hooks`), páginas (`src/pages`) y componentes (`src/components`) para gestión de sesión, envío de token y manejo de respuestas 401.
- API: el endpoint `POST /auth/google` acepta cualquier cuenta de Google y devuelve un JWT propio del backend que identifica al usuario autenticado. Los endpoints de producto, compra, venta y ganancia filtran los datos por el usuario autenticado y rechazan el acceso a datos de otros usuarios.
- Dependencias: `google-auth-library` (ya presente), TypeORM (relaciones hacia `Usuario`), librería de JWT para NestJS.
- Base de datos: nueva tabla `usuario` y columnas de asociación en las tablas de producto, compra y venta (en la nueva base de datos MySQL; no se toca ni se elimina la base de datos actual).

## Decisiones confirmadas

1. **Cualquier cuenta de Google válida puede ingresar**: Se elimina la restricción de `ALLOWED_GOOGLE_EMAIL`. Cualquier persona con una cuenta de Google válida puede autenticarse. No se mantiene lista de correos autorizados ni allowlist.

2. **Google OAuth + JWT propio del backend**: El backend valida el token de ID de Google con `google-auth-library` y, tras la validación, genera su propio JWT que identifica al usuario autenticado. El frontend guarda el JWT en `localStorage` y lo envía en las peticiones protegidas mediante el encabezado `Authorization: Bearer <token>`. No se implementa refresh token; cuando el JWT expire, el usuario deberá volver a iniciar sesión con Google.

3. **Asociación de datos a usuarios mediante `id_usuario`**: Cada entidad (`Producto`, `Compra` y `Venta`) tiene una asociación directa a `Usuario` mediante su propia columna `id_usuario` (relación ManyToOne). Todos los registros creados quedan asociados al usuario autenticado. Las operaciones de consulta, creación, modificación y eliminación respetan esa propiedad. Las ganancias se calculan exclusivamente con los datos del usuario autenticado. En las operaciones de canje o toma de otro celular (venta con celular recibido como parte de pago), los nuevos registros de `Producto` y `Compra` también quedan asociados al usuario que realiza la venta.

4. **Columna `id_usuario` obligatoria (NOT NULL) desde el diseño**: La columna `id_usuario` se define como obligatoria en las tablas `producto`, `compra` y `venta`, siempre que la secuencia de creación de tablas y relaciones lo permita. No se aplicará backfill ni asignación de usuario por defecto a registros antiguos porque no existen registros antiguos en la nueva base de datos.

5. **Nomenclatura unificada**: Se utiliza exclusivamente `Usuario` para la entidad, `usuario` para la tabla y `id_usuario` para la columna de asociación. No se mezclan `User`, `usuario`, `user_id` e `id_usuario`.

### Flujo de compra automática al crear un producto (comportamiento a mantener)

El flujo actual de creación automática de compra al crear un producto funciona correctamente y debe mantenerse. Cuando se crea un producto, el usuario ingresa también su precio de compra, por lo que el backend genera automáticamente la compra correspondiente, evitando que el usuario tenga que cargar dos veces la misma información. Este comportamiento no se elimina ni se modifica. Al incorporar usuarios, la compra generada automáticamente queda asociada al mismo usuario que creó el producto.

### Validación de propiedad en ventas

Una venta solo puede realizarse si el producto y la compra relacionada pertenecen al usuario autenticado. Esta validación también aplica a las operaciones de modificación y eliminación para impedir referencias cruzadas entre usuarios. Los productos y compras generados por el celular recibido como parte de pago en una venta también quedan asociados al usuario que realiza la venta y deben respetar el mismo aislamiento.

### Recomendación de librería JWT para NestJS

Se analizó la alternativa entre `@nestjs/jwt` con un guard propio e implementar Passport con JWT. Se recomienda utilizar `@nestjs/jwt` con un guard propio (`JwtAuthGuard`) por ser más sencillo, con menos configuración y más mantenible para este proyecto, dado que ya se usa TypeORM y la autenticación proviene exclusivamente de Google OAuth. No se instalan dependencias en esta etapa de documentación.
