import { socket, systemState } from '../../front-end.js';

let connectionInfo = {
  ping: 0,
  quality: 'good',
  status: 'connected',
  lastPing: Date.now(),
};

let pingInterval;
let connectionIndicator;

export const initializeConnectionMonitor = () => {
  createConnectionIndicator();
  startPingMonitoring();

  // Add socket event listeners
  socket.on('pong', handlePongResponse);
  socket.on('connect', handleConnect);
  socket.on('disconnect', handleDisconnect);
};

const createConnectionIndicator = () => {
  // Remove existing indicator if it exists
  const existing = document.getElementById('connectionIndicator');
  if (existing) {
    existing.remove();
  }

  connectionIndicator = document.createElement('div');
  connectionIndicator.id = 'connectionIndicator';
  connectionIndicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.8);
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    z-index: 1000;
    user-select: none;
    transition: all 0.3s ease;
    border: 1px solid #333;
    display: flex;
    gap: 2px;
    align-items: center;
  `;

  updateConnectionDisplay();

  connectionIndicator.addEventListener('click', showConnectionDetails);
  document.body.appendChild(connectionIndicator);
};

const startPingMonitoring = () => {
  if (pingInterval) {
    clearInterval(pingInterval);
  }

  pingInterval = setInterval(() => {
    if (socket.connected) {
      connectionInfo.lastPing = Date.now();
      socket.emit('ping');
    }
  }, 3000); // Check every 3 seconds
};

const handlePongResponse = () => {
  const ping = Date.now() - connectionInfo.lastPing;
  connectionInfo.ping = ping;

  // Determine connection quality
  if (ping < 100) {
    connectionInfo.quality = 'excellent';
  } else if (ping < 250) {
    connectionInfo.quality = 'good';
  } else if (ping < 500) {
    connectionInfo.quality = 'fair';
  } else if (ping < 1000) {
    connectionInfo.quality = 'poor';
  } else {
    connectionInfo.quality = 'bad';
  }

  updateConnectionDisplay();
};

const handleConnect = () => {
  connectionInfo.status = 'connected';
  updateConnectionDisplay();
};

const handleDisconnect = () => {
  connectionInfo.status = 'disconnected';
  connectionInfo.quality = 'disconnected';
  updateConnectionDisplay();
};

const updateConnectionDisplay = () => {
  if (!connectionIndicator) return;

  const qualityColors = {
    excellent: '#00ff00',
    good: '#90EE90',
    fair: '#ffff00',
    poor: '#ff8c00',
    bad: '#ff0000',
    disconnected: '#666666',
  };

  const qualityBars = {
    excellent: 4,
    good: 3,
    fair: 2,
    poor: 1,
    bad: 0,
    disconnected: 0,
  };

  const color = qualityColors[connectionInfo.quality] || '#666666';
  const activeBars = qualityBars[connectionInfo.quality] || 0;

  // Clear existing content
  connectionIndicator.innerHTML = '';

  // Create 4 connection bars
  for (let i = 0; i < 4; i++) {
    const bar = document.createElement('div');
    bar.style.cssText = `
      width: 4px;
      height: ${6 + i * 3}px;
      background: ${i < activeBars ? color : '#333'};
      border-radius: 1px;
      transition: background 0.3s ease;
    `;
    connectionIndicator.appendChild(bar);
  }

  // Add ping text
  const pingText = document.createElement('div');
  pingText.style.cssText = `
    color: ${color};
    font-size: 10px;
    font-family: monospace;
    margin-left: 4px;
    min-width: 35px;
  `;

  if (connectionInfo.status === 'connected') {
    pingText.textContent = `${connectionInfo.ping}ms`;
  } else {
    pingText.textContent = 'OFF';
  }

  connectionIndicator.appendChild(pingText);

  // Add status text for tooltip
  let statusText = '';
  if (connectionInfo.status === 'connected') {
    statusText = `${connectionInfo.ping}ms - ${connectionInfo.quality}`;
  } else {
    statusText = 'Disconnected';
  }
  connectionIndicator.title = statusText;
};

const showConnectionDetails = () => {
  // Remove existing popup if it exists
  const existing = document.getElementById('connectionDetails');
  if (existing) {
    existing.remove();
    return;
  }

  const popup = document.createElement('div');
  popup.id = 'connectionDetails';
  popup.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 20px;
    background: rgba(0, 0, 0, 0.95);
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 1001;
    min-width: 200px;
    border: 1px solid #333;
  `;

  const details = [
    `Status: ${connectionInfo.status}`,
    `Ping: ${connectionInfo.ping}ms`,
    `Quality: ${connectionInfo.quality}`,
    `Socket ID: ${socket.id || 'N/A'}`,
    `Room: ${systemState.roomId || 'None'}`,
    `Transport: ${socket.io.engine.transport.name || 'N/A'}`,
  ];

  popup.innerHTML = details.join('<br>');

  // Add close button
  const closeBtn = document.createElement('div');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 5px;
    right: 10px;
    cursor: pointer;
    font-size: 16px;
    color: #aaa;
  `;
  closeBtn.addEventListener('click', () => popup.remove());
  popup.appendChild(closeBtn);

  document.body.appendChild(popup);

  // Auto-close after 10 seconds
  setTimeout(() => {
    if (popup.parentNode) {
      popup.remove();
    }
  }, 10000);

  // Close when clicking outside
  setTimeout(() => {
    const handleOutsideClick = (e) => {
      if (
        !popup.contains(e.target) &&
        !connectionIndicator.contains(e.target)
      ) {
        popup.remove();
        document.removeEventListener('click', handleOutsideClick);
      }
    };
    document.addEventListener('click', handleOutsideClick);
  }, 100);
};

export const cleanupConnectionMonitor = () => {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }

  if (connectionIndicator) {
    connectionIndicator.remove();
    connectionIndicator = null;
  }

  const popup = document.getElementById('connectionDetails');
  if (popup) {
    popup.remove();
  }

  // Remove event listeners
  socket.off('pong', handlePongResponse);
  socket.off('connect', handleConnect);
  socket.off('disconnect', handleDisconnect);
};

// Export connection info for debugging
export const getConnectionInfo = () => ({ ...connectionInfo });
