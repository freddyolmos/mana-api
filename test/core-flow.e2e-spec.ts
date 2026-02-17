import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { UserRole } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { hashPassword } from '../src/common/utils/hash.util';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type IdBody = {
  id: number;
};

type TicketBody = {
  id: number;
  total: number | string;
};

type StatusBody = {
  status: string;
};

describe('Core Flow (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const password = '123456';
  const adminEmail = 'e2e_admin@mana.local';
  const cashierEmail = 'e2e_cashier@mana.local';
  const kitchenEmail = 'e2e_kitchen@mana.local';

  let adminToken = '';
  let cashierToken = '';
  let kitchenToken = '';

  const created = {
    categoryId: 0,
    productId: 0,
    orderId: 0,
    orderItemId: 0,
    ticketId: 0,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get(PrismaService);

    await Promise.all([
      upsertUser(adminEmail, UserRole.ADMIN),
      upsertUser(cashierEmail, UserRole.CASHIER),
      upsertUser(kitchenEmail, UserRole.KITCHEN),
    ]);
  });

  afterAll(async () => {
    if (created.ticketId) {
      await prisma.ticket.deleteMany({ where: { id: created.ticketId } });
    }

    if (created.orderId) {
      await prisma.order.deleteMany({ where: { id: created.orderId } });
    }

    if (created.productId) {
      await prisma.productModifierGroup.deleteMany({
        where: { productId: created.productId },
      });
      await prisma.product.deleteMany({ where: { id: created.productId } });
    }

    if (created.categoryId) {
      await prisma.category.deleteMany({ where: { id: created.categoryId } });
    }

    await app.close();
  });

  it('auth endpoints should return 200 and valid token flow', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password })
      .expect(200);

    const loginBody = toAuthTokens(loginRes.body as unknown);

    const refreshRes = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: loginBody.refreshToken })
      .expect(200);

    const refreshBody = toAuthTokens(refreshRes.body as unknown);

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${refreshBody.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${refreshBody.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: refreshBody.refreshToken })
      .expect(403);
  });

  it('should complete base operational flow: orders -> tickets -> payments', async () => {
    adminToken = await login(adminEmail);
    cashierToken = await login(cashierEmail);
    kitchenToken = await login(kitchenEmail);

    const suffix = Date.now();

    const categoryRes = await request(app.getHttpServer())
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `E2E CAT ${suffix}`, sortOrder: 0 })
      .expect(201);
    created.categoryId = toIdBody(categoryRes.body as unknown).id;

    const productRes = await request(app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `E2E PROD ${suffix}`,
        description: 'Base e2e product',
        price: 100,
        categoryId: created.categoryId,
      })
      .expect(201);
    created.productId = toIdBody(productRes.body as unknown).id;

    const orderRes = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type: 'TAKEOUT' })
      .expect(201);
    created.orderId = toIdBody(orderRes.body as unknown).id;

    const itemRes = await request(app.getHttpServer())
      .post(`/api/orders/${created.orderId}/items`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ productId: created.productId, qty: 1 })
      .expect(201);
    created.orderItemId = toIdBody(itemRes.body as unknown).id;

    await request(app.getHttpServer())
      .post(`/api/orders/${created.orderId}/send-to-kitchen`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .patch(
        `/api/kitchen/orders/${created.orderId}/items/${created.orderItemId}`,
      )
      .set('Authorization', `Bearer ${kitchenToken}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(
        `/api/kitchen/orders/${created.orderId}/items/${created.orderItemId}`,
      )
      .set('Authorization', `Bearer ${kitchenToken}`)
      .send({ status: 'READY' })
      .expect(200);

    const ticketRes = await request(app.getHttpServer())
      .post(`/api/tickets/from-order/${created.orderId}`)
      .set('Authorization', `Bearer ${cashierToken}`)
      .expect(201);

    const ticketBody = toTicketBody(ticketRes.body as unknown);
    created.ticketId = ticketBody.id;
    const total = Number(ticketBody.total);

    await request(app.getHttpServer())
      .post('/api/payments')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({ ticketId: created.ticketId, method: 'CASH', amount: total })
      .expect(201);

    const closeRes = await request(app.getHttpServer())
      .post(`/api/tickets/${created.ticketId}/close`)
      .set('Authorization', `Bearer ${cashierToken}`)
      .expect(201);

    const closeBody = toStatusBody(closeRes.body as unknown);
    expect(closeBody.status).toBe('PAID');

    const order = await prisma.order.findUnique({
      where: { id: created.orderId },
      select: { status: true },
    });
    expect(order?.status).toBe('CLOSED');
  });

  async function login(email: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    return toAuthTokens(res.body as unknown).accessToken;
  }

  async function upsertUser(email: string, role: UserRole) {
    const hashed = await hashPassword(password);
    await prisma.user.upsert({
      where: { email },
      update: {
        password: hashed,
        role,
        isActive: true,
      },
      create: {
        name: email,
        email,
        password: hashed,
        role,
        isActive: true,
      },
    });
  }

  function toAuthTokens(body: unknown): AuthTokens {
    const candidate = body as Partial<AuthTokens>;
    expect(typeof candidate.accessToken).toBe('string');
    expect(typeof candidate.refreshToken).toBe('string');
    return {
      accessToken: candidate.accessToken as string,
      refreshToken: candidate.refreshToken as string,
    };
  }

  function toIdBody(body: unknown): IdBody {
    const candidate = body as Partial<IdBody>;
    expect(typeof candidate.id).toBe('number');
    return { id: candidate.id as number };
  }

  function toTicketBody(body: unknown): TicketBody {
    const candidate = body as Partial<TicketBody>;
    expect(typeof candidate.id).toBe('number');
    expect(['number', 'string']).toContain(typeof candidate.total);
    return {
      id: candidate.id as number,
      total: candidate.total as number | string,
    };
  }

  function toStatusBody(body: unknown): StatusBody {
    const candidate = body as Partial<StatusBody>;
    expect(typeof candidate.status).toBe('string');
    return { status: candidate.status as string };
  }
});
