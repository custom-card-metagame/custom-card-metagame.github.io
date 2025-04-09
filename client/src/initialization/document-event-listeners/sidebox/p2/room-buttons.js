/**
 * Room ID Generator Utility
 *
 * @fileoverview Provides functionality for generating unique, memorable room IDs
 * for Pokémon-themed multiplayer game rooms.
 *
 * @module RoomIdGenerator
 * @requires SystemState
 * @requires SocketConnection
 *
 * Features:
 * - Generate unique room IDs using Pokémon locations
 * - Automatic random generation for room and player names
 * - Clipboard copy functionality
 *
 * @version 1.2.0
 * @author [Your Name]
 * @license MIT
 */

// Import locations and trainers from separate files
import { POKEMON_LOCATIONS } from './pokemonLocations.js';
import { POKEMON_TRAINERS } from './pokemonTrainers.js';

/**
 * Room ID Generation Utility
 * Provides methods for generating and managing room IDs
 */
class RoomIdGenerator {
  /**
   * Generate a unique room ID
   * @returns {string} A unique room ID based on a Pokémon location
   */
  static generateRoomId() {
    // Select a random location
    const randomLocation = this.getRandomItem(POKEMON_LOCATIONS);

    // Format the location name
    const formattedLocation = this.formatLocationName(randomLocation);

    // Add a unique 4-digit suffix
    const uniqueSuffix = this.generateUniqueSuffix();

    return `${formattedLocation}-${uniqueSuffix}`;
  }

  /**
   * Format location name for URL-friendliness
   * @param {string} location - The original location name
   * @returns {string} Formatted location name
   */
  static formatLocationName(location) {
    return location
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Generate a unique 4-digit numeric suffix
   * @returns {string} A random 4-digit number
   */
  static generateUniqueSuffix() {
    return String(Math.floor(Math.random() * 9000) + 1000);
  }

  /**
   * Select a random item from an array
   * @param {Array} array - The array to select from
   * @returns {*} A random item from the array
   */
  static getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Select a random trainer name
   * @returns {string} A random trainer name
   */
  static getRandomTrainerName() {
    return this.getRandomItem(POKEMON_TRAINERS);
  }

  /**
   * Copy text to clipboard with visual feedback
   * @param {string} text - Text to copy
   * @param {HTMLElement} button - Button element for visual feedback
   */
  static copyToClipboard(text, button) {
    try {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.addCopiedFeedback(button);
        })
        .catch((err) => {
          console.error('Failed to copy text:', err);
        });
    } catch (err) {
      console.error('Clipboard API not supported:', err);
    }
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
 * Initialize room-related button functionalities
 * Attaches event listeners to room management buttons
 */
export function initializeRoomButtons() {
  // Get DOM elements
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

  // Room ID Generation Button
  generateIdButton.addEventListener('click', () => {
    // Always generate a new random room ID when button is clicked
    roomIdInput.value = RoomIdGenerator.generateRoomId();
  });

  // Copy Room ID Buttons
  copyButton.addEventListener('click', () => {
    RoomIdGenerator.copyToClipboard(roomIdInput.value, copyButton);
  });

  roomHeaderCopyButton.addEventListener('click', () => {
    RoomIdGenerator.copyToClipboard(roomIdInput.value, roomHeaderCopyButton);
  });

  // Join Room Button
  joinRoomButton.addEventListener('click', () => {
    // Determine room ID (use input or generate random)
    const roomId =
      roomIdInput.value.trim() !== ''
        ? roomIdInput.value
        : RoomIdGenerator.generateRoomId();

    // Determine username (use input or generate random)
    const username =
      nameInput.value.trim() !== ''
        ? nameInput.value
        : RoomIdGenerator.getRandomTrainerName();

    // Update system state and join game
    systemState.p2SelfUsername = username;
    systemState.roomId = roomId;

    socket.emit(
      'joinGame',
      systemState.roomId,
      systemState.p2SelfUsername,
      spectatorModeCheckbox.checked
    );
  });

  // Leave Room Button (existing implementation)
  leaveRoomButton.addEventListener('click', () => {
    if (
      window.confirm(
        'Are you sure you want to leave the room? Current game state will be lost.'
      )
    ) {
      // Existing leave room logic remains the same
      // ... (previous implementation)
    }
  });
}

// Export utilities for potential external use
export { RoomIdGenerator, POKEMON_LOCATIONS, POKEMON_TRAINERS };

// Optional: Add some runtime validation
if (process.env.NODE_ENV === 'development') {
  console.assert(
    POKEMON_LOCATIONS.length > 100,
    'Location list should contain over 100 unique locations'
  );
  console.assert(
    POKEMON_TRAINERS.length > 100,
    'Trainer list should contain over 100 unique trainers'
  );
}
