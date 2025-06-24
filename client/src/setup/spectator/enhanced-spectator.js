import { socket, systemState } from '../../front-end.js';
import { appendMessage } from '../chatbox/append-message.js';
import { acceptAction } from '../general/accept-action.js';
import { cleanActionData } from '../general/clean-action-data.js';
import { reset } from '../../actions/general/reset.js';

let heartbeatInterval;
let stateRecoveryTimeout;
let lastStateVersion = 0;
let spectatorRecoveryAttempts = 0;
const MAX_RECOVERY_ATTEMPTS = 3;

export const initializeEnhancedSpectator = () => {
  // Start heartbeat monitoring
  startHeartbeat();

  // Enhanced spectator event listeners
  socket.on('fullGameState', handleFullGameState);
  socket.on('gameStateUpdate', handleGameStateUpdate);
  socket.on('connectionStale', handleConnectionStale);
  socket.on('heartbeatAck', handleHeartbeatAck);
};

const startHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  heartbeatInterval = setInterval(() => {
    if (systemState.isTwoPlayer && systemState.roomId) {
      socket.emit('heartbeat', {
        roomId: systemState.roomId,
        timestamp: Date.now(),
      });
    }
  }, 5000); // Send heartbeat every 5 seconds
};

const handleHeartbeatAck = (data) => {
  // Calculate latency and handle connection quality
  const latency = Date.now() - data.timestamp;

  if (latency > 2000) {
    // High latency detected
    appendMessage(
      '',
      'Connection quality degraded - attempting recovery...',
      'system',
      false
    );
    requestStateRecovery();
  }
};

const handleConnectionStale = (data) => {
  if (data.socketId === socket.id) {
    appendMessage(
      '',
      'Connection issue detected - recovering state...',
      'system',
      false
    );
    requestStateRecovery();
  }
};

const requestStateRecovery = () => {
  if (spectatorRecoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
    appendMessage(
      '',
      'Multiple connection issues detected. Please refresh the page.',
      'error',
      false
    );
    return;
  }

  spectatorRecoveryAttempts++;

  // Clear existing recovery timeout
  if (stateRecoveryTimeout) {
    clearTimeout(stateRecoveryTimeout);
  }

  // Request full state from server
  socket.emit('requestFullState', {
    roomId: systemState.roomId,
  });

  // Set timeout for recovery attempt
  stateRecoveryTimeout = setTimeout(() => {
    if (spectatorRecoveryAttempts < MAX_RECOVERY_ATTEMPTS) {
      appendMessage(
        '',
        'Recovery attempt failed, retrying...',
        'system',
        false
      );
      requestStateRecovery();
    }
  }, 10000);
};

const handleFullGameState = (data) => {
  try {
    // Clear recovery timeout on successful state reception
    if (stateRecoveryTimeout) {
      clearTimeout(stateRecoveryTimeout);
      stateRecoveryTimeout = null;
    }

    spectatorRecoveryAttempts = 0; // Reset recovery attempts

    if (data.isInitialLoad) {
      appendMessage(
        '',
        'Loading complete game state...',
        'loading-spectator',
        false
      );
    } else if (data.isRecovery) {
      appendMessage('', 'Connection recovered successfully!', 'system', false);
    }

    // Update system state
    if (data.selfUsername) systemState.p2SelfUsername = data.selfUsername;
    if (data.selfDeckData) systemState.selfDeckData = data.selfDeckData;
    if (data.oppUsername) systemState.p2OppUsername = data.oppUsername;
    if (data.oppDeckData) systemState.p2OppDeckData = data.oppDeckData;
    if (data.socketId) systemState.spectatorId = data.socketId;

    // Process all actions to rebuild game state
    if (data.spectatorActionData && Array.isArray(data.spectatorActionData)) {
      // Reset state before applying actions
      cleanActionData('self');
      cleanActionData('opp');
      reset('self', true, false, false, false);
      reset('opp', true, false, false, false);

      // Apply all actions in sequence
      data.spectatorActionData.forEach((actionData, index) => {
        try {
          acceptAction(
            actionData.user,
            actionData.action,
            actionData.parameters
          );
        } catch (error) {
          console.warn(`Failed to apply action ${index}:`, error);
        }
      });

      systemState.spectatorCounter = data.spectatorActionData.length;
      lastStateVersion = data.version || 0;
    }

    if (data.isInitialLoad) {
      appendMessage('', 'Spectator view loaded successfully!', 'system', false);
    }
  } catch (error) {
    console.error('Error handling full game state:', error);
    appendMessage(
      '',
      'Error loading game state. Please refresh the page.',
      'error',
      false
    );
  }
};

const handleGameStateUpdate = (data) => {
  // Only process if this is a newer version
  if (data.version && data.version > lastStateVersion) {
    lastStateVersion = data.version;

    // Process incremental state update
    if (data.state && data.state.spectatorActionData) {
      const newActions = data.state.spectatorActionData.slice(
        systemState.spectatorCounter
      );

      newActions.forEach((actionData) => {
        try {
          acceptAction(
            actionData.user,
            actionData.action,
            actionData.parameters
          );
        } catch (error) {
          console.warn('Failed to apply incremental action:', error);
        }
      });

      systemState.spectatorCounter = data.state.spectatorActionData.length;
    }
  }
};

export const cleanupEnhancedSpectator = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  if (stateRecoveryTimeout) {
    clearTimeout(stateRecoveryTimeout);
    stateRecoveryTimeout = null;
  }

  // Remove event listeners
  socket.off('fullGameState', handleFullGameState);
  socket.off('gameStateUpdate', handleGameStateUpdate);
  socket.off('connectionStale', handleConnectionStale);
  socket.off('heartbeatAck', handleHeartbeatAck);

  spectatorRecoveryAttempts = 0;
  lastStateVersion = 0;
};

// Enhanced state transmission for players
export const transmitGameState = () => {
  if (systemState.isTwoPlayer && systemState.roomId) {
    const gameState = {
      selfUsername: systemState.p2SelfUsername,
      selfDeckData: systemState.selfDeckData,
      oppDeckData: systemState.p2OppDeckData,
      oppUsername: systemState.p2OppUsername,
      spectatorActionData: systemState.exportActionData,
      socketId: socket.id,
      timestamp: Date.now(),
    };

    socket.emit('updateGameState', {
      roomId: systemState.roomId,
      state: gameState,
    });
  }
};
