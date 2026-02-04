import 'dotenv/config';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000/api';
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

const productId = Number(process.env.PRODUCT_ID);
const qty = Number(process.env.QTY ?? '1');
const orderType = process.env.ORDER_TYPE ?? 'TAKEOUT';
const tableIdEnv = process.env.TABLE_ID ? Number(process.env.TABLE_ID) : null;
const tableName = process.env.TABLE_NAME;
const modifiersJson = process.env.MODIFIERS_JSON;
const autoModifiers = process.env.AUTO_MODIFIERS !== 'false';

function parseModifiers(): unknown | undefined {
  if (!modifiersJson) return undefined;
  try {
    return JSON.parse(modifiersJson);
  } catch (err) {
    throw new Error(`MODIFIERS_JSON inválido: ${String(err)}`);
  }
}

async function autoPickModifiers(
  productId: number,
  token: string,
): Promise<unknown | undefined> {
  const groups = (await request(
    `/products/${productId}/modifier-groups`,
    { method: 'GET' },
    token,
  )) as Array<{
    groupId: number;
    group: {
      id: number;
      name?: string;
      required: boolean;
      minSelect: number;
      options: Array<{ id: number }>;
    };
  }>;

  if (!Array.isArray(groups) || groups.length === 0) return undefined;

  const modifiers: Array<{ groupId: number; optionIds: number[] }> = [];
  for (const entry of groups) {
    const group = entry.group;
    if (!group || !group.required) continue;

    const options = Array.isArray(group.options) ? group.options : [];
    if (options.length === 0) {
      throw new Error(
        `Grupo requerido sin opciones: ${group.name ?? group.id}`,
      );
    }

    const sorted = options.slice().sort((a, b) => Number(a.id) - Number(b.id));
    const count = Math.max(1, Number(group.minSelect ?? 1));
    const picked = sorted.slice(0, count).map((opt) => opt.id);
    modifiers.push({ groupId: group.id, optionIds: picked });
  }

  return modifiers.length ? modifiers : undefined;
}

async function request(
  path: string,
  options: RequestInit = {},
  token?: string,
) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const text = await res.text();
  let data: unknown = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // keep raw text
  }

  if (!res.ok) {
    throw new Error(
      `${res.status} ${res.statusText} ${path} -> ${JSON.stringify(data)}`,
    );
  }

  return data;
}

async function main() {
  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in env.');
  }
  if (!productId) {
    throw new Error('Set PRODUCT_ID in env.');
  }

  const login = (await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })) as { accessToken: string };

  const token = login.accessToken;

  let tableId = tableIdEnv;
  if (!tableId && tableName) {
    const table = (await request(
      '/tables',
      {
        method: 'POST',
        body: JSON.stringify({ name: tableName }),
      },
      token,
    )) as { id: number };
    tableId = table.id;
  }

  const order = (await request(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify({ type: orderType }),
    },
    token,
  )) as { id: number };

  let modifiers = parseModifiers();
  if (!modifiers && autoModifiers) {
    modifiers = await autoPickModifiers(productId, token);
  }
  const item = (await request(
    `/orders/${order.id}/items`,
    {
      method: 'POST',
      body: JSON.stringify({
        productId,
        qty,
        modifiers,
      }),
    },
    token,
  )) as { id: number };

  if (tableId) {
    await request(
      `/orders/${order.id}/attach-table/${tableId}`,
      { method: 'PATCH' },
      token,
    );
  }

  await request(
    `/orders/${order.id}/send-to-kitchen`,
    { method: 'POST' },
    token,
  );

  await request(
    `/kitchen/orders/${order.id}/items/${item.id}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status: 'IN_PROGRESS' }),
    },
    token,
  );

  await request(
    `/kitchen/orders/${order.id}/items/${item.id}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status: 'READY' }),
    },
    token,
  );

  const ticket = (await request(
    `/tickets/from-order/${order.id}`,
    { method: 'POST' },
    token,
  )) as { id: number; total: number };

  await request(
    '/payments',
    {
      method: 'POST',
      body: JSON.stringify({
        ticketId: ticket.id,
        method: 'CASH',
        amount: Number(ticket.total),
      }),
    },
    token,
  );

  await request(`/tickets/${ticket.id}/close`, { method: 'POST' }, token);

  if (tableId) {
    await request(
      `/orders/${order.id}/release-table`,
      { method: 'PATCH' },
      token,
    );
  }

  console.log('Flow OK');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
