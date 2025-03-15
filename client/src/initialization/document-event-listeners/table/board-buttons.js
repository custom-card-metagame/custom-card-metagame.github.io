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
  turnButton?.addEventListener('click', () =>
    takeTurn(systemState.initiator, systemState.initiator)
  );

  const flipCoinButton = document.getElementById('flipCoinButton');
  flipCoinButton?.addEventListener('click', () =>
    flipCoin(systemState.initiator)
  );

  const flipBoardButton = document.getElementById('flipBoardButton');
  flipBoardButton?.addEventListener('click', flipBoard);

  const refreshButton = document.getElementById('refreshButton');
  refreshButton?.addEventListener('click', refreshBoardImages);

  // Function to initialize iframe buttons
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

  // Multiple approaches to ensure buttons are initialized
  // 1. Immediate initialization
  initializeIframeButtons();

  // 2. Defer initialization to next event loop
  setTimeout(initializeIframeButtons, 0);

  // 3. Add load event listeners as a fallback
  const selfContainer = document.getElementById('selfContainer');
  const oppContainer = document.getElementById('oppContainer');

  if (selfContainer) {
    selfContainer.addEventListener('load', initializeIframeButtons);
  }

  if (oppContainer) {
    oppContainer.addEventListener('load', initializeIframeButtons);
  }

  // 4. Mutation observer as an additional fallback
  const observeIframeLoad = () => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          initializeIframeButtons();
        }
      }
    });

    if (selfContainer) {
      observer.observe(selfContainer, { attributes: true });
    }

    if (oppContainer) {
      observer.observe(oppContainer, { attributes: true });
    }
  };

  observeIframeLoad();
};