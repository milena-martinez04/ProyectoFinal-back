# Spec Delta

## Purpose

Permitir que múltiples usuarios se autentiquen con sus propias cuentas de Google y garanticen el aislamiento de sus productos, compras, ventas y ganancias entre usuarios. Cada operación de lectura, creación, modificación y eliminación debe considerar exclusivamente los datos del usuario autenticado. Un usuario nunca debe poder acceder ni modificar información de otro usuario.

## ADDED Requirements

### Requirement 1: Autenticación multiusuario con Google OAuth

El sistema SHALL permitir que cualquier usuario inicie sesión con su propia cuenta de Google mediante Google OAuth, sin restringir el acceso a un único correo autorizado.

#### Scenario: Inicio de sesión exitoso con cuenta de Google
- **WHEN** el usuario envía un token de ID de Google válido al endpoint de autenticación
- **THEN** el sistema valida el token con Google y autentica al usuario asociado a esa cuenta de Google

#### Scenario: Token de Google inválido o expirado
- **WHEN** el usuario envía un token de ID de Google inválido o expirado
- **THEN** el sistema rechaza la autenticación con un error de no autorizado (401)

#### Scenario: Token de Google sin email
- **WHEN** el token de Google es válido pero no contiene email
- **THEN** el sistema rechaza la autenticación con un error de no autorizado (401)

### Requirement 2: Creación y recuperación de perfil de usuario

El sistema SHALL crear un perfil de usuario vinculado a la cuenta de Google la primera vez que un usuario inicia sesión, y recuperar el perfil existente en sesiones posteriores.

#### Scenario: Creación de perfil en primer inicio de sesión
- **WHEN** un usuario inicia sesión por primera vez con una cuenta de Google nueva
- **THEN** el sistema crea un registro de usuario con el email, nombre y foto de perfil de Google

#### Scenario: Inicio de sesión de usuario ya registrado
- **WHEN** un usuario ya registrado inicia sesión nuevamente con la misma cuenta de Google
- **THEN** el sistema recupera el usuario existente sin crear un duplicado

### Requirement 3: Obtención de la identidad del usuario desde el backend validado

El sistema SHALL obtener la identidad del usuario exclusivamente desde una autenticación validada por el backend. Nunca se debe confiar en un identificador de usuario enviado libremente desde el frontend (ni en el cuerpo de la petición, ni en query params, ni en headers personalizados).

#### Scenario: Petición con userId enviado desde el frontend
- **WHEN** una petición incluye un `id_usuario` o `userId` enviado desde el frontend intentando suplantar a otro usuario
- **THEN** el sistema ignora ese valor y utiliza únicamente la identidad obtenida del token de autenticación validado por el backend

#### Scenario: Petición sin autenticación válida
- **WHEN** una petición a un endpoint protegido no incluye credenciales válidas o el token no puede ser validado por el backend
- **THEN** el sistema rechaza la petición con un error de no autorizado (401)

### Requirement 4: Protección de peticiones posteriores al login con Google

El sistema SHALL proteger las peticiones realizadas después del login con Google mediante un JWT propio generado por el backend tras validar el token de Google. El JWT debe identificar al usuario autenticado. El frontend guarda el JWT en `localStorage` y lo envía en las peticiones protegidas mediante el encabezado `Authorization: Bearer <token>`. El backend valida el JWT antes de atender cada petición. No se implementa refresh token; cuando el JWT expire, el usuario deberá volver a iniciar sesión con Google.

#### Scenario: Petición posterior al login con token válido
- **WHEN** el usuario está autenticado y envía una petición protegida con su token de sesión válido
- **THEN** el sistema valida el token, obtiene la identidad del usuario y atiende la petición

#### Scenario: Petición posterior al login con token ausente o inválido
- **WHEN** el usuario envía una petición protegida sin token o con un token inválido/expirado
- **THEN** el sistema rechaza la petición con un error de no autorizado (401)

### Requirement 5: Aislamiento de datos de Producto (CRUD completo)

El sistema SHALL asegurar que cada producto pertenezca a un usuario autenticado, y que un usuario nunca pueda consultar, crear, modificar ni eliminar productos de otro usuario.

