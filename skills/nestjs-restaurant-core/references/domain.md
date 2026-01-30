# Domain Rules (MVP)

## Domain scope

- Auth & Users (RBAC)
- Catalog: categories, products, modifier groups/options
- Tables
- Orders + OrderItems + Modifiers
- Kitchen (KDS / order workflow)
- Tickets + Payments
- Delivery
- Reports (basic sales/day)

## Core data rules

### Orders

- OrderType: DINE_IN | TAKEOUT | DELIVERY
- OrderStatus: OPEN | SENT_TO_KITCHEN | READY | CLOSED | CANCELED
- Order is the source of truth for items, totals, ticket, and payment flows.

### Order items

- OrderItemStatus: PENDING | COOKING | READY | SERVED | CANCELED
- Items can have notes (e.g., "sin cebolla") and modifier selections.

### Delivery

- DeliveryStatus: PENDING_ASSIGN | ASSIGNED | PICKED_UP | DELIVERED | CANCELED
- Delivery is only valid for orders of type DELIVERY.

### Totals & pricing (hard rule)

- Client NEVER sends subtotal, total, discounts, or tax.
- Server computes totals from: (item qty * unitPrice) + modifiers priceDelta - discounts + tax.
- Store computed totals in Ticket (or compute + persist when generating Ticket).
- Any update that changes items/modifiers must trigger recomputation.

## State machines (strict)

### Order transitions

- Allowed: OPEN -> SENT_TO_KITCHEN -> READY -> CLOSED
- Allowed: OPEN -> CANCELED
- Forbidden: CLOSED/CANCELED cannot move to other states.

### OrderItem transitions

- Allowed: PENDING -> COOKING -> READY -> SERVED
- Allowed: PENDING -> CANCELED
- Forbidden: SERVED items cannot be modified/canceled without privileged flow.

### Delivery transitions

- Allowed: PENDING_ASSIGN -> ASSIGNED -> PICKED_UP -> DELIVERED
- Allowed: PENDING_ASSIGN/ASSIGNED -> CANCELED
- Forbidden: DELIVERED cannot change.

## Endpoint conventions (MVP)

### Orders

- POST /orders
- GET /orders?status=OPEN&type=DINE_IN
- GET /orders/:id
- POST /orders/:id/items
- PATCH /orders/:id/items/:itemId (qty/notes/cancel)
- POST /orders/:id/send-to-kitchen
- PATCH /orders/:id/items/:itemId/status (kitchen updates)

### Tickets & payments

- POST /orders/:id/ticket (generate totals, persist ticket)
- POST /tickets/:id/payments (add payment)
- POST /tickets/:id/close (close ticket, close order)

### Delivery

- POST /orders/:id/delivery
- PATCH /deliveries/:id/assign-driver
- PATCH /deliveries/:id/status

Controllers must not implement business logic; they call services.

## Modifier rules (catalog -> order enforcement)

- Product can have assigned modifier groups.
- When creating an OrderItem with modifiers:
  - Validate the modifier group is allowed for that product.
  - Enforce required/min/max per group (future-proof even if min/max not implemented yet).
  - Persist selections normalized (e.g., OrderItemModifier join table).

## Auth, RBAC, audit

- Use JwtAuthGuard for all private routes.
- Use RolesGuard + @Roles(...) for privileged actions:
  - cancel order after SENT_TO_KITCHEN
  - apply discounts
  - close ticket
  - view reports
- Never leak sensitive fields in responses.
- Add basic audit fields: createdById, createdAt, updatedAt where useful.

## Error handling standards

- 400: invalid transition / invalid business rule / validation error
- 401: unauthenticated
- 403: forbidden (role)
- 404: entity not found
- 409: conflict (unique constraints, double close, double pay, etc.)

Use consistent JSON errors via Nest exceptions.

## Realtime / kitchen notifications (recommended)

- Emit events when:
  - order sent to kitchen
  - item status changes to READY
  - order becomes READY
- If using WebSockets, implement a gateway in kitchen module or a notifications module.

## Prisma rules

- Use explicit select in Prisma to avoid leaking fields and overfetching.
- Use transactions for multi-step flows:
  - create ticket + compute totals + persist
  - add payment + update ticket status + close order
- If schema changes, always use migrations; never assume tables exist.

## Swagger rules

- Use @ApiTags per controller.
- Use @ApiBearerAuth('access-token') for protected controllers.
- Use DTOs for body/query and document them.

## Output expectations (when editing code)

When implementing a feature:
- Update DTOs + controller + service.
- Enforce business rules in service/domain.
- Add/adjust Prisma selects.
- Keep responses free of sensitive fields.
- Keep endpoints aligned with the MVP list above.
- Mention any needed migrations and where they apply.
