# Checklist Copiable (Postman / Newman)

Este checklist está diseñado para ejecución manual en Postman o automatizada en Newman.

Nota: en esta API, varios endpoints `POST` devuelven `201` (Created) porque no tienen `@HttpCode(...)`.

## Archivos listos para importar

- Colección: `postman/mana-api-checklist.postman_collection.json`
- Environment local: `postman/mana-api-local.postman_environment.json`

## Variables sugeridas de colección

- `baseUrl`: `http://localhost:3000/api`
- `token_admin`
- `token_cashier`
- `token_kitchen`
- IDs dinámicos: `categoryId`, `productId`, `groupId`, `optionId`, `tableId`, `orderId`, `orderItemId`, `ticketId`, `userId`

## Formato copiable

`ID | METHOD | PATH | ROLE | BODY/QUERY | EXPECT | ASSERT`

## Smoke (rápido, recomendado en cada cambio)

```text
AUTH-001 | POST | /auth/login | PUBLIC | {"email":"<admin>","password":"<pwd>"} | 200 | accessToken y refreshToken presentes
CAT-001 | POST | /categories | ADMIN | {"name":"RUN_CAT_01","sortOrder":0} | 201 | id numérico, name correcto
PRD-001 | POST | /products | ADMIN | {"name":"RUN_PRD_01","price":100,"categoryId":"{{categoryId}}"} | 201 | id, price, category.id
ORD-001 | POST | /orders | ADMIN | {"type":"TAKEOUT"} | 201 | status OPEN
ORD-002 | POST | /orders/{{orderId}}/items | ADMIN | {"productId":"{{productId}}","qty":1} | 201 | lineTotal > 0
ORD-006 | POST | /orders/{{orderId}}/send-to-kitchen | ADMIN | - | 200 | status SENT_TO_KITCHEN
KIT-003A | PATCH | /kitchen/orders/{{orderId}}/items/{{orderItemId}} | KITCHEN | {"status":"IN_PROGRESS"} | 200 | status IN_PROGRESS
KIT-003B | PATCH | /kitchen/orders/{{orderId}}/items/{{orderItemId}} | KITCHEN | {"status":"READY"} | 200 | status READY
TIK-001 | POST | /tickets/from-order/{{orderId}} | CASHIER | - | 201 | id ticket, total > 0
PAY-001 | POST | /payments | CASHIER | {"ticketId":"{{ticketId}}","method":"CASH","amount":"{{ticketTotal}}"} | 201 | payment creado
TIK-004 | POST | /tickets/{{ticketId}}/close | CASHIER | - | 200 | ticket PAID
```

## Seguridad (AUTH / RBAC)

```text
SEC-001 | GET | /auth/me | NONE | - | 401 | unauthorized
SEC-002 | GET | /products | NONE | - | 401 | unauthorized
SEC-003 | POST | /users | CASHIER | {"name":"U","email":"u@x.com","password":"123456","role":"ADMIN"} | 403 | forbidden
SEC-004 | GET | /kitchen/orders | CASHIER | - | 403 | forbidden
SEC-005 | POST | /payments | KITCHEN | {"ticketId":1,"method":"CASH","amount":10} | 403 | forbidden
SEC-006 | GET | /reports/summary?from=2026-02-01&to=2026-02-02 | KITCHEN | - | 403 | forbidden
```

## Checklist completo por módulo

### Auth

```text
AUTH-001 | POST | /auth/login | PUBLIC | credenciales válidas | 200 | devuelve tokens
AUTH-002 | POST | /auth/login | PUBLIC | password inválido | 401 | invalid credentials
AUTH-003 | POST | /auth/login | PUBLIC | email inválido formato | 400 | validation error
AUTH-004 | GET | /auth/me | ADMIN | - | 200 | userId,email,role
AUTH-005 | GET | /auth/me | NONE | - | 401 | unauthorized
AUTH-006 | POST | /auth/refresh | PUBLIC | refresh válido | 200 | nuevos tokens
AUTH-007 | POST | /auth/refresh | PUBLIC | refresh inválido | 401 | invalid refresh token
AUTH-008 | POST | /auth/logout | ADMIN | - | 200 | {ok:true}
```

### Users

```text
USR-001 | POST | /users | ADMIN | body válido | 201 | usuario creado sin password en response
USR-002 | POST | /users | ADMIN | email duplicado | 409 | conflict
USR-003 | GET | /users | ADMIN | - | 200 | array de usuarios
USR-004 | GET | /users/{{userId}} | ADMIN | existente | 200 | id coincide
USR-005 | GET | /users/999999 | ADMIN | inexistente | 404 | not found
USR-006 | PATCH | /users/{{userId}} | ADMIN | cambio de name/role | 200 | valores actualizados
USR-007 | PATCH | /users/999999 | ADMIN | - | 404 | not found
USR-008 | DELETE | /users/{{userId}} | ADMIN | existente | 200 | usuario eliminado
USR-009 | DELETE | /users/999999 | ADMIN | inexistente | 404 | not found
```

