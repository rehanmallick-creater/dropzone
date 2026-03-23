const API = 'https://dropzone-backend-q3cu.onrender.com/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token) {
  window.location.href = 'login.html';
}

document.getElementById('userName').textContent = `👋 ${user?.name}`;

let miniMap;
let pickupMarker;
let dropMarker;
let mapMode = 'pickup';

function initMiniMap() {
  miniMap = L.map('miniMap').setView([25.5941, 85.1376], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(miniMap);

  miniMap.on('click', function(e) {
    const { lat, lng } = e.latlng;
    const locationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    if (mapMode === 'pickup') {
      document.getElementById('pickup').value = `Custom: ${locationName}`;
      document.getElementById('pickupLat').value = lat;
      document.getElementById('pickupLng').value = lng;

      if (pickupMarker) miniMap.removeLayer(pickupMarker);
      pickupMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          html: `<div style="background:#2563eb;color:white;padding:4px 8px;border-radius:6px;font-size:11px;white-space:nowrap;font-family:Inter,sans-serif">Pickup</div>`,
          className: '',
          iconAnchor: [20, 10]
        })
      }).addTo(miniMap);

    } else {
      document.getElementById('drop').value = `Custom: ${locationName}`;
      document.getElementById('dropLat').value = lat;
      document.getElementById('dropLng').value = lng;

      if (dropMarker) miniMap.removeLayer(dropMarker);
      dropMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          html: `<div style="background:#dc2626;color:white;padding:4px 8px;border-radius:6px;font-size:11px;white-space:nowrap;font-family:Inter,sans-serif">Drop</div>`,
          className: '',
          iconAnchor: [20, 10]
        })
      }).addTo(miniMap);
    }
  });
}

function setMapMode(mode) {
  mapMode = mode;
  document.getElementById('mapMode').textContent = `selecting ${mode}`;
  document.getElementById('btnPickup').classList.toggle('active', mode === 'pickup');
  document.getElementById('btnDrop').classList.toggle('active', mode === 'drop');
}

function handlePickupSelect() {
  const val = document.getElementById('pickupSelect').value;
  if (!val) return;
  const [name, lat, lng] = val.split('|');
  document.getElementById('pickup').value = name;
  document.getElementById('pickupLat').value = lat;
  document.getElementById('pickupLng').value = lng;

  if (pickupMarker) miniMap.removeLayer(pickupMarker);
  pickupMarker = L.marker([parseFloat(lat), parseFloat(lng)], {
    icon: L.divIcon({
      html: `<div style="background:#2563eb;color:white;padding:4px 8px;border-radius:6px;font-size:11px;white-space:nowrap;font-family:Inter,sans-serif">Pickup</div>`,
      className: '',
      iconAnchor: [20, 10]
    })
  }).addTo(miniMap);
  miniMap.setView([parseFloat(lat), parseFloat(lng)], 14);
}

function handleDropSelect() {
  const val = document.getElementById('dropSelect').value;
  if (!val) return;
  const [name, lat, lng] = val.split('|');
  document.getElementById('drop').value = name;
  document.getElementById('dropLat').value = lat;
  document.getElementById('dropLng').value = lng;

  if (dropMarker) miniMap.removeLayer(dropMarker);
  dropMarker = L.marker([parseFloat(lat), parseFloat(lng)], {
    icon: L.divIcon({
      html: `<div style="background:#dc2626;color:white;padding:4px 8px;border-radius:6px;font-size:11px;white-space:nowrap;font-family:Inter,sans-serif">Drop</div>`,
      className: '',
      iconAnchor: [20, 10]
    })
  }).addTo(miniMap);
  miniMap.setView([parseFloat(lat), parseFloat(lng)], 14);
}

async function placeOrder() {
  const pickup = document.getElementById('pickup').value;
  const drop = document.getElementById('drop').value;
  const description = document.getElementById('description').value;
  const payload = document.getElementById('payload').value;
  const pickupLat = document.getElementById('pickupLat').value;
  const pickupLng = document.getElementById('pickupLng').value;
  const dropLat = document.getElementById('dropLat').value;
  const dropLng = document.getElementById('dropLng').value;
  const btn = document.querySelector('.btn-primary');

  if (!pickup || !drop || !payload) {
    showOrderAlert('Please fill all required fields', 'error');
    return;
  }

  if (payload <= 0) {
    showOrderAlert('Payload weight must be greater than 0', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Placing order...';

  try {
    const response = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        pickupLocation: pickup,
        pickupLat: parseFloat(pickupLat),
        pickupLng: parseFloat(pickupLng),
        dropLocation: drop,
        dropLat: parseFloat(dropLat),
        dropLng: parseFloat(dropLng),
        description,
        payloadWeight: parseFloat(payload)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showOrderAlert(data.message, 'error');
      btn.disabled = false;
      btn.innerHTML = 'Place Order';
      return;
    }

    showOrderAlert('Order placed successfully!', 'success');
    btn.disabled = false;
    btn.innerHTML = 'Place Order';
    document.getElementById('pickup').value = '';
    document.getElementById('drop').value = '';
    document.getElementById('description').value = '';
    document.getElementById('payload').value = '';
    document.getElementById('pickupSelect').value = '';
    document.getElementById('dropSelect').value = '';
    if (pickupMarker) miniMap.removeLayer(pickupMarker);
    if (dropMarker) miniMap.removeLayer(dropMarker);
    loadOrders();

  } catch (error) {
    showOrderAlert('Something went wrong. Try again.', 'error');
    btn.disabled = false;
    btn.innerHTML = 'Place Order';
  }
}
async function loadOrders() {
  try {
    const list = document.getElementById('ordersList');
    list.innerHTML = '<div class="loading"><span class="spinner"></span>Loading orders...</div>';

    const response = await fetch(`${API}/orders/myorders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const orders = await response.json();

    if (orders.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <p>No orders yet. Place your first delivery!</p>
        </div>`;
      return;
    }

    list.innerHTML = orders.map(order => `
      <div class="order-item">
        <div class="order-info">
          <h4>${order.pickupLocation} → ${order.dropLocation}</h4>
          <p>${order.description || 'No description'} •
          ${order.payloadWeight}kg •
          ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
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
    const response = await fetch(`${API}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    const lastBot = document.querySelector('.chat-message.bot:last-child .chat-bubble');
    if (lastBot) lastBot.textContent = data.reply || 'Sorry I could not understand that!';

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

document.addEventListener('DOMContentLoaded', () => {
  initMiniMap();
  loadOrders();
});