#### Scenario: Usuario consulta solo sus propios productos
- **WHEN** un usuario autenticado solicita la lista de productos
- **THEN** el sistema devuelve solo los productos asociados a ese usuario

#### Scenario: Usuario crea producto asociado a su cuenta
- **WHEN** un usuario autenticado crea un producto
- **THEN** el sistema asocia el producto al usuario autenticado y lo devuelve como creado

#### Scenario: Usuario consulta un producto propio por ID
- **WHEN** un usuario autenticado solicita un producto que le pertenece por su ID
- **THEN** el sistema devuelve ese producto

#### Scenario: Usuario no puede acceder a producto de otro usuario
- **WHEN** un usuario autenticado intenta consultar un producto que pertenece a otro usuario
- **THEN** el sistema rechaza el acceso con un error de no autorizado o no encontrado

#### Scenario: Usuario modifica su propio producto
- **WHEN** un usuario autenticado modifica un producto que le pertenece
- **THEN** el sistema aplica los cambios y devuelve el producto actualizado

#### Scenario: Usuario no puede modificar producto de otro usuario
- **WHEN** un usuario autenticado intenta modificar un producto que pertenece a otro usuario
- **THEN** el sistema rechaza la modificación con un error de no autorizado o no encontrado

#### Scenario: Usuario elimina su propio producto
- **WHEN** un usuario autenticado elimina un producto que le pertenece
- **THEN** el sistema elimina (soft delete) el producto y confirma la eliminación

#### Scenario: Usuario no puede eliminar producto de otro usuario
- **WHEN** un usuario autenticado intenta eliminar un producto que pertenece a otro usuario
- **THEN** el sistema rechaza la eliminación con un error de no autorizado o no encontrado

### Requirement 6: Aislamiento de datos de Compra (CRUD completo)

El sistema SHALL asegurar que cada compra pertenezca a un usuario autenticado, y que un usuario nunca pueda consultar, crear, modificar ni eliminar compras de otro usuario.

#### Scenario: Usuario consulta solo sus propias compras
- **WHEN** un usuario autenticado solicita la lista de compras
- **THEN** el sistema devuelve solo las compras asociadas a ese usuario

#### Scenario: Usuario crea compra asociada a su cuenta
- **WHEN** un usuario autenticado crea una compra
- **THEN** el sistema asocia la compra al usuario autenticado

#### Scenario: Usuario consulta una compra propia por ID
- **WHEN** un usuario autenticado solicita una compra que le pertenece por su ID
- **THEN** el sistema devuelve esa compra

#### Scenario: Usuario no puede acceder a compra de otro usuario
- **WHEN** un usuario autenticado intenta consultar una compra que pertenece a otro usuario
- **THEN** el sistema rechaza el acceso con un error de no autorizado o no encontrado

#### Scenario: Usuario modifica su propia compra
- **WHEN** un usuario autenticado modifica una compra que le pertenece
- **THEN** el sistema aplica los cambios y devuelve la compra actualizada

#### Scenario: Usuario no puede modificar compra de otro usuario
- **WHEN** un usuario autenticado intenta modificar una compra que pertenece a otro usuario
- **THEN** el sistema rechaza la modificación con un error de no autorizado o no encontrado

#### Scenario: Usuario elimina su propia compra
- **WHEN** un usuario autenticado elimina una compra que le pertenece
- **THEN** el sistema elimina (soft delete) la compra y confirma la eliminación

#### Scenario: Usuario no puede eliminar compra de otro usuario
- **WHEN** un usuario autenticado intenta eliminar una compra que pertenece a otro usuario
- **THEN** el sistema rechaza la eliminación con un error de no autorizado o no encontrado

### Requirement 7: Aislamiento de datos de Venta (CRUD completo)

El sistema SHALL asegurar que cada venta pertenezca a un usuario autenticado, y que un usuario nunca pueda consultar, crear, modificar ni eliminar ventas de otro usuario. Esto incluye las ventas con celulares recibidos como parte de pago, que generan un producto y una compra adicionales asociados al mismo usuario.

#### Scenario: Usuario consulta solo sus propias ventas
- **WHEN** un usuario autenticado solicita la lista de ventas
- **THEN** el sistema devuelve solo las ventas asociadas a ese usuario

