import { addAbilityCounter } from '../counters/ability-counter.js';
import { addDamageCounter } from '../counters/damage-counter.js';
import { addmiscCounter, removemiscCounter } from '../counters/misc-status.js';
import { addSpecialCondition } from '../counters/special-condition.js';

export const updateCounters = (
  user,
  movingCard,
  oZoneId,
  oZone,
  dZoneId,
  dZone
) => {
  const zonesWithAttachedCards = ['active', 'bench', 'attachedCards'];
  const counterZones = ['active', 'bench', 'discard', 'attachedCards'];
  // deal with damage counters
  if (movingCard.image.damageCounter) {
    //redefine index of movingCard because its index could have changed due to attached cards.
    const index = dZone.array.findIndex((card) => card === movingCard);

    if (zonesWithAttachedCards.includes(dZoneId)) {
      addDamageCounter(user, dZoneId, index, false, false);
    } else {
      movingCard.image.damageCounter.textContent = '0';
      movingCard.image.damageCounter.handleRemove();
    }
  }
  if (movingCard.image.abilityCounter) {
    //redefine index of movingCard because its index could have changed due to attached cards.
    const index = dZone.array.findIndex((card) => card === movingCard);

    if (zonesWithAttachedCards.includes(dZoneId)) {
      addAbilityCounter(user, dZoneId, index);
    } else {
      movingCard.image.abilityCounter.handleRemove(false);
    }
  }
  //remove special conditions if the pokemon is no longer in the active
  if (movingCard.image.specialCondition && !['active'].includes(dZoneId)) {
    movingCard.image.specialCondition.textContent = '0';
    movingCard.image.specialCondition.handleRemove();
  }

  // Handle misc counters
  if (movingCard.image.miscCounter) {
    const index = dZone.array.findIndex((card) => card === movingCard);
    if (counterZones.includes(dZoneId)) {
      addmiscCounter(
        user,
        dZoneId,
        index,
        movingCard.image.miscCounter.textContent,
        false
      );
    } else {
      movingCard.image.miscCounter.textContent = '0';
      movingCard.image.miscCounter.handleRemove();
    }
  }

  // Handle multiple misc markers
  if (
    movingCard.image.miscCounters &&
    movingCard.image.miscCounters.length > 0
  ) {
    const index = dZone.array.findIndex((card) => card === movingCard);
    if (counterZones.includes(dZoneId)) {
      // Only reposition markers if moving to a supported zone
      movingCard.image.miscCounters.forEach((marker) => {
        addmiscCounter(user, dZoneId, index, marker.textContent, false);
      });
    } else {
      // Properly remove all markers if moving to a zone that doesn't support counters
      removemiscCounter(user, dZoneId, index, null, false); // Remove all markers
    }
  }
  //update damage counter placements on all cards from the same origin/destination zones
  if (counterZones.includes(oZoneId)) {
    for (let i = 0; i < oZone.getCount(); i++) {
      const image = oZone.array[i].image;
      if (image.damageCounter) {
        addDamageCounter(user, oZoneId, i, false, false);
      }
      if (image.specialCondition) {
        addSpecialCondition(user, oZoneId, i, false);
      }
      if (image.abilityCounter) {
        addAbilityCounter(user, oZoneId, i);
      }
      if (image.miscCounter) {
        addmiscCounter(user, oZoneId, i, image.miscCounter.textContent, false);
      }
      // Handle multiple misc markers for existing cards in origin zone
      if (image.miscCounters && image.miscCounters.length > 0) {
        image.miscCounters.forEach((marker) => {
          addmiscCounter(user, oZoneId, i, marker.textContent, false);
        });
      }
    }
  }
  if (counterZones.includes(dZoneId)) {
    for (let i = 0; i < dZone.getCount(); i++) {
      const image = dZone.array[i].image;
      if (image.damageCounter) {
        addDamageCounter(user, dZoneId, i, false, false);
      }
      if (image.specialCondition) {
        addSpecialCondition(user, dZoneId, i, false);
      }
      if (image.abilityCounter) {
        addAbilityCounter(user, dZoneId, i);
      }
      if (image.miscCounter) {
        addmiscCounter(user, dZoneId, i, image.miscCounter.textContent, false);
      }
      // Handle multiple misc markers for existing cards in destination zone
      if (image.miscCounters && image.miscCounters.length > 0) {
        image.miscCounters.forEach((marker) => {
          addmiscCounter(user, dZoneId, i, marker.textContent, false);
        });
      }
    }
  }
};
