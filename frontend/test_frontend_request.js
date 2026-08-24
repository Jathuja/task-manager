const axios = require('axios');

async function test() {
  try {
    const username = "testuser_" + Date.now();
    await axios.post('http://127.0.0.1:8000/register', {
      username: username,
      email: username + "@test.com",
      password: "password123"
    });

    const loginRes = await axios.post('http://127.0.0.1:8000/login', 
      new URLSearchParams({
        username: username,
        password: "password123"
      }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const token = loginRes.data.access_token;

    const newTask = {
      id: Date.now(), 
      title: "Test Task",
      status: "todo",
      priority: "high",
      due_date: "2026-08-24"
    };

    const res = await axios.post('http://127.0.0.1:8000/tasks', newTask, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    if (err.response) {
      console.error(err.response.status, err.response.data);
    } else {
      console.error(err);
    }
  }
}
test();
