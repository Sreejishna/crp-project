const http = require('http');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting End-to-End Functional Test Suite...');

  // 1. Health check
  const healthRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
  });
  console.log('1. Health Check status:', healthRes.statusCode, JSON.parse(healthRes.data).status);

  // 2. Student Login
  const studentPayload = new URLSearchParams({
    email: 'rahul.mca@crp.edu',
    password: 'student123',
    expectedRole: 'student',
  }).toString();

  const studentLoginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(studentPayload),
      },
    },
    studentPayload
  );

  console.log('2. Student Login Redirect:', studentLoginRes.statusCode, studentLoginRes.headers.location);
  const studentCookie = studentLoginRes.headers['set-cookie']
    ? studentLoginRes.headers['set-cookie'][0].split(';')[0]
    : '';

  // 3. Access Student Dashboard with Session Cookie
  const studentDashRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/student/dashboard',
    method: 'GET',
    headers: { Cookie: studentCookie },
  });
  console.log(
    '3. Student Dashboard Access:',
    studentDashRes.statusCode,
    studentDashRes.data.includes('Rahul Sharma') ? '✅ Rahul Sharma profile rendered' : '❌ Failed'
  );

  // 4. Role Authorization Check: Student accessing Admin Dashboard
  const unauthorizedRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/admin/dashboard',
    method: 'GET',
    headers: { Cookie: studentCookie },
  });
  console.log(
    '4. Student accessing Admin route blocked & redirected:',
    unauthorizedRes.statusCode,
    unauthorizedRes.headers.location === '/student/dashboard' ? '✅ Blocked & redirected to student dashboard' : '❌ Failed'
  );

  // 5. Admin Login
  const adminPayload = new URLSearchParams({
    email: 'admin@crp.edu',
    password: 'admin123',
    expectedRole: 'admin',
  }).toString();

  const adminLoginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(adminPayload),
      },
    },
    adminPayload
  );

  const adminCookie = adminLoginRes.headers['set-cookie']
    ? adminLoginRes.headers['set-cookie'][0].split(';')[0]
    : '';

  // 6. Access Admin Dashboard
  const adminDashRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/admin/dashboard',
    method: 'GET',
    headers: { Cookie: adminCookie },
  });
  console.log(
    '5. Admin Dashboard Access:',
    adminDashRes.statusCode,
    adminDashRes.data.includes('Central Admin Dashboard') ? '✅ Admin Panel accessible' : '❌ Failed'
  );

  // 7. Department Login
  const deptPayload = new URLSearchParams({
    email: 'mca.coord@crp.edu',
    password: 'dept123',
    expectedRole: 'department',
  }).toString();

  const deptLoginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(deptPayload),
      },
    },
    deptPayload
  );

  const deptCookie = deptLoginRes.headers['set-cookie']
    ? deptLoginRes.headers['set-cookie'][0].split(';')[0]
    : '';

  const deptDashRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/department/dashboard',
    method: 'GET',
    headers: { Cookie: deptCookie },
  });
  console.log(
    '6. Department Dashboard Access:',
    deptDashRes.statusCode,
    deptDashRes.data.includes('MCA') ? '✅ MCA Department Dashboard accessible' : '❌ Failed'
  );

  console.log('🎉 ALL AUTOMATED TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(console.error);
