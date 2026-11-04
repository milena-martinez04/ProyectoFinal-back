# Design

## Context

El proyecto IphoneFY es una aplicación de gestión de stock, compras, ventas y ganancias de iPhones desarrollada con React, TypeScript, NestJS, TypeORM y MySQL. Actualmente la autenticación usa Google OAuth pero restringe el acceso a un único correo autorizado (`ALLOWED_GOOGLE_EMAIL`) y no existe una entidad de usuario. Los productos, compras y ventas son globales y compartidos, sin asociación a ningún usuario. El módulo de Ganancias tampoco filtra por usuario. El frontend de React no tiene gestión de sesión real: solo guarda el perfil devuelto por Google en `localStorage` y no envía credenciales ni tokens en las peticiones a la API.

Los documentos de OpenSpec se escriben en español. No se modificará ni eliminará la base de datos actual durante el desarrollo; se usará una base de datos MySQL nueva más adelante.

## Goals / Non-Goals

**Goals:**
- Permitir que múltiples usuarios se autentiquen con sus propias cuentas de Google mediante Google OAuth.
- Crear una entidad `Usuario` vinculada a la cuenta de Google.
- Asociar productos, compras, ventas y ganancias a un usuario, garantizando el aislamiento de datos entre usuarios.
- Mantener Google OAuth como único método de autenticación (sin registro con email y contraseña).
- No tocar ni eliminar la base de datos actual durante el desarrollo y la planificación.
- Incluir cambios en el frontend de React: gestión de sesión, autenticación, envío de credenciales o tokens y manejo de respuestas no autorizadas.
- Proteger las peticiones posteriores al login con Google mediante un JWT propio generado por el backend tras validar el token de Google.
- Asegurar que la identidad del usuario se obtenga desde una autenticación validada por el backend, nunca confiando en un ID enviado libremente desde el frontend.

**Non-Goals:**
- Registro de usuarios con email y contraseña.
- Autenticación con proveedores distintos a Google.
- Migración de datos de la base de datos actual.
- Modificar ni eliminar la base de datos actual durante el desarrollo y la planificación.

## Decisions

### Usar Google OAuth como único proveedor de identidad
**Razón:** El proyecto ya usa `google-auth-library` y el contexto del proyecto exige mantener Google OAuth sin incorporar registro con email y contraseña.
**Alternativa considerada:** Soporte para múltiples proveedores OAuth (GitHub, Microsoft). Descartada porque no está en el alcance y añadiría complejidad innecesaria.

### Entidad `Usuario` y asociación directa de datos a usuarios
**Razón:** Es necesario crear una entidad `Usuario` (id, email de Google, nombre, foto, identificador de Google, fechas de creación y actualización) como punto central de aislamiento. Cada entidad (`Producto`, `Compra` y `Venta`) tiene su propia columna `id_usuario` con relación ManyToOne hacia `Usuario`. La columna `id_usuario` se define como obligatoria (NOT NULL) desde el diseño inicial, siempre que la secuencia de creación de tablas y relaciones lo permita. Todos los registros creados quedan asociados al usuario autenticado, y las operaciones de consulta, creación, modificación y eliminación respetan esa propiedad. En las ventas con celular recibido como parte de pago (`pago_celular = true`), el backend crea un **producto nuevo** a partir de los datos del celular recibido y una **compra nueva** para ese producto. Esos nuevos registros también quedan asociados al usuario que realiza la venta. Las ganancias se calculan exclusivamente con los datos del usuario autenticado.
**Nomenclatura:** Se utiliza exclusivamente `Usuario` para la entidad, `usuario` para la tabla y `id_usuario` para la columna de asociación. No se mezclan `User`, `usuario`, `user_id` e `id_usuario`.

### Compra automática al crear un producto (comportamiento a mantener)
**Razón:** El flujo actual de creación automática de compra al crear un producto funciona correctamente y debe mantenerse. Cuando se crea un producto, el usuario ingresa también su precio de compra, por lo que el backend genera automáticamente la compra correspondiente, evitando que el usuario tenga que cargar dos veces la misma información. Este comportamiento no se elimina ni se modifica. Al incorporar usuarios, la compra generada automáticamente queda asociada al mismo usuario que creó el producto.
**Alternativa considerada:** Eliminar la creación automática y obligar al usuario a crear la compra por separado. Descartada porque duplica la entrada de información y degrada la experiencia de usuario.

