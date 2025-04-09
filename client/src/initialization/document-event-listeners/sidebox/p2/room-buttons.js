/**
 * @file room-buttons.js
 * @description Comprehensive Room ID and Username Generation Utility
 */

// Import socket and system state from front-end.js
import {
  socket as frontEndSocket,
  systemState as frontEndSystemState,
} from '../../../../front-end.js';

// Import reset and other utilities
import { reset } from '../../../../actions/general/reset.js';
import { cleanActionData } from '../../../../setup/general/clean-action-data.js';
import { processAction } from '../../../../setup/general/process-action.js';
import { handleSpectatorButtons } from '../../../../setup/spectator/handle-spectator-buttons.js';
import { removeSyncIntervals } from '../../../socket-event-listeners/socket-event-listeners.js';

// Import locations and trainers from separate files
import { POKEMON_LOCATIONS } from './pokemonLocations.js';
import { POKEMON_TRAINERS } from './pokemonTrainers.js';

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
      alert(
        'Connection to server not established. Please try again in a moment.'
      );
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
      alert('Failed to join room. Please try again.');
    }
  });

  // Leave Room Button
  leaveRoomButton.addEventListener('click', () => {
    if (
      window.confirm(
        'Are you sure you want to leave the room? Current game state will be lost.'
      )
    ) {
      // Check if socket is initialized before trying to leave
      if (!frontEndSocket || !frontEndSocket.connected) {
        console.error('Socket not properly initialized or not connected');
        // Still allow the UI to reset even if socket is not connected
        resetUIState();
        return;
      }

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

      try {
        frontEndSocket.emit('leaveRoom', data);
        resetUIState();
      } catch (error) {
        console.error('Error leaving room:', error);
        // Still reset UI even if socket error occurs
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

    lobby.style.display = 'block';
    p2ExplanationBox.style.display = 'block';
    document.getElementById('importState').style.display = 'inline';
    document.getElementById('flipBoardButton').style.display = 'inline-block';
    connectedRoom.style.display = 'none';

    frontEndSystemState.isTwoPlayer = false;
    frontEndSystemState.roomId = '';

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
    p2Chatbox.innerHTML = '';
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
  }

  // Function to check socket status periodically and update UI
  function setupSocketStatusCheck() {
    const checkInterval = setInterval(() => {
      if (frontEndSocket && frontEndSocket.connected) {
        joinRoomButton.disabled = false;
        joinRoomButton.title = 'Join room';
      } else {
        joinRoomButton.disabled = true;
        joinRoomButton.title = 'Waiting for connection to server...';
      }
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
