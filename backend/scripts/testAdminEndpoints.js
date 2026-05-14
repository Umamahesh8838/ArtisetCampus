(async () => {
  try {
    const loginRes = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@artiset.com', password: 'admin123' })
    });

    const loginJson = await loginRes.json();
    console.log('Login response:', JSON.stringify(loginJson, null, 2));

    if (!loginJson || !loginJson.token) {
      console.error('Login failed, no token returned');
      process.exit(1);
    }

    const token = loginJson.token;

    const dashRes = await fetch('http://localhost:3000/admin/dashboard', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dashJson = await dashRes.json();
    console.log('/admin/dashboard:', JSON.stringify(dashJson, null, 2));

    const usersRes = await fetch('http://localhost:3000/users', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const usersJson = await usersRes.json();
    console.log('/users:', JSON.stringify(usersJson, null, 2));

      const questionsRes = await fetch('http://localhost:3000/questions', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const questionsJson = await questionsRes.json();
      console.log('/questions:', JSON.stringify(questionsJson, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error during test:', err);
    process.exit(1);
  }
})();
