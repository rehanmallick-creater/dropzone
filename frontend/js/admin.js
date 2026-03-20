const API = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || user?.role !== 'admin') {
  window.location.href = 'login.html';
}

document.getElementById('adminName').textContent = `👋 ${user?.name}`;

let map;
let droneMarkers = {};

function initMap() {
  map = L.map('map').setView([25.5941, 85.1376], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

function getDroneIcon(status) {
  const colors = {
    'available': '#16a34a',
    'assigned': '#2563eb',
    'on the way': '#d97706',
    'charging': '#9ca3af'
  };
  const color = colors[status] || '#2563eb';
  return L.divIcon({
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14],
    className: ''
  });
}

async function loadDrones() {
  try {
    const response = await fetch(`${API}/drones`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const drones = await response.json();

    const list = document.getElementById('dronesList');
    document.getElementById('activeDrones').textContent =
      drones.filter(d => d.status === 'on the way' || d.status === 'assigned').length;

    if (drones.length === 0) {
      list.innerHTML = '<div class="loading">No drones in fleet yet.</div>';
      return;
    }

    list.innerHTML = drones.map(drone => {
      const batteryClass = drone.battery < 30 ? 'low' : drone.battery < 60 ? 'medium' : '';
      return `
        <div class="drone-item">
          <div class="drone-info">
            <h4>${drone.name}</h4>
            <p>Max payload: ${drone.maxPayload}kg • Status: ${drone.status}</p>
          </div>
          <div class="drone-badges">
            <div class="battery-bar">
              <div class="battery-fill ${batteryClass}" style="width:${drone.battery}%"></div>
            </div>
            <span style="font-size:12px;color:#6b7280">${drone.battery}%</span>
            <span class="order-status status-${drone.status.replace(' ','-')}">${drone.status}</span>
          </div>
        </div>
      `;
    }).join('');

    drones.forEach(drone => {
      if (droneMarkers[drone._id]) {
        droneMarkers[drone._id].setLatLng([drone.latitude, drone.longitude]);
        droneMarkers[drone._id].setIcon(getDroneIcon(drone.status));
      } else {
        const marker = L.marker([drone.latitude, drone.longitude], {
          icon: getDroneIcon(drone.status)
        }).addTo(map).bindPopup(`
          <b>${drone.name}</b><br>
          Status: ${drone.status}<br>
          Battery: ${drone.battery}%<br>
          Max Payload: ${drone.maxPayload}kg
        `);
        droneMarkers[drone._id] = marker;
      }
    });

  } catch (error) {
    console.error('Error loading drones:', error);
  }
}

async function loadOrders() {
  try {
    const response = await fetch(`${API}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const orders = await response.json();

    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('pendingOrders').textContent =
      orders.filter(o => o.status === 'pending' || o.status === 'assigned').length;
    document.getElementById('deliveredOrders').textContent =
      orders.filter(o => o.status === 'delivered').length;

    const list = document.getElementById('adminOrdersList');
    if (orders.length === 0) {
      list.innerHTML = '<div class="loading">No orders yet.</div>';
      return;
    }

    list.innerHTML = orders.map(order => `
      <div class="admin-order-item">
        <div class="admin-order-header">
          <h4>${order.pickupLocation} → ${order.dropLocation}</h4>
          <span class="order-status status-${order.status.replace(' ', '-')}">${order.status}</span>
        </div>
        <div class="admin-order-details">
          User: ${order.user?.name || 'Unknown'} •
          Payload: ${order.payloadWeight}kg •
          Drone: ${order.drone?.name || 'Not assigned'} •
          ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
        </div>
        <div class="order-actions">
          ${order.status === 'assigned' ? `
            <button class="btn-status btn-ontheway"
              onclick="updateStatus('${order._id}', 'on the way')">
              On The Way
            </button>` : ''}
          ${order.status === 'on the way' ? `
            <button class="btn-status btn-delivered"
              onclick="updateStatus('${order._id}', 'delivered')">
              Mark Delivered
            </button>` : ''}
          ${order.status !== 'delivered' && order.status !== 'cancelled' ? `
            <button class="btn-status btn-cancelled"
              onclick="updateStatus('${order._id}', 'cancelled')">
              Cancel
            </button>` : ''}
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

async function addDrone() {
  const name = document.getElementById('droneName').value;
  const maxPayload = document.getElementById('dronePayload').value;
  const battery = document.getElementById('droneBattery').value || 100;

  if (!name || !maxPayload) {
    showDroneAlert('Please fill drone name and payload', 'error');
    return;
  }

  try {
    const response = await fetch(`${API}/drones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        maxPayload: parseFloat(maxPayload),
        battery: parseInt(battery)
      })
    });

    const data = await response.json();
    if (!response.ok) {
      showDroneAlert(data.message, 'error');
      return;
    }

    showDroneAlert('Drone added successfully!', 'success');
    document.getElementById('droneName').value = '';
    document.getElementById('dronePayload').value = '';
    document.getElementById('droneBattery').value = '';
    loadDrones();

  } catch (error) {
    showDroneAlert('Something went wrong.', 'error');
  }
}

async function updateStatus(orderId, status) {
  try {
    const response = await fetch(`${API}/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.message);
      return;
    }

    if (status === 'on the way' && data.drone) {
      const droneId = data.drone._id;

      const drone = await fetch(`${API}/drones/${droneId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json());

      const pickupLat = data.pickupLat || drone.latitude;
      const pickupLng = data.pickupLng || drone.longitude;
      const dropLat = data.dropLat || (drone.latitude + 0.02);
      const dropLng = data.dropLng || (drone.longitude + 0.02);

      simulateDroneMovement(
        droneId,
        pickupLat,
        pickupLng,
        dropLat,
        dropLng
      );
    }

    loadOrders();
    loadDrones();

  } catch (error) {
    console.error('Error updating status:', error);
  }
}

function showDroneAlert(message, type) {
  const alert = document.getElementById('droneAlert');
  alert.textContent = message;
  alert.className = `alert ${type}`;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}
function simulateDroneMovement(droneId, startLat, startLng, endLat, endLng) {
  const steps = 50;
  let currentStep = 0;

  const latStep = (endLat - startLat) / steps;
  const lngStep = (endLng - startLng) / steps;

  const interval = setInterval(() => {
    if (currentStep >= steps) {
      clearInterval(interval);
      return;
    }

    const newLat = startLat + (latStep * currentStep);
    const newLng = startLng + (lngStep * currentStep);

    if (droneMarkers[droneId]) {
      droneMarkers[droneId].setLatLng([newLat, newLng]);
      map.panTo([newLat, newLng]);
    }

    currentStep++;
  }, 200);
}


initMap();
loadDrones();
loadOrders();
setInterval(() => {
  loadDrones();
  loadOrders();
}, 10000);