#### Scenario: Usuario crea venta asociada a su cuenta
- **WHEN** un usuario autenticado crea una venta (con o sin celular recibido como parte de pago)
- **THEN** el sistema verifica que el producto y la compra relacionada pertenecen al usuario autenticado, asocia la venta al usuario autenticado y, si aplica, asocia también el producto y la compra creados por el celular recibido al mismo usuario

#### Scenario: Usuario no puede crear venta con producto o compra de otro usuario
- **WHEN** un usuario autenticado intenta crear una venta cuyo producto o compra relacionada pertenecen a otro usuario
- **THEN** el sistema rechaza la creación de la venta con un error de no autorizado o no encontrado

#### Scenario: Usuario modifica su propia venta
- **WHEN** un usuario autenticado modifica una venta que le pertenece
- **THEN** el sistema verifica que el producto y la compra relacionada sigan perteneciendo al usuario autenticado, aplica los cambios y devuelve la venta actualizada

#### Scenario: Usuario elimina su propia venta
- **WHEN** un usuario autenticado elimina una venta que le pertenece
- **THEN** el sistema elimina (soft delete) la venta y confirma la eliminación

#### Scenario: Usuario consulta una venta propia por ID
- **WHEN** un usuario autenticado solicita una venta que le pertenece por su ID
- **THEN** el sistema devuelve esa venta

#### Scenario: Usuario no puede acceder a venta de otro usuario
- **WHEN** un usuario autenticado intenta consultar una venta que pertenece a otro usuario
- **THEN** el sistema rechaza el acceso con un error de no autorizado o no encontrado

#### Scenario: Venta con celular recibido como parte de pago
- **WHEN** un usuario autenticado crea una venta con `pago_celular = true` y datos de celular recibido
- **THEN** el sistema crea el producto derivado del celular recibido y la compra asociada a ese producto, ambos vinculados al usuario autenticado, garantizando el aislamiento de esos datos adicionales

### Requirement 8: Módulo de Ganancias aislado por usuario

El sistema SHALL incluir el módulo de Ganancias dentro del alcance de aislamiento. Todas las consultas y cálculos de ganancias deben considerar exclusivamente los datos del usuario autenticado.

#### Scenario: Usuario consulta sus propias ganancias mensuales
- **WHEN** un usuario autenticado consulta la ganancia mensual
- **THEN** el sistema calcula la ganancia considerando solo las ventas asociadas a ese usuario

#### Scenario: Usuario consulta sus propias ganancias semanales
- **WHEN** un usuario autenticado consulta la ganancia semanal
- **THEN** el sistema calcula la ganancia considerando solo las ventas asociadas a ese usuario

#### Scenario: Usuario consulta su resumen de ganancias
- **WHEN** un usuario autenticado consulta el resumen de ganancias
- **THEN** el sistema devuelve el resumen considerando solo las ventas asociadas a ese usuario

#### Scenario: Usuario no puede ver ganancias de otro usuario
- **WHEN** se intenta calcular ganancias sin especificar el usuario autenticado
- **THEN** el sistema filtra por el usuario autenticado y nunca incluye ventas de otros usuarios

### Requirement 9: Frontend - Gestión de sesión y autenticación

El sistema frontend SHALL gestionar la sesión de usuario, autenticar con Google, enviar credenciales o tokens en las peticiones a la API y manejar respuestas no autorizadas.

#### Scenario: Login con Google y almacenamiento de sesión
- **WHEN** el usuario se autentica con Google y el backend valida el token
- **THEN** el frontend almacena la información de sesión (usuario y JWT propio del backend) en `localStorage` y redirige a la aplicación principal

#### Scenario: Envío de credenciales o token en peticiones a la API
- **WHEN** el frontend realiza peticiones a endpoints protegidos de productos, compras, ventas o ganancias
- **THEN** el frontend incluye el token de autenticación obtenido del backend en el encabezado `Authorization: Bearer <token>`

#### Scenario: Manejo de respuesta no autorizada (401)
- **WHEN** el backend responde con estado 401 a una petición del frontend
- **THEN** el frontend limpia la sesión, redirige al usuario al login y le notifica que su sesión expiró o no es válida

