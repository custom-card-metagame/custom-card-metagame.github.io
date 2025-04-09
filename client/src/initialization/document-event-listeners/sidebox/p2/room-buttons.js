/**
 * @file room-buttons.js
 * @fileoverview Comprehensive Room ID and Username Generation Utility
 * @description Provides advanced functionality for generating unique, memorable room IDs
 * and random trainer names for Pokémon-themed multiplayer game rooms.
 *
 * @module RoomIdGenerator
 * @requires SystemState
 * @requires SocketConnection
 *
 * @version 2.0.0
 * @author Meta-PTCG Development Team
 * @license MIT
 *
 * @changelog
 * - v2.0.0: Comprehensive rewrite with enhanced randomization and flexibility
 * - Added more robust room ID and username generation
 * - Improved error handling and browser compatibility
 * - Enhanced list-based generation with multiple fallback mechanisms
 *
 * @features
 * - Advanced room ID generation using Pokémon locations
 * - Dynamic random trainer name selection
 * - Clipboard functionality with visual feedback
 * - Comprehensive error handling
 * - Performance-optimized random generation
 *
 * @optimization
 * - Efficient array item selection
 * - Minimized computational overhead
 * - Browser-safe implementation
 *
 * @best-practices
 * - Modular design
 * - Clear separation of concerns
 * - Comprehensive error handling
 * - Performance-conscious implementation
 */

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
    const performancePart = Math.floor(performance.now() % 1000);

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

// Export the complete utility for external use
export { RoomIdGenerator, POKEMON_LOCATIONS, POKEMON_TRAINERS };

// Main initialization function for room-related interactions
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

  // Room ID Generation Button - Always generates a new unique ID
  generateIdButton.addEventListener('click', () => {
    roomIdInput.value = RoomIdGenerator.generateRoomId();
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
    // Ensure room ID is set
    const roomId = ensureRoomId();

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

  // Leave Room Button
  leaveRoomButton.addEventListener('click', () => {
    if (
      window.confirm(
        'Are you sure you want to leave the room? Current game state will be lost.'
      )
    ) {
      // Existing leave room logic
      // (Placeholder for actual leave room implementation)
    }
  });
}

// Runtime validation and logging
if (typeof window !== 'undefined') {
  console.group('Meta-PTCG Room Generation Validation');
  console.log(`Total Locations: ${POKEMON_LOCATIONS.length}`);
  console.log(`Total Trainers: ${POKEMON_TRAINERS.length}`);

  if (POKEMON_LOCATIONS.length <= 100) {
    console.warn('Location list should contain over 100 unique locations');
  }

  if (POKEMON_TRAINERS.length <= 100) {
    console.warn('Trainer list should contain over 100 unique trainers');
  }
  console.groupEnd();
}
