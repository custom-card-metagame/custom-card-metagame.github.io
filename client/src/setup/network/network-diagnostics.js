import { socket, systemState } from '../../front-end.js';
import { appendMessage } from '../chatbox/append-message.js';

let connectionStats = {
  latency: [],
  packetLoss: 0,
  disconnections: 0,
  syncErrors: 0,
  lastPingTime: 0,
  isSlowConnection: false,
};

let diagnosticInterval;
let latencyTestInterval;

export const initializeNetworkDiagnostics = () => {
  // Start network quality monitoring
  startLatencyMonitoring();
  startConnectionDiagnostics();

  // Add network event listeners
  socket.on('heartbeatAck', handleHeartbeatResponse);
  socket.on('disconnect', handleDisconnection);
  socket.on('connect', handleReconnection);
};

const startLatencyMonitoring = () => {
  if (latencyTestInterval) {
    clearInterval(latencyTestInterval);
  }

  latencyTestInterval = setInterval(() => {
    if (systemState.isTwoPlayer && systemState.roomId) {
      connectionStats.lastPingTime = Date.now();
      socket.emit('heartbeat', {
        roomId: systemState.roomId,
        timestamp: connectionStats.lastPingTime,
      });
    }
  }, 5000);
};

const handleHeartbeatResponse = (data) => {
  const latency = Date.now() - connectionStats.lastPingTime;
  connectionStats.latency.push(latency);

  // Keep only last 10 latency measurements
  if (connectionStats.latency.length > 10) {
    connectionStats.latency.shift();
  }

  // Calculate average latency
  const avgLatency =
    connectionStats.latency.reduce((a, b) => a + b, 0) /
    connectionStats.latency.length;

  // Detect slow connection
  const wasSlowConnection = connectionStats.isSlowConnection;
  connectionStats.isSlowConnection = avgLatency > 1000; // 1 second threshold

  // Notify user of connection quality changes
  if (!wasSlowConnection && connectionStats.isSlowConnection) {
    appendMessage(
      '',
      'Slow connection detected. Enabling reliability mode...',
      'system',
      false
    );
    enableReliabilityMode();
  } else if (wasSlowConnection && !connectionStats.isSlowConnection) {
    appendMessage('', 'Connection quality improved.', 'system', false);
    disableReliabilityMode();
  }

  // Update connection indicator
  updateConnectionIndicator(avgLatency);
};

const handleDisconnection = (reason) => {
  connectionStats.disconnections++;
  appendMessage(
    '',
    `Connection lost (${reason}). Attempting to reconnect...`,
    'system',
    false
  );
};

const handleReconnection = () => {
  if (connectionStats.disconnections > 0) {
    appendMessage(
      '',
      'Connection restored. Synchronizing game state...',
      'system',
      false
    );

    // Request state recovery after reconnection
    setTimeout(() => {
      if (systemState.roomId) {
        socket.emit('requestFullState', {
          roomId: systemState.roomId,
        });
      }
    }, 1000);
  }
};

const startConnectionDiagnostics = () => {
  if (diagnosticInterval) {
    clearInterval(diagnosticInterval);
  }

  diagnosticInterval = setInterval(() => {
    if (systemState.isTwoPlayer) {
      performConnectionDiagnostic();
    }
  }, 30000); // Run diagnostics every 30 seconds
};

const performConnectionDiagnostic = () => {
  const avgLatency =
    connectionStats.latency.length > 0
      ? connectionStats.latency.reduce((a, b) => a + b, 0) /
        connectionStats.latency.length
      : 0;

  // Check for potential issues
  const issues = [];

  if (avgLatency > 2000) {
    issues.push('High latency detected');
  }

  if (connectionStats.disconnections > 3) {
    issues.push('Frequent disconnections');
  }

  if (connectionStats.syncErrors > 5) {
    issues.push('Synchronization issues');
  }

  // Log issues to console for debugging
  if (issues.length > 0) {
    console.warn('Network issues detected:', issues);
    console.log('Connection stats:', connectionStats);
  }
};

const enableReliabilityMode = () => {
  // Reduce update frequency for slow connections
  if (window.spectatorActionInterval) {
    clearInterval(window.spectatorActionInterval);
    window.spectatorActionInterval = setInterval(() => {
      if (systemState.isTwoPlayer) {
        const data = {
          selfUsername: systemState.p2SelfUsername,
          selfDeckData: systemState.selfDeckData,
          oppDeckData: systemState.p2OppDeckData,
          oppUsername: systemState.p2OppUsername,
          roomId: systemState.roomId,
          spectatorActionData: systemState.exportActionData,
          socketId: socket.id,
        };
        socket.emit('spectatorActionData', data);
      }
    }, 1500); // Moderate update rate for reliability
  }

  // Show reliability mode indicator
  showConnectionStatus('Reliability Mode', 'orange');
};

const disableReliabilityMode = () => {
  // Restore normal update frequency
  if (window.spectatorActionInterval) {
    clearInterval(window.spectatorActionInterval);
    window.spectatorActionInterval = setInterval(() => {
      if (systemState.isTwoPlayer) {
        const data = {
          selfUsername: systemState.p2SelfUsername,
          selfDeckData: systemState.selfDeckData,
          oppDeckData: systemState.p2OppDeckData,
          oppUsername: systemState.p2OppUsername,
          roomId: systemState.roomId,
          spectatorActionData: systemState.exportActionData,
          socketId: socket.id,
        };
        socket.emit('spectatorActionData', data);
      }
    }, 1000); // Normal update rate
  }

  // Clear reliability mode indicator
  hideConnectionStatus();
};

const updateConnectionIndicator = (latency) => {
  let status, color;

  if (latency < 100) {
    status = 'Excellent';
    color = 'green';
  } else if (latency < 300) {
    status = 'Good';
    color = 'lightgreen';
  } else if (latency < 600) {
    status = 'Fair';
    color = 'yellow';
  } else if (latency < 1000) {
    status = 'Poor';
    color = 'orange';
  } else {
    status = 'Very Poor';
    color = 'red';
  }

  showConnectionStatus(`${status} (${Math.round(latency)}ms)`, color);
};

const showConnectionStatus = (text, color) => {
  let indicator = document.getElementById('connectionIndicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'connectionIndicator';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      z-index: 10000;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(indicator);
  }

  indicator.textContent = text;
  indicator.style.backgroundColor = color;
  indicator.style.color = ['yellow', 'lightgreen'].includes(color)
    ? 'black'
    : 'white';
};

const hideConnectionStatus = () => {
  const indicator = document.getElementById('connectionIndicator');
  if (indicator) {
    indicator.remove();
  }
};

export const reportSyncError = () => {
  connectionStats.syncErrors++;
};

export const getConnectionStats = () => {
  return { ...connectionStats };
};

export const cleanupNetworkDiagnostics = () => {
  if (diagnosticInterval) {
    clearInterval(diagnosticInterval);
    diagnosticInterval = null;
  }

  if (latencyTestInterval) {
    clearInterval(latencyTestInterval);
    latencyTestInterval = null;
  }

  // Remove event listeners
  socket.off('heartbeatAck', handleHeartbeatResponse);
  socket.off('disconnect', handleDisconnection);
  socket.off('connect', handleReconnection);

  hideConnectionStatus();

  // Reset stats
  connectionStats = {
    latency: [],
    packetLoss: 0,
    disconnections: 0,
    syncErrors: 0,
    lastPingTime: 0,
    isSlowConnection: false,
  };
};
