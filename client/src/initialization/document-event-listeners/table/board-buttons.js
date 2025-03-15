import { VSTARGXFunction } from '../../../actions/general/VSTAR-GX.js';
import { flipBoard } from '../../../actions/general/flip-board.js';
import { flipCoin } from '../../../actions/general/flip-coin.js';
import { takeTurn } from '../../../actions/general/take-turn.js';
import {
  oppContainerDocument,
  selfContainerDocument,
  systemState,
} from '../../../front-end.js';
import { refreshBoardImages } from '../../../setup/sizing/refresh-board.js';

export const initializeBoardButtons = () => {
  const turnButton = document.getElementById('turnButton');
  // Add null check for turn button
  if (turnButton) {
    turnButton.addEventListener('click', () =>
      takeTurn(systemState.initiator, systemState.initiator)
    );
  } else {
    console.warn('Turn Button not found');
  }

  const flipCoinButton = document.getElementById('flipCoinButton');
  // Add null check for flip coin button
  if (flipCoinButton) {
    flipCoinButton.addEventListener('click', () =>
      flipCoin(systemState.initiator)
    );
  } else {
    console.warn('Flip Coin Button not found');
  }

  const flipBoardButton = document.getElementById('flipBoardButton');
  // Add null check for flip board button
  if (flipBoardButton) {
    flipBoardButton.addEventListener('click', flipBoard);
  } else {
    console.warn('Flip Board Button not found');
  }

  const refreshButton = document.getElementById('refreshButton');
  // Add null check for refresh button
  if (refreshButton) {
    refreshButton.addEventListener('click', refreshBoardImages);
  } else {
    console.warn('Refresh Button not found');
  }

  const selfVSTARButton = selfContainerDocument.getElementById('VSTARButton');
  // Add null check for self VSTAR button
  if (selfVSTARButton) {
    selfVSTARButton.addEventListener('click', () => {
      // Prevent VSTAR action in spectator mode or replay
      if (
        !(
          systemState.isTwoPlayer &&
          document.getElementById('spectatorModeCheckbox').checked
        ) &&
        !systemState.isReplay
      ) {
        VSTARGXFunction('self', 'VSTAR');
      }
    });
  } else {
    console.warn('Self VSTAR Button not found');
  }

  const selfGXButton = selfContainerDocument.getElementById('GXButton');
  // Add null check for self GX button
  if (selfGXButton) {
    selfGXButton.addEventListener('click', () => {
      // Prevent GX action in spectator mode or replay
      if (
        !(
          systemState.isTwoPlayer &&
          document.getElementById('spectatorModeCheckbox').checked
        ) &&
        !systemState.isReplay
      ) {
        VSTARGXFunction('self', 'GX');
      }
    });
  } else {
    console.warn('Self GX Button not found');
  }

  const oppVSTARButton = oppContainerDocument.getElementById('VSTARButton');
  // Add null check for opponent VSTAR button
  if (oppVSTARButton) {
    oppVSTARButton.addEventListener('click', () => {
      // Prevent VSTAR action in spectator mode or replay
      if (
        !(
          systemState.isTwoPlayer &&
          document.getElementById('spectatorModeCheckbox').checked
        ) &&
        !systemState.isReplay
      ) {
        VSTARGXFunction('opp', 'VSTAR');
      }
    });
  } else {
    console.warn('Opponent VSTAR Button not found');
  }

  const oppGXButton = oppContainerDocument.getElementById('GXButton');
  // Add null check for opponent GX button
  if (oppGXButton) {
    oppGXButton.addEventListener('click', () => {
      // Prevent GX action in spectator mode or replay
      if (
        !(
          systemState.isTwoPlayer &&
          document.getElementById('spectatorModeCheckbox').checked
        ) &&
        !systemState.isReplay
      ) {
        VSTARGXFunction('opp', 'GX');
      }
    });
  } else {
    console.warn('Opponent GX Button not found');
  }
};

