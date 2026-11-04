# Tasks

## 1. Autenticación y entidad de usuario

- [ ] 1.1 Crear la entidad `Usuario` en TypeORM (id, email de Google, nombre, foto de perfil, identificador de Google, fechas de creación y actualización) y verificar que el proyecto compila sin errores
- [ ] 1.2 Actualizar `AuthService` para eliminar la restricción de `ALLOWED_GOOGLE_EMAIL` y crear o recuperar el usuario vinculado a la cuenta de Google al iniciar sesión, verificando con una prueba de autenticación que acepta cualquier cuenta de Google
- [ ] 1.3 Verificar que el endpoint `POST /auth/google` valida el token de Google con el backend, devuelve el perfil del usuario autenticado (nombre, email, foto) y que un token de Google inválido o sin email retorna error de no autorizado (401)
- [ ] 1.4 Implementar la emisión de un JWT propio tras validar el token de Google, conteniendo el `id_usuario` firmado por el backend, para proteger peticiones posteriores. El JWT debe identificar al usuario autenticado.
- [ ] 1.5 Agregar un guard o decorador de autenticación en NestJS para extraer el `id_usuario` del token validado por el backend en cada endpoint protegido, sin confiar en un `id_usuario` enviado desde el frontend
- [ ] 1.6 Documentar y validar la presencia de la variable de entorno `GOOGLE_CLIENT_ID` al iniciar la aplicación
- [ ] 1.7 (Análisis de librería JWT, sin instalar dependencias) Evaluar `@nestjs/jwt` con guard propio vs Passport con JWT. Se recomienda `@nestjs/jwt` con `JwtAuthGuard` por ser más sencillo y mantenible para este proyecto. Documentar la decisión y no instalar dependencias en esta etapa.

## 2. Base de datos y migraciones

- [ ] 2.1 (Decisión confirmada) Asociación directa mediante `id_usuario`: cada entidad (`Producto`, `Compra` y `Venta`) tiene su propia columna `id_usuario` con relación ManyToOne a `Usuario`. Todos los registros creados quedan asociados al usuario autenticado, incluyendo los producto y compra creados por un celular recibido como parte de pago en una venta.
- [ ] 2.2 (Decisión confirmada) Columna `id_usuario` obligatoria (NOT NULL) desde el diseño inicial en las tablas `producto`, `compra` y `venta`, siempre que la secuencia de creación de tablas y relaciones lo permita. No se aplicará backfill ni asignación de usuario por defecto porque la nueva base de datos comienza vacía.
- [ ] 2.3 (Decisión confirmada) Nueva base de datos MySQL vacía, sin datos antiguos: no se conserva ni migran los datos actuales. No se modifica ni se elimina la base de datos actual.
- [ ] 2.4 Generar las migraciones TypeORM para la entidad `Usuario` y las columnas de asociación `id_usuario` en las tablas `producto`, `compra` y `venta`, verificando que las rutas de migración coincidan con la configuración real de TypeORM (`dist/migrations/*.js` para la DataSource de migraciones).
- [ ] 2.5 Ejecutar las migraciones de TypeORM contra la nueva base de datos MySQL y verificar que las tablas `usuario`, `producto`, `compra` y `venta` se crean con la columna `id_usuario`.
- [ ] 2.6 Verificar que la base de datos actual no se modifica ni se elimina durante el desarrollo.

## 3. Aislamiento de datos por usuario (backend)