### Validación de propiedad en ventas y operaciones cruzadas
**Razón:** Una venta solo puede realizarse si el producto y la compra relacionada pertenecen al usuario autenticado. Esta validación también aplica a las operaciones de modificación y eliminación para impedir referencias cruzadas entre usuarios. Los productos y compras generados por el celular recibido como parte de pago en una venta también quedan asociados al usuario que realiza la venta y deben respetar el mismo aislamiento.
**Alternativa considerada:** Permitir ventas sobre productos o compras de cualquier usuario. Descartada porque viola el principio de aislamiento de datos.

### Filtrado de aislamiento a nivel de servicio y repositorio
**Razón:** Cada servicio (Producto, Compra, Venta, Ganancia) recibirá el identificador del usuario autenticado y agregará una condición `where { id_usuario: userId }` a todas las consultas de lectura y escritura, evitando que un usuario acceda a datos de otro.
**Alternativa considerada:** Filtros solo en el controlador. Descartada porque deja expuesta la capa de servicio si se reutiliza en otros contextos.

### Obtención de la identidad del usuario desde el backend validado
**Razón:** La identidad del usuario en cada petición protegida debe obtenerse exclusivamente del token de autenticación validado por el backend (JWT propio). Nunca se debe aceptar un `id_usuario` o `userId` enviado desde el frontend en el cuerpo de la petición, query params o headers personalizados, ya que un cliente malicioso podría suplantar a otro usuario.
**Alternativa considerada:** Permitir que el frontend envíe el `id_usuario`. Descartada porque no es segura y viola el principio de aislamiento.

### Autenticación con JWT propio del backend
**Razón:** Tras validar el token de ID de Google, el backend genera su propio JWT que identifica al usuario autenticado. El frontend guarda el JWT en `localStorage` y lo envía en el encabezado `Authorization: Bearer <token>` de cada petición protegida. Es stateless (no guarda sesiones en servidor), funciona bien con SPA de React, el backend extrae el `userId` del token validado y no confía en el frontend, y no depende de validar con Google en cada petición.
**Decisión confirmada:** No se implementará refresh token; cuando el JWT expire, el usuario deberá volver a iniciar sesión con Google.
**Recomendación de librería JWT:** Se analizó la alternativa entre `@nestjs/jwt` con un guard propio e implementar Passport con JWT. Se recomienda utilizar `@nestjs/jwt` con un guard propio (`JwtAuthGuard`) por ser más sencillo, con menos configuración y más mantenible para este proyecto, dado que ya se usa TypeORM y la autenticación proviene exclusivamente de Google OAuth. No se instalan dependencias en esta etapa de documentación.

### Nueva base de datos MySQL vacía, sin datos antiguos
**Razón:** Se usará una base de datos MySQL completamente nueva. No se conservarán ni migrarán los datos actuales. La base de datos comienza vacía. No se modifica ni se elimina la base de datos actual durante el desarrollo ni la planificación. La columna `id_usuario` se define como obligatoria (NOT NULL) desde el diseño inicial, siempre que la secuencia de creación de tablas y relaciones lo permita. No se aplicará backfill ni asignación de usuario por defecto porque no existen registros antiguos.

### Cambios en el frontend de React
**Razón:** El frontend actualmente no gestiona sesión real ni envía credenciales en las peticiones. Se deben agregar:
- Guarda de rutas: redirigir al login si no hay sesión válida.
- Almacenamiento de la sesión (usuario y JWT del backend) en `localStorage` tras el login con Google.
- Envío del token de autenticación en las peticiones a la API (encabezado `Authorization: Bearer <token>`).
- Manejo centralizado de respuestas 401 (limpiar sesión y redirigir al login).
- Cierre de sesión que limpie el almacenamiento y redirija al login.
**Alternativa considerada:** No tocar el frontend (como indicaba el diseño original). Descartada porque sin cambios en el frontend no es posible enviar el token de autenticación ni proteger las peticiones posteriores al login.

