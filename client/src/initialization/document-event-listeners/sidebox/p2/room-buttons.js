/**
 * @file room-buttons.js
 * @description Comprehensive Room ID and Username Generation Utility with offline fallback
 */

// Import locations and trainers from separate files
import { POKEMON_LOCATIONS } from './pokemonLocations.js';
import { POKEMON_TRAINERS } from './pokemonTrainers.js';

// Try to import from front-end.js, but provide fallbacks if it fails
let frontEndSocket;
let frontEndSystemState;

try {
  // Import socket and system state from front-end.js
  const frontEnd = await import('../../../../front-end.js');
  frontEndSocket = frontEnd.socket;
  frontEndSystemState = frontEnd.systemState;
  console.info(
    'Successfully imported socket and systemState from front-end.js'
  );
} catch (error) {
  console.warn('Failed to import from front-end.js, using fallbacks:', error);

  // Fallback system state
  frontEndSystemState = {
    p2SelfUsername: '',
    roomId: '',
    isTwoPlayer: false,
    spectatorUsername: '',
    selfDeckData: null,
    p1OppDeckData: null,
    coachingMode: false,
    spectatorId: '',
  };

  // Fallback socket with graceful degradation
  frontEndSocket = {
    connected: false,
    id: Date.now().toString(),
    emit: (event, ...args) => {
      console.warn(`Socket event ${event} called with args:`, args);
      console.warn(
        'Socket not properly initialized - online features unavailable'
      );

      // Show a user-facing notification about connection issues
      showConnectionAlert(
        'Server connection unavailable. Please try again later.'
      );

      // If this is a join attempt, we can still proceed with offline functionality
      if (event === 'joinGame') {
        simulateOfflineJoin(args[0], args[1], args[2]);
      }
    },
  };
}

// Try to import other utilities with fallbacks
let reset,
  cleanActionData,
  processAction,
  handleSpectatorButtons,
  removeSyncIntervals;

try {
  reset = (await import('../../../../actions/general/reset.js')).reset;
  cleanActionData = (
    await import('../../../../setup/general/clean-action-data.js')
  ).cleanActionData;
  processAction = (await import('../../../../setup/general/process-action.js'))
    .processAction;
  handleSpectatorButtons = (
    await import('../../../../setup/spectator/handle-spectator-buttons.js')
  ).handleSpectatorButtons;
  removeSyncIntervals = (
    await import('../../../socket-event-listeners/socket-event-listeners.js')
  ).removeSyncIntervals;
} catch (error) {
  console.warn('Failed to import utilities, using fallbacks:', error);

  // Fallback functions that do nothing
  reset = (target, ...args) =>
    console.warn(`Reset called for ${target} but function not available`);
  cleanActionData = (target) =>
    console.warn(
      `Clean action data called for ${target} but function not available`
    );
  processAction = (target, ...args) =>
    console.warn(
      `Process action called for ${target} but function not available`
    );
  handleSpectatorButtons = () =>
    console.warn('Handle spectator buttons called but function not available');
  removeSyncIntervals = () =>
    console.warn('Remove sync intervals called but function not available');
}

// Track connection status
let isOnline = false;
let connectionAttempted = false;
let retryCount = 0;
const MAX_RETRIES = 3;

/**
 * Shows a connection alert to the user
 * @param {string} message - Alert message to display
 */
function showConnectionAlert(message) {
  // Check if an alert already exists
  let alertBox = document.getElementById('connection-alert');

  if (!alertBox) {
    // Create an alert box
    alertBox = document.createElement('div');
    alertBox.id = 'connection-alert';
    alertBox.style.cssText =
      'position: fixed; top: 10px; right: 10px; background: #ff9800; color: white; padding: 10px; border-radius: 4px; z-index: 1000; max-width: 300px;';
    document.body.appendChild(alertBox);

    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText =
      'float: right; cursor: pointer; font-weight: bold;';
    closeBtn.onclick = () => alertBox.remove();
    alertBox.appendChild(closeBtn);
  }

  // Set the message
  const messageElement = document.createElement('p');
  messageElement.style.margin = '0 0 0 20px';
  messageElement.textContent = message;

  // Clear previous message
  alertBox.innerHTML = '';
  alertBox.appendChild(messageElement);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (alertBox && alertBox.parentNode) {
      alertBox.remove();
    }
  }, 5000);
}

/**
 * Simulates offline join functionality
 * @param {string} roomId - Room ID
 * @param {string} username - Username
 * @param {boolean} isSpectator - Whether user is a spectator
 */