- [ ] 3.1 Actualizar `ProductoService` para recibir el `id_usuario` del usuario autenticado (obtenido del token validado por el backend) y filtrar todas las consultas de lectura, creación, modificación y eliminación por ese usuario, verificando con pruebas que un usuario solo ve sus propios productos
- [ ] 3.2 Actualizar `ProductoController` para extraer el usuario autenticado del token y pasar su `id` al servicio, verificando que el endpoint filtra productos por usuario y no acepta `id_usuario` desde el frontend
- [ ] 3.3 Actualizar `CompraService` para filtrar por `id_usuario` del usuario autenticado en todas las consultas, verificando con pruebas que un usuario solo ve sus propias compras
- [ ] 3.4 Actualizar `CompraController` para pasar el `id_usuario` del usuario autenticado al servicio, verificando que el endpoint filtra compras por usuario y no acepta `id_usuario` desde el frontend
- [ ] 3.5 Actualizar `VentaService` para filtrar por `id_usuario` del usuario autenticado en todas las consultas, verificando con pruebas que un usuario solo ve sus propias ventas. Asegurar que, al crear una venta con celular recibido como parte de pago, el producto nuevo y la compra nueva generados también se asocien al usuario autenticado. Validar que una venta solo puede realizarse si el producto y la compra relacionada pertenecen al usuario autenticado.
- [ ] 3.6 Actualizar `VentaController` para pasar el `id_usuario` del usuario autenticado al servicio, verificando que el endpoint filtra ventas por usuario y no acepta `id_usuario` desde el frontend
- [ ] 3.7 (Validación de propiedad) Impedir que un usuario modifique o elimine una venta si el producto o la compra relacionada pertenecen a otro usuario. Aplicar la misma restricción de propiedad a las operaciones de modificación y eliminación de productos y compras.
- [ ] 3.8 Actualizar `GananciaService` para recibir el `id_usuario` del usuario autenticado y filtrar todas las consultas y cálculos de ganancias (mensual, semanal, resumen) exclusivamente por ese usuario, verificando que nunca se incluyen ventas de otros usuarios
- [ ] 3.9 Actualizar `GananciaController` para pasar el `id_usuario` del usuario autenticado al servicio, verificando que los endpoints de ganancias filtran por usuario y no aceptan `id_usuario` desde el frontend

## 4. Frontend React (gestión de sesión, autenticación y respuestas no autorizadas)

- [ ] 4.1 Implementar guarda de rutas: redirigir al login si el usuario no tiene sesión válida; permitir acceso a las rutas de la aplicación solo cuando existe sesión
- [ ] 4.2 Actualizar el flujo de login con Google: tras validar el token en el backend, almacenar la información de sesión (usuario y JWT propio del backend) en `localStorage` y redirigir a la aplicación principal
- [ ] 4.3 Implementar envío del token de autenticación en las peticiones a la API (productos, compras, ventas y ganancias), en el encabezado `Authorization: Bearer <token>`
- [ ] 4.4 Implementar manejo centralizado de respuestas no autorizadas (401): limpiar la sesión, redirigir al login y notificar al usuario que su sesión expiró o no es válida
- [ ] 4.5 Implementar cierre de sesión: eliminar la información de sesión almacenada y redirigir al login
- [ ] 4.6 Actualizar los tipos de TypeScript del frontend para incluir el usuario autenticado y el token de sesión, si corresponde
- [ ] 4.7 Verificar que las peticiones de creación, modificación y eliminación de productos, compras y ventas no envíen un `id_usuario` desde el frontend (la identidad se obtiene del backend)

## 5. Pruebas de aislamiento entre usuarios

- [ ] 5.1 Escribir pruebas que verifiquen que un usuario autenticado solo puede leer, crear, modificar y eliminar sus propios productos (no los de otro usuario)
- [ ] 5.2 Escribir pruebas que verifiquen que un usuario autenticado solo puede leer, crear, modificar y eliminar sus propias compras (no las de otro usuario)
- [ ] 5.3 Escribir pruebas que verifiquen que un usuario autenticado solo puede leer, crear, modificar y eliminar sus propias ventas (no las de otro usuario), incluyendo ventas con celular recibido como parte de pago
- [ ] 5.4 Escribir pruebas que verifiquen que los cálculos de ganancias (mensual, semanal, resumen) consideran exclusivamente las ventas del usuario autenticado y nunca incluyen ventas de otros usuarios
- [ ] 5.5 Escribir pruebas que verifiquen que una petición con un `id_usuario` enviado desde el frontend intentando suplantar a otro usuario es ignorada y se usa la identidad del token validado por el backend
- [ ] 5.6 Escribir pruebas que verifiquen que las peticiones sin token válido o con token expirado reciben respuesta 401

## 6. Verificación e integración

- [ ] 6.1 Ejecutar el conjunto completo de pruebas y verificar que todas pasan
- [ ] 6.2 Verificar de extremo a extremo que un usuario autenticado no puede consultar ni modificar productos, compras, ventas ni ganancias de otro usuario (pruebas de aislamiento de datos)
- [ ] 6.3 Verificar de extremo a extremo el flujo completo de login con Google, sesión, envío de token en peticiones y manejo de respuesta 401

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
