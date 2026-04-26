const http = require('http');

function apiTest(name, method, path, body) {
    return new Promise((resolve) => {
        const opts = {
            hostname: 'localhost', port: 3000, path, method,
            headers: { 'Content-Type': 'application/json' }
        };
        const req = http.request(opts, (res) => {
            let data = '';
            res.on('data', (c) => data += c);
            res.on('end', () => {
                const ok = res.statusCode < 500;
                const preview = data.substring(0, 100);
                console.log(`${ok ? '✅' : '❌'} [${res.statusCode}] ${name} → ${preview}`);
                resolve({ ok, status: res.statusCode, data });
            });
        });
        req.on('error', (e) => {
            console.log(`❌ ${name}: ${e.message}`);
            resolve({ ok: false });
        });
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('═══════════════════════════════════════════════════');
    console.log('  🏥 HEALTH CHECK - Nông Nghiệp Xanh Server');
    console.log('═══════════════════════════════════════════════════\n');

    // 1. Core APIs
    console.log('── Core APIs ──────────────────────────────────');
    await apiTest('Login (wrong creds)', 'POST', '/api/auth/login', { username: 'test', password: 'test' });
    await apiTest('Shop Items', 'GET', '/api/shop');
    await apiTest('All Tasks', 'GET', '/api/tasks');
    await apiTest('Rankings', 'GET', '/api/rankings');
    await apiTest('Library', 'GET', '/api/library');

    // 2. New Garden APIs
    console.log('\n── Garden Persistence APIs ─────────────────────');
    await apiTest('Load Pots (user 1)', 'GET', '/api/garden/1/pots');
    
    const testPots = [
        { id: 'floor1_pot1', floorId: 1, hasPlant: true, waterLevel: 0.5, fertilizerLevel: 0.5, growthStage: 'Nảy mầm', growingUntil: 0 },
        { id: 'floor1_pot2', floorId: 1, hasPlant: false, waterLevel: 0, fertilizerLevel: 0, growthStage: 'Nảy mầm', growingUntil: 0 },
    ];
    await apiTest('Save Pots (user 1)', 'PUT', '/api/garden/1/pots', { pots: testPots, seeds: 3 });
    await apiTest('Reload Pots (verify)', 'GET', '/api/garden/1/pots');

    // 3. Push Token API
    console.log('\n── Push Notification API ───────────────────────');
    await apiTest('Register Push Token', 'POST', '/api/push/register', { userId: 1, token: 'ExponentPushToken[test123]', platform: 'android' });

    // 4. Sync Stats API
    console.log('\n── Sync Stats API ─────────────────────────────');
    await apiTest('Sync Coins + Seeds', 'PATCH', '/api/stats/1', { coins: 150, seeds: 5 });

    // 4.1 Redemptions API
    console.log('\n── Redemptions API ─────────────────────────────');
    await apiTest('User Redemptions', 'GET', '/api/redemptions/1');

    // 5. Admin / Moderator APIs
    console.log('\n── Admin / Moderator APIs ──────────────────────');
    await apiTest('Admin Stats', 'GET', '/api/admin/stats');
    await apiTest('Pending Submissions', 'GET', '/api/admin/submissions');
    await apiTest('Weekly Tasks (user 1)', 'GET', '/api/tasks/weekly/1');
    
    // 6. Map Data
    console.log('\n── Map Data API ───────────────────────────────');
    await apiTest('Map Data', 'GET', '/api/map/data');

    console.log('\n═══════════════════════════════════════════════════');
    console.log('  ✅ HEALTH CHECK COMPLETE');
    console.log('═══════════════════════════════════════════════════');
}

runTests();
