/**
 * @file room-buttons.js
 * @description Room ID and username generation functionality with Pokemon locations and trainers
 * @version 1.1.0
 * @updates Added Pokemon-themed location-based room IDs and trainer usernames
 */

import { reset } from '../../../../actions/general/reset.js';
import { socket, systemState } from '../../../../front-end.js';
import { cleanActionData } from '../../../../setup/general/clean-action-data.js';
import { processAction } from '../../../../setup/general/process-action.js';
import { handleSpectatorButtons } from '../../../../setup/spectator/handle-spectator-buttons.js';
import { removeSyncIntervals } from '../../../socket-event-listeners/socket-event-listeners.js';

// Import Pokemon locations and trainers for enhanced room/username generation
import { POKEMON_LOCATIONS } from './pokemonLocations.js';
import { POKEMON_TRAINERS } from './pokemonTrainers.js';

/**
 * Generates a Pokemon-themed room ID using a random location and numbers
 * @returns {string} A room ID in the format "location-####"
 */
function generatePokemonRoomId() {
  // Select random location
  const randomIndex = Math.floor(Math.random() * POKEMON_LOCATIONS.length);
  const location = POKEMON_LOCATIONS[randomIndex];

  // Format location for URL (lowercase, hyphens instead of spaces, no special chars)
  const formattedLocation = location
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen

  // Generate random 4-digit number
  const randomNumbers = Math.floor(1000 + Math.random() * 9000);

  return `${formattedLocation}-${randomNumbers}`;
}

/**
 * Selects a random Pokemon trainer name
 * @returns {string} A random trainer name
 */
function getRandomTrainerName() {
  const randomIndex = Math.floor(Math.random() * POKEMON_TRAINERS.length);
  return POKEMON_TRAINERS[randomIndex];
}

export const initializeRoomButtons = () => {
  const roomIdInput = document.getElementById('roomIdInput');

  // Set initial random room ID if the field is empty
  if (!roomIdInput.value) {
    roomIdInput.value = generatePokemonRoomId();
  }

  const copyButton = document.getElementById('copyButton');
  copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(roomIdInput.value);

    copyButton.classList.add('copied');
    setTimeout(() => {
      copyButton.classList.remove('copied');
    }, 1000);
  });

  const roomHeaderCopyButton = document.getElementById('roomHeaderCopyButton');
  roomHeaderCopyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(roomIdInput.value).then(() => {
      roomHeaderCopyButton.classList.add('copied');
      setTimeout(() => {
        roomHeaderCopyButton.classList.remove('copied');
      }, 1000);
    });
  });

  const generateIdButton = document.getElementById('generateIdButton');
  generateIdButton.addEventListener('click', () => {
    // Use socket-based ID if available, otherwise use Pokemon-themed room ID
    if (socket && socket.id) {
      roomIdInput.value = generatePokemonRoomId();
    } else {
      roomIdInput.value = generatePokemonRoomId();
    }
  });

  // Ensure room always has a value, regenerate if emptied
  roomIdInput.addEventListener('blur', () => {
    if (!roomIdInput.value.trim()) {
      roomIdInput.value = generatePokemonRoomId();
    }
  });

  const joinRoomButton = document.getElementById('joinRoomButton');
  joinRoomButton.addEventListener('click', () => {
    const nameInput = document.getElementById('nameInput');

    // Use entered name or get random Pokemon trainer name
    systemState.p2SelfUsername =
      nameInput.value.trim() !== '' ? nameInput.value : getRandomTrainerName();

    // Ensure room ID is set
    if (!roomIdInput.value.trim()) {
      roomIdInput.value = generatePokemonRoomId();
    }

    systemState.roomId = roomIdInput.value;

    // Emit join game event
    try {
      socket.emit(
        'joinGame',
        systemState.roomId,
        systemState.p2SelfUsername,
        document.getElementById('spectatorModeCheckbox').checked
      );
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Unable to join game. Please check your connection and try again.');
    }
  });

  const leaveRoomButton = document.getElementById('leaveRoomButton');
  leaveRoomButton.addEventListener('click', () => {
    if (
      window.confirm(
        'Are you sure you want to leave the room? Current game state will be lost.'
      )
    ) {
      const isSpectator =
        systemState.isTwoPlayer &&
        document.getElementById('spectatorModeCheckbox').checked;
      const username = isSpectator
        ? systemState.spectatorUsername
        : systemState.p2SelfUsername;
      const data = {
        roomId: systemState.roomId,
        username: username,
        isSpectator:
          document.getElementById('spectatorModeCheckbox').checked &&
          systemState.isTwoPlayer,
      };

      try {
        socket.emit('leaveRoom', data);
      } catch (error) {
        console.error('Error leaving room:', error);
      }

      // Continue with UI cleanup regardless of socket success
      const connectedRoom = document.getElementById('connectedRoom');
      const lobby = document.getElementById('lobby');
      const p2ExplanationBox = document.getElementById('p2ExplanationBox');
      const p2Chatbox = document.getElementById('p2Chatbox');
      lobby.style.display = 'block';
      p2ExplanationBox.style.display = 'block';
      document.getElementById('importState').style.display = 'inline';
      document.getElementById('flipBoardButton').style.display = 'inline-block';
      connectedRoom.style.display = 'none';
      systemState.isTwoPlayer = false;
      systemState.roomId = '';
      cleanActionData('self');
      cleanActionData('opp');
      reset('opp', true, true, false, true);

      // repopulate self deck with the correct current decklist
      systemState.selfDeckData = '';
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
          systemState.selfDeckData = deckData;
        }
      }

      reset('self', true, true, false, true);
      p2Chatbox.innerHTML = '';
      systemState.coachingMode = false;
      handleSpectatorButtons();
      removeSyncIntervals();
      systemState.spectatorId = '';

      // add the deck data back to the actiondata list
      if (systemState.selfDeckData) {
        processAction('self', true, 'loadDeckData', [systemState.selfDeckData]);
      }
      if (systemState.p1OppDeckData) {
        processAction('opp', true, 'loadDeckData', [systemState.p1OppDeckData]);
      }
    }
  });
};
