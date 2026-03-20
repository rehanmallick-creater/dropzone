const API = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token) {
  window.location.href = 'login.html';
}

document.getElementById('userName').textContent = `👋 ${user?.name}`;

async function placeOrder() {
  const pickup = document.getElementById('pickup').value;
  const drop = document.getElementById('drop').value;
  const description = document.getElementById('description').value;
  const payload = document.getElementById('payload').value;

  if (!pickup || !drop) {
    showOrderAlert('Please fill pickup and drop location', 'error');
    return;
  }
  if (payload <= 0) {
    showOrderAlert('Payload weight must be greater than 0', 'error');
    return;
  }

  try {
    const response = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ pickupLocation: pickup, dropLocation: drop, description, payloadWeight: parseFloat(payload) })
    });

    const data = await response.json();

    if (!response.ok) {
      showOrderAlert(data.message, 'error');
      return;
    }

    showOrderAlert('Order placed successfully!', 'success');
    document.getElementById('pickup').value = '';
    document.getElementById('drop').value = '';
    document.getElementById('description').value = '';
    document.getElementById('payload').value = '';
    loadOrders();

  } catch (error) {
    showOrderAlert('Something went wrong. Try again.', 'error');
  }
}

async function loadOrders() {
  try {
    const response = await fetch(`${API}/orders/myorders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const orders = await response.json();
    const list = document.getElementById('ordersList');

    if (orders.length === 0) {
      list.innerHTML = '<div class="loading">No orders yet. Place your first order!</div>';
      return;
    }

    list.innerHTML = orders.map(order => `
      <div class="order-item">
        <div class="order-info">
          <h4>${order.pickupLocation} → ${order.dropLocation}</h4>
          <p>${order.description || 'No description'} • ${order.payloadWeight}kg • ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <span class="order-status status-${order.status.replace(' ', '-')}">${order.status}</span>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;

  addChatMessage(message, 'user');
  input.value = '';

  addChatMessage('Thinking...', 'bot');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_CLAUDE_API_KEY',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: 'You are a helpful delivery assistant for DropZone, a drone delivery service. Answer questions about deliveries, drone tracking, and orders. Keep answers short and helpful.',
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await response.json();
    const lastBot = document.querySelector('.chat-message.bot:last-child .chat-bubble');
    if (lastBot) lastBot.textContent = data.content[0].text;

  } catch (error) {
    const lastBot = document.querySelector('.chat-message.bot:last-child .chat-bubble');
    if (lastBot) lastBot.textContent = 'Sorry, I could not connect right now. Try again!';
  }
}

function handleChatKey(event) {
  if (event.key === 'Enter') sendMessage();
}

function addChatMessage(message, type) {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-message ${type}`;
  div.innerHTML = `<div class="chat-bubble">${message}</div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function showOrderAlert(message, type) {
  const alert = document.getElementById('orderAlert');
  alert.textContent = message;
  alert.className = `alert ${type}`;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

loadOrders();