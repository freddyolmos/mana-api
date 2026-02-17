# Mana API v1 - Documentacion completa

## 1. Resumen

API backend para operacion de restaurante construida con NestJS + Prisma + PostgreSQL.

- Base URL local: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/docs`
- Autenticacion: JWT Bearer Token
- Prefijo global: `/api`

Reglas clave del dominio:

- Totales se calculan solo en servidor.
- Orden y items siguen maquina de estados.
- Acceso por roles (`ADMIN`, `CASHIER`, `KITCHEN`).

## 2. Roles y seguridad

Roles disponibles:

- `ADMIN`
- `CASHIER`
- `KITCHEN`

Comportamiento de seguridad:

- Sin token en ruta protegida -> `401 Unauthorized`
- Token valido con rol insuficiente -> `403 Forbidden`

Header requerido en rutas protegidas:

```http
Authorization: Bearer <access_token>
```

## 3. Convenciones de respuesta y errores

Codigos de error usados:

- `400`: validacion o regla de negocio invalida
- `401`: no autenticado
- `403`: sin permisos
- `404`: recurso no encontrado
- `409`: conflicto (duplicado, estado no compatible)

Nota: varios endpoints `POST` responden `201 Created` por comportamiento por defecto de NestJS cuando no se define `@HttpCode(...)`.

## 4. Enums del dominio

### 4.1 Role

- `ADMIN`
- `CASHIER`
- `KITCHEN`

### 4.2 OrderType

- `DINE_IN`
- `TAKEOUT`
- `DELIVERY`

### 4.3 OrderStatus

- `OPEN`
- `SENT_TO_KITCHEN`
- `READY`
- `CLOSED`
- `CANCELED`

### 4.4 OrderItemStatus

- `PENDING`
- `IN_PROGRESS`
- `READY`
- `CANCELED`

### 4.5 TicketStatus

- `OPEN`
- `PAID`
- `CANCELED`

### 4.6 PaymentMethod

- `CASH`
- `CARD`
- `TRANSFER`

### 4.7 TableStatus

- `FREE`
- `OCCUPIED`

## 5. Endpoints por modulo

## 5.1 Sistema

| Metodo | Ruta | Auth | Descripcion |
|---|---|---|---|
| `GET` | `/api` | Publico | Health basico (`Hello World`) |

## 5.2 Auth

| Metodo | Ruta | Auth | Descripcion |
|---|---|---|---|
| `POST` | `/api/auth/login` | Publico | Login con email/password |
| `POST` | `/api/auth/refresh` | Publico | Renueva access/refresh token |
| `GET` | `/api/auth/me` | JWT | Devuelve usuario autenticado |
| `POST` | `/api/auth/logout` | JWT | Invalida refresh token del usuario |

Payloads:

```json
// POST /api/auth/login
{
  "email": "admin@mana.com",
  "password": "123456"
}
```

```json
// POST /api/auth/refresh
{
  "refreshToken": "<refresh_token>"
}
```

Respuesta tipica login/refresh:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

## 5.3 Users (ADMIN)

| Metodo | Ruta | Auth | Descripcion |
|---|---|---|---|
| `POST` | `/api/users` | ADMIN | Crea usuario |
| `GET` | `/api/users` | ADMIN | Lista usuarios |
| `GET` | `/api/users/:id` | ADMIN | Consulta usuario por id |
| `PATCH` | `/api/users/:id` | ADMIN | Actualiza usuario |
| `DELETE` | `/api/users/:id` | ADMIN | Elimina usuario |

Payload create:

```json
{
  "name": "Freddy",
  "email": "freddy@example.com",
  "password": "123456",
  "role": "ADMIN"
}
```

Payload update (parcial):

```json
{
  "name": "Freddy 2",
  "role": "CASHIER"
}
```

## 5.4 Categories

| Metodo | Ruta | Auth | Roles |
|---|---|---|---|
| `POST` | `/api/categories` | JWT | ADMIN |
| `GET` | `/api/categories` | JWT | Cualquiera autenticado |
| `GET` | `/api/categories/:id` | JWT | Cualquiera autenticado |
| `PATCH` | `/api/categories/:id` | JWT | ADMIN |
| `PATCH` | `/api/categories/:id/toggle-active` | JWT | ADMIN |

Query:

- `isActive` (`true|false`)

Payload create:

```json
{
  "name": "Bebidas",
  "sortOrder": 0
}
```

## 5.5 Products

| Metodo | Ruta | Auth | Roles |
|---|---|---|---|
| `POST` | `/api/products` | JWT | ADMIN |
| `GET` | `/api/products` | JWT | Cualquiera autenticado |
| `GET` | `/api/products/:id` | JWT | Cualquiera autenticado |
| `PATCH` | `/api/products/:id` | JWT | ADMIN |
| `PATCH` | `/api/products/:id/toggle-active` | JWT | ADMIN |

Query list:

- `categoryId` (int)
- `isActive` (bool)
- `q` (string, contains)

Payload create:

```json
{
  "name": "Enchiladas verdes",
  "description": "Con queso y crema",
  "imageUrl": "https://...",
  "price": 100,
  "categoryId": 1
}
```

## 5.6 Modifier Groups

| Metodo | Ruta | Auth | Roles |
|---|---|---|---|
| `POST` | `/api/modifier-groups` | JWT | ADMIN |
| `GET` | `/api/modifier-groups` | JWT | Cualquiera autenticado |
| `GET` | `/api/modifier-groups/:id` | JWT | Cualquiera autenticado |
| `PATCH` | `/api/modifier-groups/:id` | JWT | ADMIN |
| `PATCH` | `/api/modifier-groups/:id/toggle-active` | JWT | ADMIN |

Payload create:

```json
{
  "name": "Salsas",
  "required": false,
  "minSelect": 0,
  "maxSelect": 1,
  "multi": false
}
```

## 5.7 Modifier Options

| Metodo | Ruta | Auth | Roles |
|---|---|---|---|
| `POST` | `/api/modifier-options` | JWT | ADMIN |
| `PATCH` | `/api/modifier-options/:id` | JWT | ADMIN |
| `PATCH` | `/api/modifier-options/:id/toggle-active` | JWT | ADMIN |

Payload create:

```json
{
  "groupId": 1,
  "name": "BBQ",
  "priceDelta": 5
}
```

## 5.8 Product Modifier Groups

| Metodo | Ruta | Auth | Roles |
|---|---|---|---|
| `POST` | `/api/products/:productId/modifier-groups` | JWT | ADMIN |
| `GET` | `/api/products/:productId/modifier-groups` | JWT | Cualquiera autenticado |
| `DELETE` | `/api/products/:productId/modifier-groups/:groupId` | JWT | ADMIN |

Payload attach:

```json
{
  "groupId": 1,
  "sortOrder": 0
}
```

## 5.9 Tables

| Metodo | Ruta | Auth | Roles |
|---|---|---|---|
| `POST` | `/api/tables` | JWT | ADMIN |
| `GET` | `/api/tables` | JWT | CASHIER, ADMIN |
| `GET` | `/api/tables/:id` | JWT | CASHIER, ADMIN |
| `PATCH` | `/api/tables/:id` | JWT | ADMIN |
| `DELETE` | `/api/tables/:id` | JWT | ADMIN |

Query list:

- `status`: `FREE | OCCUPIED`

Payload create:

```json
{
  "name": "M1"
}
```

## 5.10 Orders

| Metodo | Ruta | Auth | Roles |
|---|---|---|---|
| `POST` | `/api/orders` | JWT | ADMIN |
| `GET` | `/api/orders/:id` | JWT | Cualquiera autenticado |
| `POST` | `/api/orders/:id/items` | JWT | ADMIN |
| `DELETE` | `/api/orders/:id/items/:itemId` | JWT | ADMIN |
| `PATCH` | `/api/orders/:id/items/:itemId` | JWT | ADMIN |
| `POST` | `/api/orders/:id/send-to-kitchen` | JWT | Cualquiera autenticado |
| `POST` | `/api/orders/:id/mark-ready` | JWT | KITCHEN, ADMIN |
| `PATCH` | `/api/orders/:id/attach-table/:tableId` | JWT | CASHIER, ADMIN |
| `PATCH` | `/api/orders/:id/release-table` | JWT | CASHIER, ADMIN |

Payload create order:

```json
{
  "type": "TAKEOUT",
  "notes": "Sin cebolla"
}
```

Payload add item:

```json
{
  "productId": 10,
  "qty": 2,
  "notes": "Sin hielo",
  "modifiers": [
    {
      "groupId": 1,
      "optionIds": [2]
    }
  ]
}
```

Payload update item:

```json
{
  "qty": 3,
  "modifiers": [
    {
      "groupId": 1,
      "optionIds": [2, 3]
    }
  ]
}
```

## 5.11 Kitchen

| Metodo | Ruta | Auth | Roles |
|---|---|---|---|
| `GET` | `/api/kitchen/orders` | JWT | KITCHEN, ADMIN |
| `GET` | `/api/kitchen/orders/:id` | JWT | KITCHEN, ADMIN |
| `PATCH` | `/api/kitchen/orders/:id/items/:itemId` | JWT | KITCHEN, ADMIN |

Query list:

- `status`: `SENT_TO_KITCHEN`, etc. (default `SENT_TO_KITCHEN`)

Payload update item:

```json
{
  "status": "IN_PROGRESS"
}
```

## 5.12 Tickets

| Metodo | Ruta | Auth | Roles |
|---|---|---|---|
| `POST` | `/api/tickets/from-order/:orderId` | JWT | CASHIER, ADMIN |
| `GET` | `/api/tickets/:id` | JWT | CASHIER, ADMIN |
| `PATCH` | `/api/tickets/:id/cancel` | JWT | CASHIER, ADMIN |
| `POST` | `/api/tickets/:id/close` | JWT | CASHIER, ADMIN |

Reglas clave:

- Ticket se genera solo con orden en cocina/lista y sin items pendientes.
- Cierre requiere pagos suficientes.

## 5.13 Payments

| Metodo | Ruta | Auth | Roles |
|---|---|---|---|
| `POST` | `/api/payments` | JWT | CASHIER, ADMIN |

Payload create payment:

```json
{
  "ticketId": 1,
  "method": "CASH",
  "amount": 250
}
```

Reglas clave:

- Solo ticket `OPEN` acepta pagos.
- `CARD/TRANSFER` no pueden exceder total pendiente.
- `CASH` puede exceder y genera `change`.

## 5.14 Reports

| Metodo | Ruta | Auth | Roles |
|---|---|---|---|
| `GET` | `/api/reports/summary` | JWT | ADMIN, CASHIER |
| `GET` | `/api/reports/top-products` | JWT | ADMIN, CASHIER |
| `GET` | `/api/reports/payments-breakdown` | JWT | ADMIN, CASHIER |
| `GET` | `/api/reports/sales-by-hour` | JWT | ADMIN, CASHIER |

Query base:

- `from` (date string, requerido)
- `to` (date string, requerido)

Queries adicionales:

- `top-products`: `limit` (1..100)
- `sales-by-hour`: `tz` (default `UTC`)

Ejemplo:

```http
GET /api/reports/top-products?from=2026-02-01&to=2026-02-03&limit=10
```

## 6. Flujos recomendados de consumo

### 6.1 Flujo operativo principal

1. Login (`/auth/login`)
2. Crear orden (`/orders`)
3. Agregar items (`/orders/:id/items`)
4. Enviar a cocina (`/orders/:id/send-to-kitchen`)
5. Cocina actualiza items (`/kitchen/orders/:id/items/:itemId`)
6. Crear ticket (`/tickets/from-order/:orderId`)
7. Registrar pagos (`/payments`)
8. Cerrar ticket (`/tickets/:id/close`)
9. Liberar mesa (`/orders/:id/release-table`) si aplica

### 6.2 Flujo de catalogo

1. Crear categoria
2. Crear producto
3. Crear grupo de modificadores
4. Crear opciones del grupo
5. Asignar grupo al producto

## 7. Recomendaciones de uso en cliente

- Siempre tratar montos como numericos.
- No enviar totales de orden/ticket desde frontend.
- Reintentar solo operaciones idempotentes de lectura.
- Para operaciones de estado, respetar la secuencia de negocio.

## 8. QA y pruebas

Documentacion complementaria:

- Matriz de pruebas: `docs/testing-matrix.md`
- Checklist Postman/Newman: `docs/postman-newman-checklist.md`
- Coleccion Postman: `postman/mana-api-checklist.postman_collection.json`