### Categories

```text
CAT-001 | POST | /categories | ADMIN | body válido | 201 | categoría creada
CAT-002 | POST | /categories | ADMIN | nombre duplicado | 409 | conflict
CAT-003 | GET | /categories | ADMIN | - | 200 | array
CAT-004 | GET | /categories?isActive=true | ADMIN | filtro válido | 200 | todas activas
CAT-005 | GET | /categories?isActive=abc | ADMIN | filtro inválido | 400 | validation error
CAT-006 | GET | /categories/{{categoryId}} | ADMIN | existente | 200 | id coincide
CAT-007 | GET | /categories/999999 | ADMIN | inexistente | 404 | not found
CAT-008 | PATCH | /categories/{{categoryId}} | ADMIN | update válido | 200 | actualizado
CAT-009 | PATCH | /categories/{{categoryId}}/toggle-active | ADMIN | - | 200 | isActive cambia
```

### Products

```text
PRD-001 | POST | /products | ADMIN | body válido | 201 | producto creado
PRD-002 | POST | /products | ADMIN | categoryId inexistente | 404 | not found
PRD-003 | POST | /products | ADMIN | duplicado por categoría | 409 | conflict
PRD-004 | GET | /products | ADMIN | - | 200 | array
PRD-005 | GET | /products?categoryId={{categoryId}} | ADMIN | filtro válido | 200 | categoryId coincide
PRD-006 | GET | /products?categoryId=foo | ADMIN | filtro inválido | 400 | validation error
PRD-007 | GET | /products?isActive=abc | ADMIN | filtro inválido | 400 | validation error
PRD-008 | GET | /products/{{productId}} | ADMIN | existente | 200 | id coincide
PRD-009 | GET | /products/999999 | ADMIN | inexistente | 404 | not found
PRD-010 | PATCH | /products/{{productId}} | ADMIN | update válido | 200 | actualizado
PRD-011 | PATCH | /products/{{productId}}/toggle-active | ADMIN | - | 200 | isActive cambia
```

### Modifier Groups y Options

```text
MODG-001 | POST | /modifier-groups | ADMIN | body válido | 201 | grupo creado
MODG-002 | POST | /modifier-groups | ADMIN | required=true,minSelect=0 | 400 | regla de negocio
MODG-003 | POST | /modifier-groups | ADMIN | maxSelect<minSelect | 400 | regla de negocio
MODG-004 | GET | /modifier-groups?isActive=abc | ADMIN | filtro inválido | 400 | validation error
MODG-005 | PATCH | /modifier-groups/{{groupId}} | ADMIN | update válido | 200 | actualizado
MODO-001 | POST | /modifier-options | ADMIN | body válido | 201 | opción creada
MODO-002 | POST | /modifier-options | ADMIN | groupId inexistente | 404 | not found
MODO-003 | POST | /modifier-options | ADMIN | duplicado en grupo | 409 | conflict
MODO-004 | PATCH | /modifier-options/{{optionId}} | ADMIN | update válido | 200 | actualizado
MODO-005 | PATCH | /modifier-options/{{optionId}}/toggle-active | ADMIN | - | 200 | isActive cambia
```

### Product Modifier Groups

```text
PMG-001 | POST | /products/{{productId}}/modifier-groups | ADMIN | body válido | 201 | relación creada
PMG-002 | POST | /products/{{productId}}/modifier-groups | ADMIN | relación duplicada | 409 | conflict
PMG-003 | GET | /products/{{productId}}/modifier-groups | ADMIN | - | 200 | lista de grupos
PMG-004 | DELETE | /products/{{productId}}/modifier-groups/{{groupId}} | ADMIN | existente | 200 | {ok:true}
PMG-005 | DELETE | /products/{{productId}}/modifier-groups/999999 | ADMIN | inexistente | 404 | not found
```

### Tables

```text
TBL-001 | POST | /tables | ADMIN | body válido | 201 | mesa creada
TBL-002 | POST | /tables | ADMIN | nombre duplicado | 400 | bad request
TBL-003 | GET | /tables | CASHIER | - | 200 | array
TBL-004 | GET | /tables?status=FREE | CASHIER | filtro válido | 200 | todas FREE
TBL-005 | GET | /tables?status=INVALID | CASHIER | filtro inválido | 400 | validation error
TBL-006 | GET | /tables/{{tableId}} | CASHIER | existente | 200 | id coincide
TBL-007 | PATCH | /tables/{{tableId}} | ADMIN | update válido | 200 | actualizado
TBL-008 | DELETE | /tables/{{tableId}} | ADMIN | existente | 200 | eliminado
```

### Orders

