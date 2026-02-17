# Matriz de Pruebas API (mana-api)

## Objetivo
Definir una matriz de pruebas funcionales para validar:

- contratos HTTP por endpoint;
- seguridad (`401`/`403`);
- validaciones (`400`);
- no encontrados (`404`);
- conflictos y reglas de negocio (`409`/`400`);
- flujo operativo completo del restaurante.

## Alcance y supuestos

- Base URL: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/docs`
- Prefijo global activo: `/api`
- Nota de estatus: varios `POST` responden `201` por defecto en NestJS cuando no se define `@HttpCode(...)`.
- Roles del sistema: `ADMIN`, `CASHIER`, `KITCHEN`
- Estados de orden: `OPEN`, `SENT_TO_KITCHEN`, `READY`, `CLOSED`, `CANCELED`
- Estados de item de orden: `PENDING`, `IN_PROGRESS`, `READY`, `CANCELED`

## Convenciones de casos

- `HP`: happy path
- `AUTH`: sin token o token inválido (`401`)
- `RBAC`: rol no permitido (`403`)
- `VAL`: validación de DTO/query/path (`400`)
- `NF`: recurso no encontrado (`404`)
- `CF`: conflicto o regla de dominio (`409`/`400`)

## Matriz por endpoint

### Sistema y Auth

| Endpoint | Roles | Casos obligatorios |
|---|---|---|
| `GET /api` | Público | `HP` |
| `POST /api/auth/login` | Público | `HP`, `VAL`, `CF` (credenciales inválidas -> `401`) |
| `POST /api/auth/refresh` | Público | `HP`, `VAL`, `CF` (`401`/`403` según estado de refresh) |
| `GET /api/auth/me` | JWT | `HP`, `AUTH` |
| `POST /api/auth/logout` | JWT | `HP`, `AUTH` |

### Users

| Endpoint | Roles | Casos obligatorios |
|---|---|---|
| `POST /api/users` | `ADMIN` | `HP`, `VAL`, `CF` (email duplicado `409`), `AUTH`, `RBAC` |
| `GET /api/users` | `ADMIN` | `HP`, `AUTH`, `RBAC` |
| `GET /api/users/:id` | `ADMIN` | `HP`, `NF`, `AUTH`, `RBAC` |
| `PATCH /api/users/:id` | `ADMIN` | `HP`, `VAL`, `NF`, `CF` (email duplicado `409`), `AUTH`, `RBAC` |
| `DELETE /api/users/:id` | `ADMIN` | `HP`, `NF`, `AUTH`, `RBAC` |

### Categories

| Endpoint | Roles | Casos obligatorios |
|---|---|---|
| `POST /api/categories` | `ADMIN` | `HP`, `VAL`, `CF` (duplicado `409`), `AUTH`, `RBAC` |
| `GET /api/categories` | JWT | `HP`, `VAL` (`isActive` inválido), `AUTH` |
| `GET /api/categories/:id` | JWT | `HP`, `NF`, `AUTH` |
| `PATCH /api/categories/:id` | `ADMIN` | `HP`, `VAL`, `NF`, `CF` (duplicado `409`), `AUTH`, `RBAC` |
| `PATCH /api/categories/:id/toggle-active` | `ADMIN` | `HP`, `NF`, `AUTH`, `RBAC` |

### Products

| Endpoint | Roles | Casos obligatorios |
|---|---|---|
| `POST /api/products` | `ADMIN` | `HP`, `VAL`, `NF` (categoría), `CF` (duplicado `409`), `AUTH`, `RBAC` |
| `GET /api/products` | JWT | `HP`, `VAL` (`categoryId`/`isActive` inválidos), `AUTH` |
| `GET /api/products/:id` | JWT | `HP`, `NF`, `AUTH` |
| `PATCH /api/products/:id` | `ADMIN` | `HP`, `VAL`, `NF`, `CF`, `AUTH`, `RBAC` |
| `PATCH /api/products/:id/toggle-active` | `ADMIN` | `HP`, `NF`, `AUTH`, `RBAC` |

### Modifier Groups

| Endpoint | Roles | Casos obligatorios |
|---|---|---|
| `POST /api/modifier-groups` | `ADMIN` | `HP`, `VAL` (min/max/required), `CF` (duplicado `409`), `AUTH`, `RBAC` |
| `GET /api/modifier-groups` | JWT | `HP`, `VAL` (`isActive` inválido), `AUTH` |
| `GET /api/modifier-groups/:id` | JWT | `HP`, `NF`, `AUTH` |
| `PATCH /api/modifier-groups/:id` | `ADMIN` | `HP`, `VAL`, `NF`, `CF`, `AUTH`, `RBAC` |
| `PATCH /api/modifier-groups/:id/toggle-active` | `ADMIN` | `HP`, `NF`, `AUTH`, `RBAC` |

### Modifier Options

| Endpoint | Roles | Casos obligatorios |
|---|---|---|
| `POST /api/modifier-options` | `ADMIN` | `HP`, `VAL`, `NF` (grupo), `CF` (duplicado), `AUTH`, `RBAC` |
| `PATCH /api/modifier-options/:id` | `ADMIN` | `HP`, `VAL`, `NF`, `CF`, `AUTH`, `RBAC` |
| `PATCH /api/modifier-options/:id/toggle-active` | `ADMIN` | `HP`, `NF`, `AUTH`, `RBAC` |

### Product Modifier Groups

| Endpoint | Roles | Casos obligatorios |
|---|---|---|
| `POST /api/products/:productId/modifier-groups` | `ADMIN` | `HP`, `VAL`, `NF`, `CF`, `AUTH`, `RBAC` |
| `GET /api/products/:productId/modifier-groups` | JWT | `HP`, `NF`, `AUTH` |
| `DELETE /api/products/:productId/modifier-groups/:groupId` | `ADMIN` | `HP`, `NF`, `AUTH`, `RBAC` |

### Tables

| Endpoint | Roles | Casos obligatorios |
|---|---|---|
| `POST /api/tables` | `ADMIN` | `HP`, `VAL`, `CF` (duplicado), `AUTH`, `RBAC` |
| `GET /api/tables` | `CASHIER`, `ADMIN` | `HP`, `VAL` (`status` inválido), `AUTH`, `RBAC` |
| `GET /api/tables/:id` | `CASHIER`, `ADMIN` | `HP`, `NF`, `AUTH`, `RBAC` |
| `PATCH /api/tables/:id` | `ADMIN` | `HP`, `VAL`, `NF`, `CF`, `AUTH`, `RBAC` |
| `DELETE /api/tables/:id` | `ADMIN` | `HP`, `NF`, `AUTH`, `RBAC` |

### Orders

| Endpoint | Roles | Casos obligatorios |
|---|---|---|
| `POST /api/orders` | `ADMIN` | `HP`, `VAL`, `AUTH`, `RBAC` |
| `GET /api/orders/:id` | JWT | `HP`, `NF`, `AUTH` |
| `POST /api/orders/:id/items` | `ADMIN` | `HP`, `VAL`, `NF`, `CF` (estado orden y reglas de modificadores), `AUTH`, `RBAC` |
| `DELETE /api/orders/:id/items/:itemId` | `ADMIN` | `HP`, `NF`, `CF` (orden no `OPEN`), `AUTH`, `RBAC` |
| `PATCH /api/orders/:id/items/:itemId` | `ADMIN` | `HP`, `VAL`, `NF`, `CF`, `AUTH`, `RBAC` |
| `POST /api/orders/:id/send-to-kitchen` | JWT | `HP`, `NF`, `CF` (sin items o estado inválido), `AUTH` |
| `POST /api/orders/:id/mark-ready` | `KITCHEN`, `ADMIN` | `HP`, `NF`, `CF` (items pendientes/estado inválido), `AUTH`, `RBAC` |
| `PATCH /api/orders/:id/attach-table/:tableId` | `CASHIER`, `ADMIN` | `HP`, `NF`, `CF` (mesa ocupada/orden cerrada/ya con mesa), `AUTH`, `RBAC` |
| `PATCH /api/orders/:id/release-table` | `CASHIER`, `ADMIN` | `HP`, `NF`, `CF` (sin mesa u orden activa), `AUTH`, `RBAC` |

### Kitchen

| Endpoint | Roles | Casos obligatorios |
|---|---|---|
| `GET /api/kitchen/orders` | `KITCHEN`, `ADMIN` | `HP`, `VAL` (`status` inválido), `AUTH`, `RBAC` |
| `GET /api/kitchen/orders/:id` | `KITCHEN`, `ADMIN` | `HP`, `NF`, `CF` (orden fuera de cocina), `AUTH`, `RBAC` |
| `PATCH /api/kitchen/orders/:id/items/:itemId` | `KITCHEN`, `ADMIN` | `HP`, `VAL`, `NF`, `CF` (transición inválida), `AUTH`, `RBAC` |

### Tickets

| Endpoint | Roles | Casos obligatorios |
|---|---|---|
| `POST /api/tickets/from-order/:orderId` | `CASHIER`, `ADMIN` | `HP`, `NF`, `CF` (no lista/sin items/items pendientes/ticket existente), `AUTH`, `RBAC` |
| `GET /api/tickets/:id` | `CASHIER`, `ADMIN` | `HP`, `NF`, `AUTH`, `RBAC` |
| `PATCH /api/tickets/:id/cancel` | `CASHIER`, `ADMIN` | `HP`, `NF`, `CF` (ticket pagado), `AUTH`, `RBAC` |
| `POST /api/tickets/:id/close` | `CASHIER`, `ADMIN` | `HP`, `NF`, `CF` (pagos insuficientes/ticket cancelado), `AUTH`, `RBAC` |

### Payments

| Endpoint | Roles | Casos obligatorios |
|---|---|---|
| `POST /api/payments` | `CASHIER`, `ADMIN` | `HP`, `VAL`, `NF`, `CF` (ticket no abierto, sobrepago no efectivo), `AUTH`, `RBAC` |

### Reports

| Endpoint | Roles | Casos obligatorios |
|---|---|---|
| `GET /api/reports/summary` | `ADMIN`, `CASHIER` | `HP`, `VAL` (rango inválido), `AUTH`, `RBAC` |
| `GET /api/reports/top-products` | `ADMIN`, `CASHIER` | `HP`, `VAL` (`limit` y rango), `AUTH`, `RBAC` |
| `GET /api/reports/payments-breakdown` | `ADMIN`, `CASHIER` | `HP`, `VAL` (rango), `AUTH`, `RBAC` |
| `GET /api/reports/sales-by-hour` | `ADMIN`, `CASHIER` | `HP`, `VAL` (rango), `AUTH`, `RBAC` |

## Matriz de flujos (end-to-end)

| Flujo | Objetivo | Criterios de aceptación |
|---|---|---|
| `F1 - Catálogo base` | Crear categoría, producto, grupos, opciones y asignaciones | Recursos creados y listables; duplicados son rechazados con `409/400`. |
| `F2 - Orden operativa` | Crear orden, agregar item con modificadores, enviar a cocina | Orden pasa a `SENT_TO_KITCHEN`; totales se recalculan server-side. |
| `F3 - Cocina` | Ejecutar `PENDING -> IN_PROGRESS -> READY` | No permite saltos; al completar todos los items, orden en `READY`. |
| `F4 - Ticket y cierre` | Generar ticket, cobrar, cerrar ticket | No cierra con pago insuficiente; cierre deja ticket `PAID` y orden `CLOSED`. |
| `F5 - Mesas` | Attach/release en flujo real | Attach solo mesa `FREE`; release solo con orden `CLOSED/CANCELED`. |
| `F6 - Sobrepago por método` | Validar reglas de pago | `CARD/TRANSFER` excedente -> `400`; `CASH` excedente -> cambio calculado. |
| `F7 - Seguridad` | Verificar AUTH/RBAC de todos los módulos | Sin JWT -> `401`; rol no permitido -> `403` en cada endpoint protegido. |

## Automatización sugerida (sin acoplarse a datos manuales)

Scripts sugeridos:

- `scripts/test-bootstrap`: login por rol y export de tokens.
- `scripts/seed-catalog`: crea categorías, productos, grupos y opciones.
- `scripts/seed-ops`: crea mesas y precondiciones de operación.
- `scripts/scenario-happy`: ejecuta flujo completo exitoso (`F1..F5`).
- `scripts/scenario-negative`: ejecuta reglas que deben fallar (`F6`, transiciones inválidas, etc.).
- `scripts/cleanup-run`: limpia o desactiva datos de una corrida.

Recomendación de datos:

- Usar prefijo por corrida (`RUN_<timestamp>`) en nombres para evitar colisiones.
- Evitar IDs hardcodeados: resolver IDs por búsqueda de nombre de recurso recién creado.
- Guardar evidencia de cada corrida (status, response body, timestamp).

## Uso recomendado

1. Ejecutar primero checklist de smoke (`F1`, `F2`, `F4`, `F6`, `F7`).
2. Ejecutar matriz completa antes de release.
3. En CI, separar `smoke` y `full regression` para tiempos de feedback menores.
