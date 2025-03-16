import {
    oppContainerDocument,
    selfContainerDocument,
    systemState,
  } from '../../front-end.js';
  import { processAction } from '../../setup/general/process-action.js';
  import { getZone } from '../../setup/zones/get-zone.js';
  
  export const updatemiscCounter = (
    user,
    zoneId,
    index,
    miscAmount,
    emit = true
  ) => {
    if (user === 'opp' && emit && systemState.isTwoPlayer) {
      processAction(user, emit, 'updatemiscCounter', [
        zoneId,
        index,
        miscAmount,
      ]);
      return;
    }
  
    const miscCounter = getZone(user, zoneId).array[index].image.miscCounter;
    if (miscCounter.textContent != miscAmount) {
      miscCounter.textContent = miscAmount;
    }
  
    processAction(user, emit, 'updatemiscCounter', [
      zoneId,
      index,
      miscAmount,
    ]);
  };
  
  export const removemiscCounter = (user, zoneId, index, emit = true) => {
    if (user === 'opp' && emit && systemState.isTwoPlayer) {
      processAction(user, emit, 'removemiscCounter', [zoneId, index]);
      return;
    }
  
    const miscCounter = getZone(user, zoneId).array[index].image
    .miscCounter;
    //make sure targetCard exists (it won't exist if it's already been removed)
    miscCounter.textContent = textContent;
  let text = miscCounter.textContent.toUpperCase();
  switch (text) {
    case 'P':
      miscCounter.style.backgroundColor = 'green';
      miscCounter.style.color = 'white';
      break;
    case 'B':
      miscCounter.style.backgroundColor = 'red';
      miscCounter.style.color = 'white';
      break;
    case 'A':
      miscCounter.style.backgroundColor = 'blue';
      miscCounter.style.color = 'white';
      break;
    case 'PA':
      miscCounter.style.backgroundColor = 'yellow';
      miscCounter.style.color = 'black';
      break;
    case 'C':
      miscCounter.style.backgroundColor = 'purple';
      miscCounter.style.color = 'white';
      break;
    default:
      miscCounter.style.backgroundColor = 'white';
      miscCounter.style.color = 'black';
      break;
  }
  
    processAction(user, emit, 'removemiscCounter', [zoneId, index]);
  };
  
  export const addmiscCounter = (
    user,
    zoneId,
    index,
    miscAmount,
    emit = true
  ) => {
    if (user === 'opp' && emit && systemState.isTwoPlayer) {
      processAction(user, emit, 'addmiscCounter', [
        zoneId,
        index,
        miscAmount,
      ]);
      return;
    }
  
    const zone = getZone(user, zoneId);
    const targetCard = zone.array[index];
    const targetRect = targetCard.image.getBoundingClientRect();
    const zoneElementRect = zone.element.getBoundingClientRect();
  
    let miscCounter = targetCard.image.miscCounter;
    //clean up existing event listeners
    if (miscCounter) {
      miscCounter.removeEventListener('input', miscCounter.handleInput);
      miscCounter.handleInput = null;
      miscCounter.removeEventListener(
        'blur',
        miscCounter.handleRemoveWrapper
      );
      miscCounter.handleRemove = null;
      window.removeEventListener('resize', miscCounter.handleResize);
    } else {
      if (user === 'self') {
        miscCounter = selfContainerDocument.createElement('div');
        miscCounter.className =
          systemState.initiator === 'self' ? 'self-circle' : 'opp-circle';
      } else {
        miscCounter = oppContainerDocument.createElement('div');
        miscCounter.className =
          systemState.initiator === 'self' ? 'opp-circle' : 'self-circle';
      }
      miscCounter.contentEditable = 'true';
      miscCounter.textContent = miscAmount ? miscAmount : '10';
    }
  
    miscCounter.style.display = 'inline-block';
    miscCounter.style.left = `${targetRect.left - zoneElementRect.left + targetRect.width / 1.5}px`;
    miscCounter.style.top = `${targetRect.top - zoneElementRect.top + targetRect.height / 4}px`;
    zone.element.appendChild(miscCounter);
  
    if (targetCard.image.parentElement.classList.contains('full-view')) {
      miscCounter.style.display = 'none';
    }
    //adjust size of the circle based on card size
    miscCounter.style.width = `${targetRect.width / 3}px`;
    miscCounter.style.height = `${targetRect.width / 3}px`;
    miscCounter.style.lineHeight = `${targetRect.width / 3}px`;
    miscCounter.style.fontSize = `${targetRect.width / 6}px`;
    miscCounter.style.zIndex = '1';
  
    const handleInput = () => {
      updatemiscCounter(user, zoneId, index, miscCounter.textContent);
    };
  
    const handleResize = () => {
      addmiscCounter(user, zoneId, index, false, false);
    };
  
    const handleRemove = (fromBlurEvent = false) => {
      //the reason the code below is repeated in removemiscCounter is because it's difficult to get reference to the misc counter element when it's being removed through moving (i.e., move to hand)
      //since targetCard.image is already defined here, it's easier to deal with the removal on both sides separately when it's automatic removal, while still having the blur event function for manual removal.
      if (
        targetCard.image.miscCounter.textContent.trim() === '' ||
        targetCard.image.miscCounter.textContent <= 0
      ) {
        targetCard.image.miscCounter.removeEventListener(
          'input',
          targetCard.image.miscCounter.handleInput
        );
        targetCard.image.miscCounter.handleInput = null;
        targetCard.image.miscCounter.removeEventListener(
          'blur',
          targetCard.image.miscCounter.handleRemoveWrapper
        );
        targetCard.image.miscCounter.handleRemove = null;
        window.removeEventListener(
          'resize',
          targetCard.image.miscCounter.handleResize
        );
        targetCard.image.miscCounter.remove();
        targetCard.image.miscCounter = null;
        //manual removal
        if (fromBlurEvent) {
          removemiscCounter(user, zoneId, index);
        }
      }
    };
  
    miscCounter.addEventListener('input', handleInput);
    miscCounter.handleInput = handleInput;
  
    miscCounter.handleRemoveWrapper = () => handleRemove(true);
    miscCounter.addEventListener('blur', miscCounter.handleRemoveWrapper);
    miscCounter.handleRemove = handleRemove;
  
    miscCounter.handleResize = handleResize;
    window.addEventListener('resize', handleResize);
  
    //save the miscCounter on the card
    targetCard.image.miscCounter = miscCounter;
  
    processAction(user, emit, 'addmiscCounter', [zoneId, index, miscAmount]);
  };
  