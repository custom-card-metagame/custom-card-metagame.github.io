import { resetImage } from '../../setup/image-logic/reset-image.js';
import { addDamageCounter } from '../counters/damage-counter.js';
import { addmiscCounter, repositionMarkers } from '../counters/misc-status.js';
import { resetRotation } from '../general/rotate-card.js';
import { moveCard } from './move-card.js';

export const evolveCard = (
  user,
  initiator,
  movingCard,
  targetCard,
  dZoneId,
  dZone
) => {
  resetImage(movingCard.image);
  targetCard.image.after(movingCard.image);
  targetCard.image.relative = movingCard.image;
  //if counters exists, link the textcontent with the new Pokémon card
  if (targetCard.image.damageCounter) {
    addDamageCounter(user, dZoneId, dZone.getCount() - 1, false, false);
    movingCard.image.damageCounter.textContent =
      targetCard.image.damageCounter.textContent;
    //remove once opponent is finished with it
    targetCard.image.damageCounter.textContent = '0';
    targetCard.image.damageCounter.handleRemove();
  }
  if (targetCard.image.miscCounter) {
    addmiscCounter(
      user,
      dZoneId,
      dZone.getCount() - 1,
      targetCard.image.miscCounter.textContent,
      false
    );
    //remove the old misc counter
    targetCard.image.miscCounter.textContent = '0';
    targetCard.image.miscCounter.handleRemove();
  }

  // Handle multiple misc markers
  if (
    targetCard.image.miscCounters &&
    targetCard.image.miscCounters.length > 0
  ) {
    targetCard.image.miscCounters.forEach((marker) => {
      addmiscCounter(
        user,
        dZoneId,
        dZone.getCount() - 1,
        marker.textContent,
        false
      );
    });
    //remove the old markers
    targetCard.image.miscCounters.forEach((marker) => {
      marker.remove();
    });
    targetCard.image.miscCounters = [];
  }
  if (targetCard.image.specialCondition) {
    targetCard.image.specialCondition.textContent = '0';
    targetCard.image.specialCondition.handleRemove();
  }
  if (targetCard.image.abilityCounter) {
    targetCard.image.abilityCounter.handleRemove(false);
  }
  //rotate card back to normal if it's not
  resetRotation(targetCard.image);

  //reset container width (since cards are being re-attached)
  const newWidth = parseFloat(movingCard.image.clientWidth);
  targetCard.image.parentElement.style.width = newWidth + 'px';

  // set relative of all of targetCard's attached cards to movingCard
  dZone.array.forEach((card) => {
    if (card.image.relative === targetCard.image) {
      card.image.relative = movingCard.image;
    }
  });
  //move the cards to the new host
  for (let i = 0; i < dZone.array.length; i++) {
    const card = dZone.array[i];
    if (card.image === movingCard.image) {
      break;
    } else if (card.image.relative === movingCard.image) {
      resetImage(card.image);
      card.image.attached = true;
      const targetIndex = dZone.array.findIndex(
        (card) => card.image === movingCard.image
      );
      moveCard(user, initiator, dZoneId, dZoneId, i, targetIndex);
      i--;
    }
  }

  // Reposition markers after evolution
  const evolvedCard = dZone.array.find(
    (card) => card.image === movingCard.image
  );
  if (
    evolvedCard &&
    evolvedCard.image.miscCounters &&
    evolvedCard.image.miscCounters.length > 0
  ) {
    repositionMarkers(evolvedCard, dZone);
  }
};