function simulateOfflineJoin(roomId, username, isSpectator) {
  showConnectionAlert('Using offline mode. Some features will be limited.');

  // Update UI to show "connected" state even though we're offline
  const connectedRoom = document.getElementById('connectedRoom');
  const lobby = document.getElementById('lobby');
  const p2ExplanationBox = document.getElementById('p2ExplanationBox');

  if (connectedRoom && lobby && p2ExplanationBox) {
    lobby.style.display = 'none';
    p2ExplanationBox.style.display = 'none';
    connectedRoom.style.display = 'block';

    // Update room ID display if it exists
    const roomIdDisplay = document.getElementById('roomIdDisplay');
    if (roomIdDisplay) {
      roomIdDisplay.textContent = roomId;
    }
  }
}

/**
 * Advanced Room ID Generation Utility
 * Provides sophisticated methods for generating unique identifiers
 */
class RoomIdGenerator {
  /**
   * Generate a cryptographically-inspired unique room ID
   * @returns {string} A unique room ID based on a Pokémon location
   */
  static generateRoomId() {
    try {
      // Ensure we have locations to choose from
      if (!POKEMON_LOCATIONS || POKEMON_LOCATIONS.length === 0) {
        throw new Error('No locations available for room ID generation');
      }

      // Select a random location with more randomness
      const randomLocation = this.getRandomItem(POKEMON_LOCATIONS);

      // Format the location name for URL-friendliness
      const formattedLocation = this.formatLocationName(randomLocation);

      // Generate a unique 4-digit suffix with enhanced randomness
      const uniqueSuffix = this.generateUniqueSuffix();

      return `${formattedLocation}-${uniqueSuffix}`;
    } catch (error) {
      console.error('Room ID Generation Error:', error);
      // Fallback generation method
      return `pokemon-room-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    }
  }

  /**
   * Format location name for maximum URL and display compatibility
   * @param {string} location - The original location name
   * @returns {string} Formatted location name
   */
  static formatLocationName(location) {
    return location
      .toLowerCase()
      .normalize('NFD') // Normalize unicode characters
      .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Generate a unique 4-digit numeric suffix with enhanced randomness
   * @returns {string} A random 4-digit number
   */
  static generateUniqueSuffix() {
    // Combine current timestamp, Math.random(), and performance now for better uniqueness
    const timestamp = Date.now() % 10000;
    const randomPart = Math.floor(Math.random() * 9000) + 1000;
    const performancePart =
      performance && typeof performance.now === 'function'
        ? Math.floor(performance.now() % 1000)
        : 0;

    return String((timestamp + randomPart + performancePart) % 10000).padStart(
      4,
      '0'
    );
  }

  /**
   * Cryptographically-inspired random item selection
   * @param {Array} array - The array to select from
   * @returns {*} A random item from the array
   */
  static getRandomItem(array) {
    // More random selection method
    const index =
      Math.floor(Math.random() * array.length * Math.random() * array.length) %
      array.length;
    return array[index];
  }

  /**
   * Select a random trainer name with additional randomization
   * @returns {string} A random trainer name
   */
  static getRandomTrainerName() {
    try {
      if (!POKEMON_TRAINERS || POKEMON_TRAINERS.length === 0) {
        throw new Error('No trainers available for name generation');
      }
      return this.getRandomItem(POKEMON_TRAINERS);
    } catch (error) {
      console.error('Trainer Name Generation Error:', error);
      // Fallback generic names
      const fallbackNames = [
        'Trainer',
        'Challenger',
        'Competitor',
        'Battler',
        'Champion',
        'Rookie',
        'Veteran',
        'Adventurer',
      ];
      return this.getRandomItem(fallbackNames);
    }
  }

  /**
   * Advanced clipboard copy with comprehensive error handling
   * @param {string} text - Text to copy
   * @param {HTMLElement} button - Button element for visual feedback
   */
  static copyToClipboard(text, button) {
    // Comprehensive clipboard copy with multiple fallback mechanisms
    const copyText = () => {
      try {
        // Primary method: Clipboard API
        return navigator.clipboard.writeText(text);
      } catch {
        // Fallback: Document method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();

        try {
          document.execCommand('copy');
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    };

    copyText()
      .then(() => this.addCopiedFeedback(button))
      .catch((err) => {
        console.error('Clipboard copy failed:', err);
        alert('Unable to copy text. Please copy manually.');
      });
  }

  /**
   * Add visual feedback for successful copy
   * @param {HTMLElement} button - Button element to add feedback to
   */
  static addCopiedFeedback(button) {
    button.classList.add('copied');
    setTimeout(() => {
      button.classList.remove('copied');
    }, 1000);
  }
}

/**
 * Initializes all room-related buttons and functionality
 */
export function initializeRoomButtons() {
  // DOM element references
  const roomIdInput = document.getElementById('roomIdInput');
  const nameInput = document.getElementById('nameInput');
  const copyButton = document.getElementById('copyButton');
  const roomHeaderCopyButton = document.getElementById('roomHeaderCopyButton');
  const generateIdButton = document.getElementById('generateIdButton');
  const joinRoomButton = document.getElementById('joinRoomButton');
  const leaveRoomButton = document.getElementById('leaveRoomButton');
  const spectatorModeCheckbox = document.getElementById(
    'spectatorModeCheckbox'
  );

  // Ensure room ID is always populated
  function ensureRoomId() {
    if (!roomIdInput.value.trim()) {
      roomIdInput.value = RoomIdGenerator.generateRoomId();
    }
    return roomIdInput.value;
  }

  // Room ID Generation Button
  generateIdButton.addEventListener('click', () => {
    // Check if socket is available and has an ID, otherwise generate a random ID
    if (frontEndSocket && frontEndSocket.id) {
      roomIdInput.value = frontEndSocket.id.toString() + '0';
    } else {
      roomIdInput.value = RoomIdGenerator.generateRoomId();
    }
  });

  // Ensure room ID is set on initial load and when input becomes empty
  roomIdInput.addEventListener('input', () => {
    if (!roomIdInput.value.trim()) {
      ensureRoomId();
    }
  });

  // Ensure room ID on initial page load
  ensureRoomId();

  // Copy Room ID Buttons
  copyButton.addEventListener('click', () => {
    RoomIdGenerator.copyToClipboard(roomIdInput.value, copyButton);
  });

  roomHeaderCopyButton.addEventListener('click', () => {
    RoomIdGenerator.copyToClipboard(roomIdInput.value, roomHeaderCopyButton);
  });

  // Join Room Button
  joinRoomButton.addEventListener('click', () => {
    // Check if socket is connected
    if (!frontEndSocket || !frontEndSocket.connected) {
      console.error('Socket not properly initialized or not connected');

      if (!connectionAttempted && retryCount < MAX_RETRIES) {
        retryCount++;
        showConnectionAlert(
          `Trying to establish connection (attempt ${retryCount}/${MAX_RETRIES})...`
        );
        // Try to reconnect (implementation would depend on your socket.io setup)
        setTimeout(() => {
          joinRoomButton.click();
        }, 1000);
        return;
      }

      // After all retries, offer offline mode
      if (
        window.confirm(
          'Server connection unavailable. Would you like to use offline mode? (Some features will be limited)'
        )
      ) {
        const roomId = ensureRoomId();
        const username =
          nameInput.value.trim() !== ''
            ? nameInput.value
            : RoomIdGenerator.getRandomTrainerName();

        frontEndSystemState.p2SelfUsername = username;
        frontEndSystemState.roomId = roomId;

        simulateOfflineJoin(roomId, username, spectatorModeCheckbox.checked);
      }
      return;
    }

    // Ensure room ID is set
    const roomId = ensureRoomId();

    // Determine username (use input or generate random)
    const username =
      nameInput.value.trim() !== ''
        ? nameInput.value
        : RoomIdGenerator.getRandomTrainerName();

    // Update system state
    frontEndSystemState.p2SelfUsername = username;
    frontEndSystemState.roomId = roomId;

    try {
      // Join the game
      frontEndSocket.emit(
        'joinGame',
        frontEndSystemState.roomId,
        frontEndSystemState.p2SelfUsername,
        spectatorModeCheckbox.checked
      );
      console.log(
        `Join game event emitted for room: ${frontEndSystemState.roomId}, username: ${frontEndSystemState.p2SelfUsername}`
      );
    } catch (error) {
      console.error('Error joining room:', error);
      showConnectionAlert('Failed to join room. Switching to offline mode.');
      simulateOfflineJoin(roomId, username, spectatorModeCheckbox.checked);
    }
  });

  // Leave Room Button
  leaveRoomButton.addEventListener('click', () => {
    if (
      window.confirm(
        'Are you sure you want to leave the room? Current game state will be lost.'
      )
    ) {
      // Even if socket is offline, we should still reset the UI
      try {
        if (frontEndSocket && frontEndSocket.connected) {
          const isSpectator =
            frontEndSystemState.isTwoPlayer && spectatorModeCheckbox.checked;
          const username = isSpectator
            ? frontEndSystemState.spectatorUsername
            : frontEndSystemState.p2SelfUsername;

          const data = {
            roomId: frontEndSystemState.roomId,
            username: username,
            isSpectator:
              spectatorModeCheckbox.checked && frontEndSystemState.isTwoPlayer,
          };

          frontEndSocket.emit('leaveRoom', data);
        }
      } catch (error) {
        console.error('Error with leave room socket event:', error);
      } finally {
        // Always reset UI regardless of socket connection
        resetUIState();
      }
    }
  });

  // Helper function to reset UI state - from original code
  function resetUIState() {
    const connectedRoom = document.getElementById('connectedRoom');
    const lobby = document.getElementById('lobby');
    const p2ExplanationBox = document.getElementById('p2ExplanationBox');
    const p2Chatbox = document.getElementById('p2Chatbox');

    if (!connectedRoom || !lobby || !p2ExplanationBox) {
      console.error('Required DOM elements not found for UI reset');
      return;
    }

    lobby.style.display = 'block';
    p2ExplanationBox.style.display = 'block';

    const importState = document.getElementById('importState');
    if (importState) {
      importState.style.display = 'inline';
    }

    const flipBoardButton = document.getElementById('flipBoardButton');
    if (flipBoardButton) {
      flipBoardButton.style.display = 'inline-block';
    }

    connectedRoom.style.display = 'none';

    frontEndSystemState.isTwoPlayer = false;
    frontEndSystemState.roomId = '';

    try {
      cleanActionData('self');
      cleanActionData('opp');
      reset('opp', true, true, false, true);

      // repopulate self deck with the correct current decklist
      frontEndSystemState.selfDeckData = '';
      let decklistTable = document.getElementById('selfCurrentDecklistTable');
      if (decklistTable) {
        let rows = decklistTable.rows;
        let deckData = [];
        for (let i = 1; i < rows.length; i++) {
          let cells = rows[i].cells;

          let quantity = cells[0].innerText;
          let name = cells[1].innerText;
          let type = cells[2].querySelector('select').value;
          let url = cells[3].innerText;

          let cardData = [quantity, name, type, url];
          deckData.push(cardData);
        }
        if (deckData.length > 0) {
          frontEndSystemState.selfDeckData = deckData;
        }
      }

      reset('self', true, true, false, true);

      if (p2Chatbox) {
        p2Chatbox.innerHTML = '';
      }

      frontEndSystemState.coachingMode = false;
      handleSpectatorButtons();
      removeSyncIntervals();
      frontEndSystemState.spectatorId = '';

      // add the deck data back to the actiondata list
      if (frontEndSystemState.selfDeckData) {
        processAction('self', true, 'loadDeckData', [
          frontEndSystemState.selfDeckData,
        ]);
      }
      if (frontEndSystemState.p1OppDeckData) {
        processAction('opp', true, 'loadDeckData', [
          frontEndSystemState.p1OppDeckData,
        ]);
      }
    } catch (error) {
      console.error('Error during UI reset:', error);
    }
  }

  // Function to check socket status periodically and update UI
  function setupSocketStatusCheck() {
    const checkInterval = setInterval(() => {
      const connectionStatus = frontEndSocket && frontEndSocket.connected;

      // Update button state based on connection
      if (joinRoomButton) {
        if (connectionStatus) {
          joinRoomButton.disabled = false;
          joinRoomButton.title = 'Join room';

          // If we've regained connection after being offline
          if (!isOnline) {
            isOnline = true;
            showConnectionAlert(
              'Connection established. Online features available.'
            );
          }
        } else {
          joinRoomButton.title =
            'Connection to server not established (click for offline mode)';

          // Only show alert when transitioning from online to offline
          if (isOnline) {
            isOnline = false;
            showConnectionAlert(
              'Connection lost. Limited functionality available.'
            );
          }
        }
      }

      connectionAttempted = true;
    }, 1000);

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(checkInterval);
    });
  }

  // Initialize socket status check
  setupSocketStatusCheck();
}

// Runtime validation and logging
if (typeof window !== 'undefined') {
  console.info(
    `[Pokemon TCG Room System] Location count: ${POKEMON_LOCATIONS?.length || 0}`
  );
  console.info(
    `[Pokemon TCG Room System] Trainer count: ${POKEMON_TRAINERS?.length || 0}`
  );
}

// Export utilities for potential external use
export { RoomIdGenerator };
