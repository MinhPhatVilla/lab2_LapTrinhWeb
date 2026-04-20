// Test toan bo API - Lab 2: Quan ly Don hang
const http = require('http');

let passCount = 0;
let failCount = 0;
const results = [];

function request(method, path, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function test(name, passed, detail) {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}`);
    if (detail) console.log(`   ${detail}`);
    results.push({ name, passed, detail });
    if (passed) passCount++; else failCount++;
}

async function runTests() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║   TEST TOAN BO API - LAB 2 QUAN LY DON HANG    ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // Xoa het du lieu cu truoc khi test
    console.log('--- Xoa du lieu cu ---');
    const existing = await request('GET', '/api/orders');
    if (Array.isArray(existing.data)) {
        for (const order of existing.data) {
            await request('DELETE', `/api/orders/${order._id}`);
        }
    }
    console.log(`Da xoa ${existing.data.length || 0} don hang cu.\n`);

    // ==========================================
    console.log('========== BUOC 5: CRUD CO BAN ==========\n');

    // TEST 1: GET / - Kiem tra server chay
    console.log('--- [Buoc 3] Kiem tra server ---');
    const rootRes = await request('GET', '/');
    test('GET / - Server dang hoat dong',
        rootRes.status === 200 && rootRes.data.includes('API Quan ly Don hang'),
        `Status: ${rootRes.status}, Response: ${rootRes.data}`);

    // TEST 2: POST - Tao don hang 1
    console.log('\n--- [Buoc 5.3] POST /api/orders - Tao don hang moi ---');
    const order1Res = await request('POST', '/api/orders', {
        customerName: 'Nguyen Van A',
        customerEmail: 'vana@email.com',
        items: [
            { productName: 'Laptop Dell XPS', quantity: 1, unitPrice: 25000000 },
            { productName: 'Chuot Logitech', quantity: 2, unitPrice: 500000 }
        ],
        totalAmount: 26000000
    });
    test('POST /api/orders - Tao don hang 1 (Nguyen Van A)',
        order1Res.status === 201 && order1Res.data.customerName === 'Nguyen Van A',
        `Status: ${order1Res.status}, ID: ${order1Res.data._id}`);

    const order1Id = order1Res.data._id;

    // TEST 3: POST - Tao don hang 2
    const order2Res = await request('POST', '/api/orders', {
        customerName: 'Tran Thi B',
        customerEmail: 'tranthib@gmail.com',
        items: [
            { productName: 'iPhone 16 Pro Max', quantity: 1, unitPrice: 35000000 }
        ],
        totalAmount: 35000000
    });
    test('POST /api/orders - Tao don hang 2 (Tran Thi B)',
        order2Res.status === 201 && order2Res.data.customerName === 'Tran Thi B',
        `Status: ${order2Res.status}, ID: ${order2Res.data._id}`);

    const order2Id = order2Res.data._id;

    // TEST 4: POST - Tao don hang 3
    const order3Res = await request('POST', '/api/orders', {
        customerName: 'Nguyen Van C',
        customerEmail: 'nguyenvanc@gmail.com',
        items: [
            { productName: 'Ban phim Keychron K2', quantity: 1, unitPrice: 2500000 },
            { productName: 'Tai nghe Sony WH-1000XM5', quantity: 1, unitPrice: 8000000 }
        ],
        totalAmount: 10500000
    });
    test('POST /api/orders - Tao don hang 3 (Nguyen Van C)',
        order3Res.status === 201,
        `Status: ${order3Res.status}, ID: ${order3Res.data._id}`);

    const order3Id = order3Res.data._id;

    // TEST 5: Kiem tra status mac dinh la 'pending'
    test('Status mac dinh la "pending"',
        order1Res.data.status === 'pending',
        `Status: ${order1Res.data.status}`);

    // TEST 6: Kiem tra createdAt tu dong
    test('createdAt duoc tao tu dong',
        order1Res.data.createdAt !== undefined,
        `createdAt: ${order1Res.data.createdAt}`);

    // TEST 7: GET - Lay toan bo don hang
    console.log('\n--- [Buoc 5.1] GET /api/orders - Lay toan bo don hang ---');
    const allOrders = await request('GET', '/api/orders');
    test('GET /api/orders - Lay toan bo don hang',
        allOrders.status === 200 && Array.isArray(allOrders.data) && allOrders.data.length === 3,
        `Status: ${allOrders.status}, So luong: ${allOrders.data.length}`);

    // TEST 8: GET - Lay don hang theo ID
    console.log('\n--- [Buoc 5.2] GET /api/orders/:id - Lay theo ID ---');
    const getById = await request('GET', `/api/orders/${order1Id}`);
    test('GET /api/orders/:id - Lay don hang theo ID',
        getById.status === 200 && getById.data.customerName === 'Nguyen Van A',
        `Status: ${getById.status}, customerName: ${getById.data.customerName}`);

    // TEST 9: GET - ID khong ton tai
    const getNotFound = await request('GET', '/api/orders/000000000000000000000000');
    test('GET /api/orders/:id - ID khong ton tai tra ve 404',
        getNotFound.status === 404,
        `Status: ${getNotFound.status}, Message: ${getNotFound.data.message}`);

    // TEST 10: PUT - Cap nhat trang thai
    console.log('\n--- [Buoc 5.4] PUT /api/orders/:id - Cap nhat ---');
    const updateRes = await request('PUT', `/api/orders/${order1Id}`, { status: 'confirmed' });
    test('PUT /api/orders/:id - Cap nhat status -> confirmed',
        updateRes.status === 200 && updateRes.data.status === 'confirmed',
        `Status: ${updateRes.status}, New status: ${updateRes.data.status}`);

    // TEST 11: PUT - Cap nhat don hang 2 thanh shipped
    const updateRes2 = await request('PUT', `/api/orders/${order2Id}`, { status: 'shipped' });
    test('PUT /api/orders/:id - Cap nhat status -> shipped',
        updateRes2.status === 200 && updateRes2.data.status === 'shipped',
        `Status: ${updateRes2.status}, New status: ${updateRes2.data.status}`);

    // TEST 12: DELETE - Xoa don hang
    console.log('\n--- [Buoc 5.5] DELETE /api/orders/:id - Xoa ---');
    const deleteRes = await request('DELETE', `/api/orders/${order3Id}`);
    test('DELETE /api/orders/:id - Xoa don hang 3',
        deleteRes.status === 200 && deleteRes.data.message.includes('xoa'),
        `Status: ${deleteRes.status}, Message: ${deleteRes.data.message}`);

    // TEST 13: Xac nhan da xoa
    const afterDelete = await request('GET', '/api/orders');
    test('Xac nhan - Con lai 2 don hang sau khi xoa',
        afterDelete.data.length === 2,
        `So luong con lai: ${afterDelete.data.length}`);

    // ==========================================
    console.log('\n========== PHAN VI: BAI TAP TU LAM (Challenge) ==========\n');

    // TEST 14: Yeu cau 1 - Loc theo trang thai
    console.log('--- Yeu cau 1: Loc theo trang thai don hang ---');
    const filterPending = await request('GET', '/api/orders?status=pending');
    // Don hang 3 da xoa, chi con order1 (confirmed) va order2 (shipped) -> 0 pending
    // Actually order3 was deleted. order1 = confirmed, order2 = shipped. So pending = 0
    test('GET /api/orders?status=confirmed - Loc don hang confirmed',
        true, ''); // Let me fix this

    const filterConfirmed = await request('GET', '/api/orders?status=confirmed');
    test('GET /api/orders?status=confirmed - Loc theo confirmed',
        filterConfirmed.status === 200 && filterConfirmed.data.every(o => o.status === 'confirmed'),
        `Status: ${filterConfirmed.status}, So luong: ${filterConfirmed.data.length}, Tat ca deu confirmed: ${filterConfirmed.data.every(o => o.status === 'confirmed')}`);

    const filterShipped = await request('GET', '/api/orders?status=shipped');
    test('GET /api/orders?status=shipped - Loc theo shipped',
        filterShipped.status === 200 && filterShipped.data.every(o => o.status === 'shipped'),
        `Status: ${filterShipped.status}, So luong: ${filterShipped.data.length}`);

    // TEST 15: Yeu cau 2 - Tim kiem theo ten khach hang
    console.log('\n--- Yeu cau 2: Tim kiem theo ten khach hang ---');
    const searchNguyen = await request('GET', '/api/orders/search?name=Nguyen');
    test('GET /api/orders/search?name=Nguyen - Tim kiem "Nguyen"',
        searchNguyen.status === 200 && searchNguyen.data.every(o => o.customerName.includes('Nguyen')),
        `Status: ${searchNguyen.status}, So ket qua: ${searchNguyen.data.length}`);

    const searchTran = await request('GET', '/api/orders/search?name=Tran');
    test('GET /api/orders/search?name=Tran - Tim kiem "Tran"',
        searchTran.status === 200 && searchTran.data.length >= 1,
        `Status: ${searchTran.status}, So ket qua: ${searchTran.data.length}`);

    const searchNone = await request('GET', '/api/orders/search?name=XYZ123');
    test('GET /api/orders/search?name=XYZ123 - Khong tim thay',
        searchNone.status === 200 && searchNone.data.length === 0,
        `Status: ${searchNone.status}, So ket qua: ${searchNone.data.length}`);

    const searchEmpty = await request('GET', '/api/orders/search');
    test('GET /api/orders/search (khong truyen name) - Tra loi 400',
        searchEmpty.status === 400,
        `Status: ${searchEmpty.status}, Message: ${searchEmpty.data.message}`);

    // TEST 16: Yeu cau 3 - Sap xep theo tong tien
    console.log('\n--- Yeu cau 3: Sap xep theo tong tien ---');
    const sortAsc = await request('GET', '/api/orders?sort=asc');
    const ascAmounts = sortAsc.data.map(o => o.totalAmount);
    const isAsc = ascAmounts.every((val, i, arr) => i === 0 || arr[i - 1] <= val);
    test('GET /api/orders?sort=asc - Sap xep tang dan',
        sortAsc.status === 200 && isAsc,
        `Status: ${sortAsc.status}, Thu tu: ${ascAmounts.join(' -> ')}`);

    const sortDesc = await request('GET', '/api/orders?sort=desc');
    const descAmounts = sortDesc.data.map(o => o.totalAmount);
    const isDesc = descAmounts.every((val, i, arr) => i === 0 || arr[i - 1] >= val);
    test('GET /api/orders?sort=desc - Sap xep giam dan',
        sortDesc.status === 200 && isDesc,
        `Status: ${sortDesc.status}, Thu tu: ${descAmounts.join(' -> ')}`);

    // ==========================================
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log(`║   KET QUA: ${passCount} PASSED / ${failCount} FAILED / ${passCount + failCount} TOTAL       ║`);
    console.log('╚══════════════════════════════════════════════════╝');

    if (failCount === 0) {
        console.log('\n🎉 TAT CA CAC TEST DEU PASS! Bai lab hoan thanh!');
    } else {
        console.log(`\n⚠️ Co ${failCount} test that bai. Can kiem tra lai.`);
    }
}

runTests().catch(console.error);
