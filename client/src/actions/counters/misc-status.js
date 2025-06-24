import {
  oppContainerDocument,
  selfContainerDocument,
  systemState,
} from '../../front-end.js';
import { processAction } from '../../setup/general/process-action.js';
import { getZone } from '../../setup/zones/get-zone.js';

// Tooltip information for each marker type
const markerTooltips = {
  G: 'Glacio: The Pokémon this Marker is attached to takes 20 less damage from attacks (before applying Weakness and Resistance).',
  A: 'Aero: The Retreat Cost of the Pokémon this Marker is attached to costs [C] less.',
  S: 'Spectro: During Pokémon Checkup, heal 10 damage from the Pokémon this Marker is attached to.',
  F: 'Fusion: The Pokémon this Marker is attached to takes 20 more damage from attacks (before applying Weakness and Resistance).',
  E: 'Electro: The Retreat Cost of the Pokémon this Marker is attached to costs [C] more.',
  H: 'Havoc (Wild Card): If this Pokémon is attacked, flip a coin. If heads, reduce the damage from that attack by 40. If tails, double the damage from that attack.',
};

// Color scheme for markers
const markerColors = {
  G: { background: '#37b1d1', color: '#2fc79f' }, // Glacio
  A: { background: '#2fc79f', color: '#2fc79f' }, // Aero
  S: { background: '#bda61b', color: '#2fc79f' }, // Spectro
  F: { background: '#c5294e', color: '#991753' }, // Fusion
  E: { background: '#a72fae', color: '#991753' }, // Electro
  H: { background: '#991753', color: '#991753' }, // Havoc
};

// Marker categories for styling
const positiveMarkers = ['G', 'A', 'S'];
const negativeMarkers = ['F', 'E', 'H'];

const applyMarkerStyling = (miscCounter, text) => {
  text = text.toUpperCase();

  if (markerColors[text]) {
    const colors = markerColors[text];
    miscCounter.style.backgroundColor = colors.background;
    miscCounter.style.color = 'white';
    miscCounter.style.fontWeight = 'bold';
    miscCounter.style.border = `2px solid ${colors.color}`;
  } else {
    miscCounter.style.backgroundColor = 'white';
    miscCounter.style.color = 'black';
    miscCounter.style.fontWeight = 'normal';
    miscCounter.style.border = '2px solid #ccc';
  }

  // Ensure the marker is perfectly round
  miscCounter.style.borderRadius = '50%';
  miscCounter.style.textAlign = 'center';
  miscCounter.style.display = 'flex';
  miscCounter.style.alignItems = 'center';
  miscCounter.style.justifyContent = 'center';

  // Remove default tooltip
  miscCounter.removeAttribute('title');

  // Add custom fast tooltip
  if (markerTooltips[text]) {
    setupCustomTooltip(miscCounter, markerTooltips[text]);
  }
};