```text
ORD-001 | POST | /orders | ADMIN | {"type":"TAKEOUT"} | 201 | status OPEN
ORD-002 | POST | /orders/{{orderId}}/items | ADMIN | body válido | 201 | item creado, lineTotal
ORD-003 | POST | /orders/{{orderId}}/items | ADMIN | group requerido faltante | 400 | regla de modificadores
ORD-004 | PATCH | /orders/{{orderId}}/items/{{orderItemId}} | ADMIN | qty/modifiers válidos | 200 | item actualizado
ORD-005 | DELETE | /orders/{{orderId}}/items/{{orderItemId}} | ADMIN | existente | 200 | {ok:true}
ORD-006 | POST | /orders/{{orderId}}/send-to-kitchen | ADMIN | orden con items | 200 | status SENT_TO_KITCHEN
ORD-007 | POST | /orders/{{orderId}}/send-to-kitchen | ADMIN | orden sin items | 400 | regla de negocio
ORD-008 | POST | /orders/{{orderId}}/mark-ready | KITCHEN | con items pendientes | 400 | no permite READY
ORD-009 | PATCH | /orders/{{orderId}}/attach-table/{{tableId}} | CASHIER | mesa FREE | 200 | order.tableId asignada
ORD-010 | PATCH | /orders/{{orderId}}/release-table | CASHIER | orden activa | 400 | no permite liberar
```

### Kitchen

```text
KIT-001 | GET | /kitchen/orders | KITCHEN | - | 200 | lista de órdenes en cocina
KIT-002 | GET | /kitchen/orders/{{orderId}} | KITCHEN | orden fuera de cocina | 400 | regla de estado
KIT-003A | PATCH | /kitchen/orders/{{orderId}}/items/{{orderItemId}} | KITCHEN | {"status":"IN_PROGRESS"} | 200 | transición válida
KIT-003B | PATCH | /kitchen/orders/{{orderId}}/items/{{orderItemId}} | KITCHEN | {"status":"READY"} | 200 | transición válida
KIT-004 | PATCH | /kitchen/orders/{{orderId}}/items/{{orderItemId}} | KITCHEN | {"status":"READY"} desde PENDING | 400 | transición inválida
```

### Tickets

```text
TIK-001 | POST | /tickets/from-order/{{orderId}} | CASHIER | orden lista | 201 | ticket creado
TIK-002 | POST | /tickets/from-order/{{orderId}} | CASHIER | ticket ya creado | 409 | conflict
TIK-003 | GET | /tickets/{{ticketId}} | CASHIER | existente | 200 | id coincide
TIK-004 | POST | /tickets/{{ticketId}}/close | CASHIER | pagos suficientes | 200 | ticket PAID, orden CLOSED
TIK-005 | POST | /tickets/{{ticketId}}/close | CASHIER | pagos insuficientes | 400 | regla de negocio
TIK-006 | PATCH | /tickets/{{ticketId}}/cancel | CASHIER | ticket OPEN | 200 | status CANCELED
TIK-007 | PATCH | /tickets/{{ticketId}}/cancel | CASHIER | ticket PAID | 400 | no cancelable
```

### Payments

```text
PAY-001 | POST | /payments | CASHIER | {"ticketId":"{{ticketId}}","method":"CASH","amount":"{{ticketTotal}}"} | 201 | payment creado
PAY-002 | POST | /payments | CASHIER | ticket inexistente | 404 | not found
PAY-003 | POST | /payments | CASHIER | ticket no OPEN | 400 | regla de negocio
PAY-004 | POST | /payments | CASHIER | CARD excede total pendiente | 400 | sobrepago no permitido
PAY-005 | POST | /payments | CASHIER | TRANSFER excede total pendiente | 400 | sobrepago no permitido
PAY-006 | POST | /payments | CASHIER | CASH excede total pendiente | 201 | change > 0
```

### Reports

```text
REP-001 | GET | /reports/summary?from=2026-02-01&to=2026-02-03 | CASHIER | rango válido | 200 | totalSales,ticketsCount,salesByDay
REP-002 | GET | /reports/summary?from=2026-02-03&to=2026-02-01 | CASHIER | rango inválido | 400 | to < from
REP-003 | GET | /reports/top-products?from=2026-02-01&to=2026-02-03&limit=10 | CASHIER | válido | 200 | array top products
REP-004 | GET | /reports/top-products?from=2026-02-01&to=2026-02-03&limit=101 | CASHIER | inválido | 400 | limit fuera de rango
REP-005 | GET | /reports/payments-breakdown?from=2026-02-01&to=2026-02-03 | CASHIER | válido | 200 | método, totalAmount, count
REP-006 | GET | /reports/sales-by-hour?from=2026-02-01&to=2026-02-03&tz=UTC | CASHIER | válido | 200 | timezone y hours[]
```

## Escenarios sugeridos para scripts de apoyo

```text
SCRIPT-001 seed-catalog: crea category + product + modifier-group + option + asignación
SCRIPT-002 seed-ops: crea mesa y usuario de prueba por rol
SCRIPT-003 scenario-happy: orden completa hasta ticket PAID y orden CLOSED
SCRIPT-004 scenario-negative: intenta transiciones inválidas y espera 400/403/409
SCRIPT-005 cleanup: limpia entidades RUN_* de la ejecución
```
