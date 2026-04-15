require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

async function test() {
  const secret = process.env.JWT_SECRET || 'replace_this_secret';
  const token = jwt.sign({ user_id: 39, email: 'admin@artiset.com', role: 'admin' }, secret);
  try {
    const res = await axios.post('http://localhost:3000/companies', {
      company_name: 'Axios Test Co',
      spoc_email: 'axios@test.com'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('SUCCESS:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('ERROR RESPONSE:', err.response.status, err.response.data);
    } else {
      console.error('ERROR:', err.message);
    }
  }
}
test();