// Custom tooltip system with faster timing
const setupCustomTooltip = (element, tooltipText) => {
  let tooltipElement = null;
  let showTimeout = null;
  let hideTimeout = null;

  const showTooltip = (event) => {
    if (showTimeout) clearTimeout(showTimeout);
    if (hideTimeout) clearTimeout(hideTimeout);

    showTimeout = setTimeout(() => {
      // Remove any existing tooltip
      if (tooltipElement) {
        tooltipElement.remove();
      }

      // Create tooltip
      tooltipElement = document.createElement('div');
      tooltipElement.style.position = 'fixed';
      tooltipElement.style.backgroundColor = '#333';
      tooltipElement.style.color = 'white';
      tooltipElement.style.padding = '6px 8px';
      tooltipElement.style.borderRadius = '4px';
      tooltipElement.style.fontSize = '11px';
      tooltipElement.style.maxWidth = '200px';
      tooltipElement.style.zIndex = '10000';
      tooltipElement.style.whiteSpace = 'normal';
      tooltipElement.style.wordWrap = 'break-word';
      tooltipElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      tooltipElement.style.pointerEvents = 'none'; // Prevent tooltip from interfering with mouse events
      tooltipElement.textContent = tooltipText;

      // Position tooltip near mouse cursor
      tooltipElement.style.left = event.clientX + 10 + 'px';
      tooltipElement.style.top = event.clientY - 10 + 'px';

      document.body.appendChild(tooltipElement);

      // Adjust position if off-screen
      const tooltipRect = tooltipElement.getBoundingClientRect();
      if (tooltipRect.right > window.innerWidth) {
        tooltipElement.style.left =
          event.clientX - tooltipRect.width - 10 + 'px';
      }
      if (tooltipRect.top < 0) {
        tooltipElement.style.top = event.clientY + 20 + 'px';
      }
      if (tooltipRect.bottom > window.innerHeight) {
        tooltipElement.style.top =
          event.clientY - tooltipRect.height - 20 + 'px';
      }
    }, 250); // Show after 250ms (half of typical 500ms)
  };

  const hideTooltip = () => {
    if (showTimeout) clearTimeout(showTimeout);
    if (hideTimeout) clearTimeout(hideTimeout);

    hideTimeout = setTimeout(() => {
      if (tooltipElement) {
        tooltipElement.remove();
        tooltipElement = null;
      }
    }, 100); // Small delay before hiding
  };

  // Update tooltip position on mouse move
  const updateTooltipPosition = (event) => {
    if (tooltipElement) {
      tooltipElement.style.left = event.clientX + 10 + 'px';
      tooltipElement.style.top = event.clientY - 10 + 'px';

      // Adjust position if off-screen
      const tooltipRect = tooltipElement.getBoundingClientRect();
      if (tooltipRect.right > window.innerWidth) {
        tooltipElement.style.left =
          event.clientX - tooltipRect.width - 10 + 'px';
      }
      if (tooltipRect.top < 0) {
        tooltipElement.style.top = event.clientY + 20 + 'px';
      }
      if (tooltipRect.bottom > window.innerHeight) {
        tooltipElement.style.top =
          event.clientY - tooltipRect.height - 20 + 'px';
      }
    }
  };

  element.addEventListener('mouseenter', showTooltip);
  element.addEventListener('mouseleave', hideTooltip);
  element.addEventListener('mousemove', updateTooltipPosition);
  element.addEventListener('click', hideTooltip); // Hide on click
};

export const updatemiscCounter = (
  user,
  zoneId,
  index,
  miscAmount,
  emit = true
) => {
  if (user === 'opp' && emit && systemState.isTwoPlayer) {
    processAction(user, emit, 'updatemiscCounter', [zoneId, index, miscAmount]);
    return;
  }

  const miscCounter = getZone(user, zoneId).array[index].image.miscCounter;
  if (miscCounter.textContent !== miscAmount) {
    miscCounter.textContent = miscAmount;
  }

  // Apply styling and tooltip
  applyMarkerStyling(miscCounter, miscCounter.textContent);

  processAction(user, emit, 'updatemiscCounter', [zoneId, index, miscAmount]);
};

export const removemiscCounter = (
  user,
  zoneId,
  index,
  markerType = null,
  emit = true
) => {
  if (user === 'opp' && emit && systemState.isTwoPlayer) {
    processAction(user, emit, 'removemiscCounter', [zoneId, index, markerType]);
    return;
  }

  const zone = getZone(user, zoneId);
  const targetCard = zone.array[index];

  if (
    targetCard.image.miscCounters &&
    targetCard.image.miscCounters.length > 0
  ) {
    if (markerType) {
      // Remove specific marker type
      const markerIndex = targetCard.image.miscCounters.findIndex(
        (marker) => marker.textContent === markerType
      );

      if (markerIndex !== -1) {
        const marker = targetCard.image.miscCounters[markerIndex];
        marker.remove();
        targetCard.image.miscCounters.splice(markerIndex, 1);

        // Reposition remaining markers
        repositionMarkers(targetCard, zone);
      }
    } else {
      // Remove all markers (legacy behavior)
      targetCard.image.miscCounters.forEach((marker) => marker.remove());
      targetCard.image.miscCounters = [];
    }
  }

  // Legacy support for old single marker system
  if (targetCard.image.miscCounter) {
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
  }

  processAction(user, emit, 'removemiscCounter', [zoneId, index, markerType]);
};