## Risks / Trade-offs

- [Riesgo] Olvidar aplicar el filtro de `id_usuario` en alguna consulta de producto, compra, venta o ganancia → [Mitigación] Revisar todas las consultas de lectura y escritura en servicios y escribir pruebas de aislamiento por usuario.
- [Riesgo] Dependencia de la variable de entorno `GOOGLE_CLIENT_ID` para validar tokens de Google → [Mitigación] Documentar la variable de entorno requerida y validar su presencia al iniciar la aplicación.
- [Riesgo] Aceptar un `id_usuario` enviado desde el frontend → [Mitigación] Obtener la identidad exclusivamente del token validado por el backend; ignorar cualquier `id_usuario` enviado por el cliente.
- [Riesgo] Que el celular recibido como parte de pago genere un producto y una compra nuevos sin asociarlos al usuario → [Mitigación] Asegurar que en `VentaService.create()` los nuevos producto y compra creados por el celular recibido también reciban el `id_usuario` del vendedor.
- [Trade-off] No se migran los datos actuales → los usuarios existentes (si los hubiera) deben comenzar de cero en la nueva base de datos.
- [Trade-off] Usar JWT propio requiere definir expiración y almacenamiento en frontend → [Mitigación] Decisión confirmada: JWT en `localStorage`, encabezado `Authorization: Bearer`, sin refresh token; al expirar el JWT el usuario vuelve a iniciar sesión con Google.

## Migration Plan

1. Crear la nueva entidad `Usuario` en TypeORM con los campos: id, email de Google, nombre, foto de perfil, identificador de Google (`googleId`), fechas de creación y actualización. Verificar que la configuración de TypeORM apunta a las rutas de migración correctas (`dist/migrations/*.js` para la DataSource de migraciones).
2. Agregar la columna `id_usuario` como obligatoria (NOT NULL) con relación ManyToOne a `Usuario` en las entidades `Producto`, `Compra` y `Venta`, siempre que la secuencia de creación de tablas y relaciones lo permita.
3. Generar las migraciones TypeORM contra la nueva base de datos MySQL vacía.
4. Ejecutar las migraciones de TypeORM contra la nueva base de datos MySQL y verificar que las tablas `usuario`, `producto`, `compra` y `venta` se crean con la columna `id_usuario`.
5. Actualizar `AuthService` para eliminar la restricción de `ALLOWED_GOOGLE_EMAIL`, crear/recuperar usuarios por cuenta de Google y emitir un JWT propio tras validar el token de Google.
6. Agregar un guard/decorador de autenticación en NestJS (`JwtAuthGuard` con `@nestjs/jwt`) para extraer el `id_usuario` del token validado por el backend en cada endpoint protegido, sin confiar en un `id_usuario` enviado desde el frontend.
7. Actualizar los servicios de `Producto`, `Compra`, `Venta` y `Ganancias` para recibir el `id_usuario` del usuario autenticado y filtrar todas las consultas de lectura y escritura por ese usuario. En `VentaService`, asegurar que los producto y compra creados por el celular recibido también se asocien al usuario. Validar que una venta solo puede realizarse si el producto y la compra relacionada pertenecen al usuario autenticado; aplicar esta misma restricción a modificación y eliminación.
8. Actualizar los controladores para extraer el usuario autenticado y pasar su `id` al servicio, sin aceptar `id_usuario` enviado desde el frontend.
9. Actualizar el frontend de React: guarda de rutas, almacenamiento de sesión (usuario y JWT del backend) en `localStorage`, envío de token en peticiones a la API mediante `Authorization: Bearer`, manejo de respuestas 401 y cierre de sesión.
10. Escribir y ejecutar pruebas de aislamiento entre usuarios para productos, compras, ventas y ganancias (lectura, creación, modificación y eliminación), incluyendo validación de propiedad en ventas.
11. No se aplica backfill ni migración de registros antiguos porque la base de datos comienza vacía.
12. No se modifica ni se elimina la base de datos actual.
