const API = 'http://localhost:5000/api';

async function handleLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const alert = document.getElementById('alert');
  const btn = document.getElementById('loginBtn');

  if (!email || !password) {
    showAlert('Please fill in all fields', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Logging in...';

  try {
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Login';
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showAlert('Login successful! Redirecting...', 'success');

    setTimeout(() => {
      if (data.user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    }, 1000);

  } catch (error) {
    showAlert('Something went wrong. Try again.', 'error');
    btn.disabled = false;
    btn.textContent = 'Login';
  }
}

async function handleRegister() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const btn = document.getElementById('registerBtn');

  if (!name || !email || !password) {
    showAlert('Please fill in all fields', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Creating account...';

  try {
    const response = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: 'user' })
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Create Account';
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showAlert('Account created! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);

  } catch (error) {
    showAlert('Something went wrong. Try again.', 'error');
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}

function showAlert(message, type) {
  const alert = document.getElementById('alert');
  alert.textContent = message;
  alert.className = `alert ${type}`;
}