// Helper function to reposition markers after removal
export const repositionMarkers = (targetCard, zone) => {
  if (
    !targetCard.image.miscCounters ||
    targetCard.image.miscCounters.length === 0
  ) {
    return;
  }

  const targetRect = targetCard.image.getBoundingClientRect();
  const zoneElementRect = zone.element.getBoundingClientRect();

  targetCard.image.miscCounters.forEach((marker, index) => {
    const markerSize = targetRect.width / 4;
    const markerSpacing = 4;

    const row = Math.floor(index / 3);
    const col = index % 3;

    const startX =
      targetRect.left - zoneElementRect.left + targetRect.width / 8;
    const startY =
      targetRect.top -
      zoneElementRect.top +
      targetRect.height -
      markerSize * 2 -
      8;

    marker.style.position = 'absolute';
    marker.style.left = `${startX + col * (markerSize + markerSpacing)}px`;
    marker.style.top = `${startY + row * (markerSize + markerSpacing)}px`;
    marker.style.width = `${markerSize}px`;
    marker.style.height = `${markerSize}px`;
  });
};

export const addmiscCounter = (
  user,
  zoneId,
  index,
  miscAmount,
  emit = true
) => {
  if (user === 'opp' && emit && systemState.isTwoPlayer) {
    processAction(user, emit, 'addmiscCounter', [zoneId, index, miscAmount]);
    return;
  }

  const zone = getZone(user, zoneId);
  const targetCard = zone.array[index];

  // Initialize miscCounters array if it doesn't exist
  if (!targetCard.image.miscCounters) {
    targetCard.image.miscCounters = [];
  }

  // If this is a resize operation (emit = false), clear existing markers of this type first
  if (!emit) {
    const existingIndex = targetCard.image.miscCounters.findIndex(
      (marker) => marker.textContent === miscAmount
    );
    if (existingIndex !== -1) {
      targetCard.image.miscCounters[existingIndex].remove();
      targetCard.image.miscCounters.splice(existingIndex, 1);
    }
  } else {
    // For new additions, check if this marker type already exists (prevent duplicates)
    const existingMarker = targetCard.image.miscCounters.find(
      (marker) => marker.textContent === miscAmount
    );

    if (existingMarker) {
      console.log(`Marker ${miscAmount} already exists on this card`);
      return; // Don't add duplicate markers
    }

    // Check if we already have 6 markers (maximum)
    if (targetCard.image.miscCounters.length >= 6) {
      console.log('Maximum of 6 markers per card reached');
      return;
    }
  }

  const targetRect = targetCard.image.getBoundingClientRect();
  const zoneElementRect = zone.element.getBoundingClientRect();

  let miscCounter;
  if (user === 'self') {
    miscCounter = selfContainerDocument.createElement('div');
    miscCounter.className =
      systemState.initiator === 'self' ? 'self-circle' : 'opp-circle';
  } else {
    miscCounter = oppContainerDocument.createElement('div');
    miscCounter.className =
      systemState.initiator === 'self' ? 'opp-circle' : 'self-circle';
  }

  miscCounter.contentEditable = 'false'; // Make non-editable for individual markers
  miscCounter.textContent = miscAmount ? miscAmount : 'G';

  // Apply marker styling based on type
  applyMarkerStyling(miscCounter, miscAmount);

  // Position markers in 2 rows of 3 at the bottom of the card
  const markerIndex = targetCard.image.miscCounters.length;
  const markerSize = targetRect.width / 4; // Larger markers - 1/4 of card width
  const markerSpacing = 4; // Larger gap between markers

  // Calculate position: 2 rows of 3
  const row = Math.floor(markerIndex / 3); // 0 or 1
  const col = markerIndex % 3; // 0, 1, or 2

  const startX = targetRect.left - zoneElementRect.left + targetRect.width / 8; // Start from left edge
  const startY =
    targetRect.top -
    zoneElementRect.top +
    targetRect.height -
    markerSize * 2 -
    8; // Near bottom

  miscCounter.style.display = 'inline-block';
  miscCounter.style.position = 'absolute';
  miscCounter.style.left = `${startX + col * (markerSize + markerSpacing)}px`;
  miscCounter.style.top = `${startY + row * (markerSize + markerSpacing)}px`;
  miscCounter.style.width = `${markerSize}px`;
  miscCounter.style.height = `${markerSize}px`;

  zone.element.appendChild(miscCounter);

  if (targetCard.image.parentElement.classList.contains('full-view')) {
    miscCounter.style.display = 'none';
  }

  // Debug: Log marker creation
  console.log(
    `Added marker ${miscAmount} at position (${miscCounter.style.left}, ${miscCounter.style.top}). Total markers: ${targetCard.image.miscCounters.length + 1}`
  );

  // Add to the miscCounters array
  targetCard.image.miscCounters.push(miscCounter);
  miscCounter.style.lineHeight = `${markerSize}px`;
  miscCounter.style.fontSize = `${markerSize * 0.5}px`;
  miscCounter.style.zIndex = '1';
  miscCounter.style.fontWeight = 'bold';
  miscCounter.style.textAlign = 'center';

  // Apply initial styling and tooltip
  applyMarkerStyling(miscCounter, miscCounter.textContent);

  // For legacy compatibility, also set miscCounter if it's the first one
  if (!targetCard.image.miscCounter) {
    targetCard.image.miscCounter = miscCounter;
  }

  processAction(user, emit, 'addmiscCounter', [zoneId, index, miscAmount]);
};