#### Scenario: Cierre de sesión
- **WHEN** el usuario cierra sesión
- **THEN** el frontend elimina la información de sesión almacenada y redirige al login

#### Scenario: Acceso a rutas protegidas sin sesión
- **WHEN** el usuario intenta acceder a una ruta de la aplicación sin sesión válida
- **THEN** el frontend redirige al usuario al login

### Requirement 10: Pruebas de aislamiento entre usuarios

El sistema SHALL incluir pruebas que verifiquen que un usuario autenticado no puede acceder ni modificar productos, compras, ventas ni ganancias de otro usuario, cubriendo operaciones de lectura, creación, modificación y eliminación.

## Decisiones confirmadas

1. **Cualquier cuenta de Google válida puede ingresar**: Se elimina la restricción de `ALLOWED_GOOGLE_EMAIL`. Cualquier persona con una cuenta de Google válida puede autenticarse. No se mantiene lista de correos autorizados ni allowlist.

2. **Google OAuth + JWT propio del backend**: El backend valida el token de ID de Google con `google-auth-library` y, tras la validación, genera su propio JWT que identifica al usuario autenticado. El frontend guarda el JWT en `localStorage` y lo envía en las peticiones protegidas mediante el encabezado `Authorization: Bearer <token>`. No se implementa refresh token; cuando el JWT expire, el usuario deberá volver a iniciar sesión con Google.

3. **Asociación de datos a usuarios mediante `id_usuario`**: Cada entidad (`Producto`, `Compra` y `Venta`) tiene una asociación directa a `Usuario` mediante su propia columna `id_usuario` (relación ManyToOne). Todos los registros creados quedan asociados al usuario autenticado. Las operaciones de consulta, creación, modificación y eliminación respetan esa propiedad. Las ganancias se calculan exclusivamente con los datos del usuario autenticado. En las operaciones de canje o toma de otro celular (venta con celular recibido como parte de pago), los nuevos registros de `Producto` y `Compra` también quedan asociados al usuario que realiza la venta.

4. **Nueva base de datos MySQL vacía, sin datos antiguos**: Se usará una base de datos MySQL completamente nueva. No se conservarán ni migrarán los datos actuales. La base de datos comienza vacía. No se modifica ni se elimina la base de datos actual durante el desarrollo ni la planificación.

5. **Columna `id_usuario` obligatoria (NOT NULL) desde el diseño**: La columna `id_usuario` se define como obligatoria en las tablas `producto`, `compra` y `venta`, siempre que la secuencia de creación de tablas y relaciones lo permita. No se aplicará backfill ni asignación de usuario por defecto a registros antiguos porque no existen registros antiguos en la nueva base de datos.

6. **Nomenclatura unificada**: Se utiliza exclusivamente `Usuario` para la entidad, `usuario` para la tabla y `id_usuario` para la columna de asociación. No se mezclan `User`, `usuario`, `user_id` e `id_usuario`.

### Flujo de compra automática al crear un producto (comportamiento a mantener)

El flujo actual de creación automática de compra al crear un producto funciona correctamente y debe mantenerse. Cuando se crea un producto, el usuario ingresa también su precio de compra, por lo que el backend genera automáticamente la compra correspondiente, evitando que el usuario tenga que cargar dos veces la misma información. Este comportamiento no se elimina ni se modifica. Al incorporar usuarios, la compra generada automáticamente queda asociada al mismo usuario que creó el producto.

### Validación de propiedad en ventas

Una venta solo puede realizarse si el producto y la compra relacionada pertenecen al usuario autenticado. Esta validación también aplica a las operaciones de modificación y eliminación para impedir referencias cruzadas entre usuarios. Los productos y compras generados por el celular recibido como parte de pago en una venta también quedan asociados al usuario que realiza la venta y deben respetar el mismo aislamiento.

### Recomendación de librería JWT para NestJS

Se analizó la alternativa entre `@nestjs/jwt` con un guard propio e implementar Passport con JWT. Se recomienda utilizar `@nestjs/jwt` con un guard propio (`JwtAuthGuard`) por ser más sencillo, con menos configuración y más mantenible para este proyecto, dado que ya se usa TypeORM y la autenticación proviene exclusivamente de Google OAuth. No se instalan dependencias en esta etapa de documentación.
