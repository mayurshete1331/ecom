const BASE_URL = 'http://localhost:3001';

async function testMultiStore() {
  console.log('--- 1. Testing GET /api/stores ---');
  const storesRes = await fetch(`${BASE_URL}/api/stores`);
  const storesData = await storesRes.json();
  console.log('Stores status:', storesRes.status, 'Total stores:', storesData.stores?.length);
  for (const s of storesData.stores || []) {
    console.log(`- Store #${s.id}: "${s.store_name}" (Slug: ${s.slug}) | Produce items: ${s.products_count}`);
  }

  // Helper to test admin session
  async function testAdminSession(phone, password, label) {
    console.log(`\n--- Testing ${label} (Phone: ${phone}) ---`);
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    const loginData = await loginRes.json();
    console.log('Login result:', loginData.success ? 'SUCCESS' : 'FAILED', loginData.message || '');
    console.log('Session store:', loginData.user?.store_id, loginData.user?.store_name);

    const cookie = loginRes.headers.get('set-cookie');
    if (!cookie) {
      console.error('No cookie returned from login!');
      return;
    }

    // Check inventory
    const invRes = await fetch(`${BASE_URL}/api/admin/inventory`, {
      headers: { Cookie: cookie.split(';')[0] }
    });
    const invData = await invRes.json();
    console.log(`Inventory for ${label}: ${invData.products?.length || 0} produce items`);
    invData.products?.slice(0, 3).forEach(p => console.log(`  * [${p.id}] ${p.name} (Tiers: ${p.tiers?.length})`));

    // Check orders
    const ordRes = await fetch(`${BASE_URL}/api/admin/orders`, {
      headers: { Cookie: cookie.split(';')[0] }
    });
    const ordData = await ordRes.json();
    console.log(`Orders for ${label}: ${ordData.orders?.length || 0} orders scoped to store`);
    ordData.orders?.slice(0, 2).forEach(o => console.log(`  * Order ${o.order_number}: ₹${o.total_amount} (${o.status})`));

    // Check customers
    const custRes = await fetch(`${BASE_URL}/api/admin/customers`, {
      headers: { Cookie: cookie.split(';')[0] }
    });
    const custData = await custRes.json();
    console.log(`Buyers for ${label}: ${custData.customers?.length || 0} distinct buyers`);
    custData.customers?.slice(0, 2).forEach(c => console.log(`  * ${c.full_name} (${c.account_type}): ₹${c.lifetime_spend} (${c.total_orders} orders)`));
  }

  await testAdminSession('9999999999', 'admin123', 'Store 1 Admin (KisanDirect Farm)');
  await testAdminSession('8888888888', 'admin123', 'Store 2 Admin (Brothers Green Harvest)');

  // Test Registering a new 3rd Admin & Store
  console.log('\n--- 3. Testing POST /api/auth/register-admin ---');
  const testPhone = '7777777777';
  const regRes = await fetch(`${BASE_URL}/api/auth/register-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: 'Sahyadri Farm Partner',
      phone: testPhone,
      password: 'password123',
      store_name: 'Sahyadri Agro Organic Hub',
      city: 'Pune',
      pincode: '411038',
      description: 'Western Ghats organic green farm specializing in exotic herbs.'
    })
  });
  const regData = await regRes.json();
  console.log('Registration response status:', regRes.status, 'Success:', regData.success, regData.message || '');
  if (regData.success) {
    console.log(`Created Store ID: ${regData.store?.id} "${regData.store?.store_name}"`);
    await testAdminSession(testPhone, 'password123', 'Store 3 Admin (Sahyadri Agro)');
  }

  console.log('\n--- 4. Testing Storefront Filter ---');
  const store2FilterRes = await fetch(`${BASE_URL}/api/products?mode=retail&store=brothers-green-harvest`);
  const store2FilterData = await store2FilterRes.json();
  console.log('Products filtered by Brothers Green Harvest:', store2FilterData.products?.length);
  store2FilterData.products?.forEach(p => console.log(`  * ${p.name} (Sold by: ${p.store?.name || p.store_name})`));

  console.log('\nAll Multi-Store Backend Tests Finished!');
}

testMultiStore().catch(console.error);