const createMarkerOption = (
  marker,
  user,
  zoneId,
  index,
  isDisabled = false
) => {
  const option = document.createElement('div');
  option.style.display = 'flex';
  option.style.alignItems = 'center';
  option.style.padding = '6px 8px';
  option.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
  option.style.borderRadius = '4px';
  option.style.marginBottom = '3px';
  option.style.transition = 'background-color 0.2s';
  option.style.backgroundColor = isDisabled ? '#f5f5f5' : 'white';
  option.style.border = `1px solid ${isDisabled ? '#d0d0d0' : '#e0e0e0'}`;
  option.style.opacity = isDisabled ? '0.6' : '1';

  // Hover effect (only if not disabled)
  if (!isDisabled) {
    option.addEventListener('mouseenter', () => {
      option.style.backgroundColor = '#e8f4f8';
      option.style.borderColor = '#b0d4db';
    });
    option.addEventListener('mouseleave', () => {
      option.style.backgroundColor = 'white';
      option.style.borderColor = '#e0e0e0';
    });
  }

  // Create marker circle preview
  const markerPreview = document.createElement('div');
  markerPreview.style.width = '20px';
  markerPreview.style.height = '20px';
  markerPreview.style.borderRadius = '50%';
  markerPreview.style.backgroundColor = markerColors[marker].background;
  markerPreview.style.color = 'white';
  markerPreview.style.display = 'flex';
  markerPreview.style.alignItems = 'center';
  markerPreview.style.justifyContent = 'center';
  markerPreview.style.fontSize = '10px';
  markerPreview.style.fontWeight = 'bold';
  markerPreview.style.border = `2px solid ${markerColors[marker].color}`;
  markerPreview.style.marginRight = '8px';
  markerPreview.style.flexShrink = '0';
  markerPreview.textContent = marker;

  // Create text content
  const textContent = document.createElement('div');
  textContent.style.fontSize = '10px';
  textContent.style.lineHeight = '1.2';
  textContent.style.flex = '1';
  textContent.style.color = '#333'; // Dark text for better contrast
  textContent.style.fontWeight = '500';

  // Shorter, more concise descriptions
  const shortDescriptions = {
    G: 'Glacio: -20 damage taken',
    A: 'Aero: -1 retreat cost',
    S: 'Spectro: Heal 10 each turn',
    F: 'Fusion: +20 damage taken',
    E: 'Electro: +1 retreat cost',
    H: 'Havoc: Coin flip damage modifier',
  };

  textContent.innerHTML = `<strong style="color: #222;">${marker}:</strong> <span style="color: #555;">${shortDescriptions[marker]}</span>`;

  option.appendChild(markerPreview);
  option.appendChild(textContent);

  // Click handler
  option.addEventListener('click', () => {
    if (!isDisabled) {
      addmiscCounter(user, zoneId, index, marker);
      document.querySelector('.marker-selection-window').remove();
    }
  });

  return option;
};

