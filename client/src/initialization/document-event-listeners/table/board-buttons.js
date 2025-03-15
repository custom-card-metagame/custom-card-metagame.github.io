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
  const flipCoinButton = document.getElementById('flipCoinButton');
  const flipBoardButton = document.getElementById('flipBoardButton');
  const refreshButton = document.getElementById('refreshButton');

  // Turn Button
  if (turnButton) {
    turnButton.addEventListener('click', () =>
      takeTurn(systemState.initiator, systemState.initiator)
    );
  } else {
    console.warn('Turn Button not found');
  }

  // Flip Coin Button
  if (flipCoinButton) {
    flipCoinButton.addEventListener('click', () =>
      flipCoin(systemState.initiator)
    );
  } else {
    console.warn('Flip Coin Button not found');
  }

  // Flip Board Button
  if (flipBoardButton) {
    flipBoardButton.addEventListener('click', flipBoard);
  } else {
    console.warn('Flip Board Button not found');
  }

  // Refresh Button
  if (refreshButton) {
    refreshButton.addEventListener('click', refreshBoardImages);
  } else {
    console.warn('Refresh Button not found');
  }

  // Wait for iframes to load before accessing their contents
  const initializeIframeButtons = () => {
    // Self VSTAR Button
    const selfVSTARButton = selfContainerDocument.getElementById('VSTARButton');
    if (selfVSTARButton) {
      selfVSTARButton.addEventListener('click', () => {
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

    // Self GX Button
    const selfGXButton = selfContainerDocument.getElementById('GXButton');
    if (selfGXButton) {
      selfGXButton.addEventListener('click', () => {
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

    // Opponent VSTAR Button
    const oppVSTARButton = oppContainerDocument.getElementById('VSTARButton');
    if (oppVSTARButton) {
      oppVSTARButton.addEventListener('click', () => {
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

    // Opponent GX Button
    const oppGXButton = oppContainerDocument.getElementById('GXButton');
    if (oppGXButton) {
      oppGXButton.addEventListener('click', () => {
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

  // Ensure iframes are loaded before trying to access their contents
  if (selfContainerDocument.readyState === 'complete' && 
      oppContainerDocument.readyState === 'complete') {
    initializeIframeButtons();
  } else {
    // Add load event listeners to iframes
    const selfContainer = document.getElementById('selfContainer');
    const oppContainer = document.getElementById('oppContainer');

    if (selfContainer) {
      selfContainer.addEventListener('load', initializeIframeButtons);
    }
    if (oppContainer) {
      oppContainer.addEventListener('load', initializeIframeButtons);
    }
  }
};