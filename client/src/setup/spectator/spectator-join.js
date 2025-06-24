import { reset } from '../../actions/general/reset.js';
import { socket, systemState } from '../../front-end.js';
import { appendMessage } from '../chatbox/append-message.js';
import { acceptAction } from '../general/accept-action.js';
import { cleanActionData } from '../general/clean-action-data.js';
import { handleSpectatorButtons } from './handle-spectator-buttons.js';

let socketId = '';
let spectatorTimerId;

export const spectatorJoin = () => {
  const connectedRoom = document.getElementById('connectedRoom');
  const lobby = document.getElementById('lobby');
  const roomHeaderText = document.getElementById('roomHeaderText');
  const chatbox = document.getElementById('chatbox');
  const p2ExplanationBox = document.getElementById('p2ExplanationBox');
  document.getElementById('importState').style.display = 'none';
  roomHeaderText.textContent = 'id: ' + systemState.roomId;
  chatbox.innerHTML = '';
  connectedRoom.style.display = 'flex';
  lobby.style.display = 'none';
  p2ExplanationBox.style.display = 'none';
  systemState.isTwoPlayer = true;
  cleanActionData('self');
  cleanActionData('opp');
  reset('self', true, false, false, false);
  reset('opp', true, false, false, false);

  handleSpectatorButtons();

  systemState.spectatorUsername = systemState.p2SelfUsername;

  appendMessage(
    '',
    systemState.spectatorUsername + ' joined',
    'announcement',
    true
  );

  socketId = '';
  systemState.spectatorCounter = 0;
};

socket.on('spectatorActionData', (data) => {
  const isSpectator =
    document.getElementById('spectatorModeCheckbox').checked &&
    systemState.isTwoPlayer;

  if (!isSpectator) return; // Early exit if not spectator

  // Prevent processing if data is invalid or incomplete
  if (
    !data ||
    !data.spectatorActionData ||
    !Array.isArray(data.spectatorActionData)
  ) {
    return;
  }

  // Initialize spectator if first time
  if (socketId === '') {
    appendMessage('', 'Loading spectator view...', 'loading-spectator', false);
    socketId = data.socketId;
    systemState.spectatorCounter = 0;
    console.log('Spectator: Starting to receive data from socket:', socketId);
  }

  // Only process data from the same socket to prevent conflicts
  if (socketId !== data.socketId) {
    return;
  }

  systemState.spectatorId = socketId;

  // Reset timeout
  if (spectatorTimerId) {
    clearTimeout(spectatorTimerId);
  }
  spectatorTimerId = setTimeout(() => {
    socketId = '';
    systemState.spectatorCounter = 0;
  }, 10000); // Increased timeout to 10 seconds

  // Update user data
  systemState.p2SelfUsername = data.selfUsername;
  systemState.selfDeckData = data.selfDeckData;
  systemState.p2OppUsername = data.oppUsername;
  systemState.p2OppDeckData = data.oppDeckData;

  const actionData = data.spectatorActionData;

  // Prevent processing too many actions at once (memory protection)
  if (actionData.length > systemState.spectatorCounter + 50) {
    console.warn(
      'Spectator: Too many actions, resetting to prevent memory issues'
    );
    systemState.spectatorCounter = Math.max(0, actionData.length - 20); // Only process last 20 actions
  }

  if (actionData.length > systemState.spectatorCounter) {
    const missingActions = actionData.slice(systemState.spectatorCounter);

    // Limit processing to prevent memory overload
    const actionsToProcess = missingActions.slice(0, 10); // Process max 10 actions at a time

    console.log(
      `Spectator: Processing ${actionsToProcess.length} new actions (${missingActions.length} total pending)`
    );

    // Process actions with throttling
    actionsToProcess.forEach((actionInfo, index) => {
      try {
        // Skip problematic actions that might cause infinite loops
        if (
          actionInfo.action === 'spectatorActionData' ||
          actionInfo.action === 'userReconnected' ||
          actionInfo.action === 'userDisconnected'
        ) {
          return;
        }

        acceptAction(actionInfo.user, actionInfo.action, actionInfo.parameters);
      } catch (error) {
        console.warn(`Spectator: Failed to apply action ${index}:`, error);
      }
    });

    // Update counter incrementally to prevent jumping ahead
    systemState.spectatorCounter += actionsToProcess.length;
  }
});