export const showMarkerSelectionWindow = (user, zoneId, index) => {
  try {
    // Remove any existing selection window
    const existingWindow = document.querySelector('.marker-selection-window');
    if (existingWindow) {
      existingWindow.remove();
    }

    const zone = getZone(user, zoneId);
    if (!zone || !zone.array || !zone.array[index]) {
      console.error('Invalid zone or card index:', { zone, index });
      return;
    }

    const targetCard = zone.array[index];
    if (!targetCard || !targetCard.image) {
      console.error('Invalid target card:', targetCard);
      return;
    }

    // Position to the left of center screen
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const windowWidth = 280;
    const windowHeight = 320;

    // Create selection window
    const selectionWindow = document.createElement('div');
    selectionWindow.className = 'marker-selection-window';
    selectionWindow.style.position = 'fixed';
    selectionWindow.style.left = `${centerX - windowWidth - 20}px`; // Left of center
    selectionWindow.style.top = `${centerY - windowHeight / 2}px`; // Vertically centered
    selectionWindow.style.width = `${windowWidth}px`;
    selectionWindow.style.height = `${windowHeight}px`;
    selectionWindow.style.backgroundColor = '#f8f9fa';
    selectionWindow.style.border = '2px solid #333';
    selectionWindow.style.borderRadius = '8px';
    selectionWindow.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    selectionWindow.style.zIndex = '9999';
    selectionWindow.style.overflow = 'hidden';
    selectionWindow.style.fontFamily =
      'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
    selectionWindow.style.display = 'flex';
    selectionWindow.style.flexDirection = 'column';

    // Add header
    const header = document.createElement('div');
    header.style.backgroundColor = '#333';
    header.style.color = 'white';
    header.style.padding = '8px 12px';
    header.style.fontSize = '13px';
    header.style.fontWeight = 'bold';
    header.style.textAlign = 'center';
    header.style.flexShrink = '0';
    header.textContent = 'Select Forte Marker';
    selectionWindow.appendChild(header);

    // Create scrollable content area
    const contentArea = document.createElement('div');
    contentArea.style.flex = '1';
    contentArea.style.overflowY = 'auto';
    contentArea.style.overflowX = 'hidden';

    // Get existing markers on this card
    const existingMarkers = new Set();
    if (targetCard.image.miscCounters) {
      targetCard.image.miscCounters.forEach((marker) => {
        existingMarkers.add(marker.textContent);
      });
    }

    // Add current markers section if there are any
    if (existingMarkers.size > 0) {
      const currentSection = document.createElement('div');
      currentSection.style.padding = '8px';
      currentSection.style.borderBottom = '1px solid #ddd';
      currentSection.style.backgroundColor = '#f8f9fa';

      const currentTitle = document.createElement('div');
      currentTitle.style.fontSize = '11px';
      currentTitle.style.fontWeight = 'bold';
      currentTitle.style.color = '#495057';
      currentTitle.style.marginBottom = '6px';
      currentTitle.textContent = `Current Markers (${existingMarkers.size}/6)`;
      currentSection.appendChild(currentTitle);

      // Create grid for current markers
      const markerGrid = document.createElement('div');
      markerGrid.style.display = 'flex';
      markerGrid.style.flexWrap = 'wrap';
      markerGrid.style.gap = '4px';

      Array.from(existingMarkers).forEach((markerType) => {
        const markerItem = document.createElement('div');
        markerItem.style.display = 'flex';
        markerItem.style.alignItems = 'center';
        markerItem.style.padding = '4px 6px';
        markerItem.style.backgroundColor = 'white';
        markerItem.style.border = '1px solid #dee2e6';
        markerItem.style.borderRadius = '4px';
        markerItem.style.cursor = 'pointer';
        markerItem.style.transition = 'all 0.2s';

        // Hover effect
        markerItem.addEventListener('mouseenter', () => {
          markerItem.style.backgroundColor = '#ffe6e6';
          markerItem.style.borderColor = '#dc3545';
        });
        markerItem.addEventListener('mouseleave', () => {
          markerItem.style.backgroundColor = 'white';
          markerItem.style.borderColor = '#dee2e6';
        });

        // Marker preview
        const preview = document.createElement('div');
        preview.style.width = '16px';
        preview.style.height = '16px';
        preview.style.borderRadius = '50%';
        preview.style.backgroundColor = markerColors[markerType].background;
        preview.style.color = 'white';
        preview.style.display = 'flex';
        preview.style.alignItems = 'center';
        preview.style.justifyContent = 'center';
        preview.style.fontSize = '8px';
        preview.style.fontWeight = 'bold';
        preview.style.border = `1px solid ${markerColors[markerType].color}`;
        preview.style.marginRight = '4px';
        preview.textContent = markerType;

        // Remove text
        const removeText = document.createElement('div');
        removeText.style.fontSize = '9px';
        removeText.style.color = '#6c757d';
        removeText.textContent = 'Click to remove';

        markerItem.appendChild(preview);
        markerItem.appendChild(removeText);

        // Click to remove
        markerItem.addEventListener('click', () => {
          removemiscCounter(user, zoneId, index, markerType);
          selectionWindow.remove();
        });

        markerGrid.appendChild(markerItem);
      });

      currentSection.appendChild(markerGrid);
      contentArea.appendChild(currentSection);
    }

    // Add positive markers section
    const positiveSection = document.createElement('div');
    positiveSection.style.padding = '8px';
    positiveSection.style.borderBottom = '1px solid #ddd';

    const positiveTitle = document.createElement('div');
    positiveTitle.style.fontSize = '11px';
    positiveTitle.style.fontWeight = 'bold';
    positiveTitle.style.color = '#2fc79f';
    positiveTitle.style.marginBottom = '6px';
    positiveTitle.textContent = 'Positive Effects';
    positiveSection.appendChild(positiveTitle);

    positiveMarkers.forEach((marker) => {
      const isDisabled =
        existingMarkers.has(marker) ||
        (targetCard.image.miscCounters &&
          targetCard.image.miscCounters.length >= 6);
      const option = createMarkerOption(
        marker,
        user,
        zoneId,
        index,
        isDisabled
      );
      positiveSection.appendChild(option);
    });

    contentArea.appendChild(positiveSection);

    // Add negative markers section
    const negativeSection = document.createElement('div');
    negativeSection.style.padding = '8px';

    const negativeTitle = document.createElement('div');
    negativeTitle.style.fontSize = '11px';
    negativeTitle.style.fontWeight = 'bold';
    negativeTitle.style.color = '#991753';
    negativeTitle.style.marginBottom = '6px';
    negativeTitle.textContent = 'Negative Effects';
    negativeSection.appendChild(negativeTitle);

    negativeMarkers.forEach((marker) => {
      const isDisabled =
        existingMarkers.has(marker) ||
        (targetCard.image.miscCounters &&
          targetCard.image.miscCounters.length >= 6);
      const option = createMarkerOption(
        marker,
        user,
        zoneId,
        index,
        isDisabled
      );
      negativeSection.appendChild(option);
    });

    contentArea.appendChild(negativeSection);
    selectionWindow.appendChild(contentArea);

    // Add "Other" option
    const otherSection = document.createElement('div');
    otherSection.style.padding = '8px';
    otherSection.style.borderTop = '1px solid #ddd';

    const otherOption = document.createElement('div');
    otherOption.style.display = 'flex';
    otherOption.style.alignItems = 'center';
    otherOption.style.padding = '6px 8px';
    otherOption.style.cursor = 'pointer';
    otherOption.style.borderRadius = '4px';
    otherOption.style.transition = 'background-color 0.2s';
    otherOption.style.backgroundColor = 'white';
    otherOption.style.border = '1px solid #e0e0e0';

    // Hover effect for other option
    otherOption.addEventListener('mouseenter', () => {
      otherOption.style.backgroundColor = '#f0f8ff';
      otherOption.style.borderColor = '#b0c4de';
    });
    otherOption.addEventListener('mouseleave', () => {
      otherOption.style.backgroundColor = 'white';
      otherOption.style.borderColor = '#e0e0e0';
    });

    // Create "Other" icon (question mark circle)
    const otherIcon = document.createElement('div');
    otherIcon.style.width = '20px';
    otherIcon.style.height = '20px';
    otherIcon.style.borderRadius = '50%';
    otherIcon.style.backgroundColor = '#6c757d';
    otherIcon.style.color = 'white';
    otherIcon.style.display = 'flex';
    otherIcon.style.alignItems = 'center';
    otherIcon.style.justifyContent = 'center';
    otherIcon.style.fontSize = '12px';
    otherIcon.style.fontWeight = 'bold';
    otherIcon.style.border = '2px solid #495057';
    otherIcon.style.marginRight = '8px';
    otherIcon.style.flexShrink = '0';
    otherIcon.textContent = '?';

    // Create "Other" text content
    const otherTextContent = document.createElement('div');
    otherTextContent.style.fontSize = '10px';
    otherTextContent.style.lineHeight = '1.2';
    otherTextContent.style.flex = '1';
    otherTextContent.style.color = '#333';
    otherTextContent.style.fontWeight = '500';
    otherTextContent.innerHTML = `<strong style="color: #222;">Other:</strong> <span style="color: #555;">Enter custom letter manually</span>`;

    otherOption.appendChild(otherIcon);
    otherOption.appendChild(otherTextContent);

    // Click handler for "Other" option
    otherOption.addEventListener('click', () => {
      // Close the selection window
      selectionWindow.remove();
      // Add a misc counter with default 'A' that can be manually edited
      addmiscCounter(user, zoneId, index, 'A');
    });

    otherSection.appendChild(otherOption);
    selectionWindow.appendChild(otherSection);

    // Add cancel button
    const cancelButton = document.createElement('button');
    cancelButton.style.width = '100%';
    cancelButton.style.padding = '8px';
    cancelButton.style.backgroundColor = '#666';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.fontSize = '11px';
    cancelButton.style.flexShrink = '0';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
      selectionWindow.remove();
    });
    selectionWindow.appendChild(cancelButton);

    // Add to document
    document.body.appendChild(selectionWindow);

    // Adjust position if it goes off screen
    const windowRect = selectionWindow.getBoundingClientRect();
    if (windowRect.left < 0) {
      selectionWindow.style.left = '10px';
    }
    if (windowRect.top < 0) {
      selectionWindow.style.top = '10px';
    }
    if (windowRect.bottom > window.innerHeight) {
      selectionWindow.style.top = `${window.innerHeight - windowRect.height - 10}px`;
    }

    // Close window when clicking outside
    const handleClickOutside = (event) => {
      if (!selectionWindow.contains(event.target)) {
        selectionWindow.remove();
        document.removeEventListener('click', handleClickOutside);
      }
    };

    // Delay adding the click listener to prevent immediate closure
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    // Close window when pressing Escape
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        selectionWindow.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  } catch (error) {
    console.error('Error in showMarkerSelectionWindow:', error);
  }
};

// Export function to close selection window (can be called from other parts of the app)
export const closeMarkerSelectionWindow = () => {
  const existingWindow = document.querySelector('.marker-selection-window');
  if (existingWindow) {
    existingWindow.remove();
  }
};
