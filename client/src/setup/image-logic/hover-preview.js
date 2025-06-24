let hoverTimeout = null;
let currentPreview = null;
let isPreviewActive = false;
let isDragging = false;
let isRightClicking = false;
let isInteracting = false;

// Create hover preview element
const createPreviewElement = () => {
  const preview = document.createElement('div');
  preview.id = 'hoverPreview';
  preview.style.cssText = `
    position: fixed;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.9);
    border: 2px solid #fff;
    border-radius: 8px;
    padding: 10px;
    display: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    max-width: 300px;
    max-height: 420px;
    pointer-events: none;
  `;

  const img = document.createElement('img');
  img.style.cssText = `
    width: 100%;
    height: auto;
    border-radius: 4px;
    display: block;
  `;

  preview.appendChild(img);
  document.body.appendChild(preview);
  return preview;
};

// Position preview near cursor but ensure it stays on screen
const positionPreview = (preview, event) => {
  const padding = 20;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const previewRect = preview.getBoundingClientRect();

  let left = event.clientX + padding;
  let top = event.clientY + padding;

  // Adjust if preview would go off screen
  if (left + previewRect.width > windowWidth) {
    left = event.clientX - previewRect.width - padding;
  }

  if (top + previewRect.height > windowHeight) {
    top = event.clientY - previewRect.height - padding;
  }

  // Ensure minimum distance from edges
  left = Math.max(
    padding,
    Math.min(left, windowWidth - previewRect.width - padding)
  );
  top = Math.max(
    padding,
    Math.min(top, windowHeight - previewRect.height - padding)
  );

  preview.style.left = `${left}px`;
  preview.style.top = `${top}px`;
};

// Show hover preview
export const showHoverPreview = (event) => {
  if (isPreviewActive) return;

  const img = event.target;
  if (!img.src || img.src.includes('cardback') || img.alt === 'Card back')
    return;

  // Create preview if it doesn't exist
  if (!currentPreview) {
    currentPreview = createPreviewElement();
  }

  const previewImg = currentPreview.querySelector('img');
  previewImg.src = img.src;
  previewImg.alt = img.alt;

  currentPreview.style.display = 'block';
  positionPreview(currentPreview, event);
  isPreviewActive = true;
};

// Hide hover preview
export const hideHoverPreview = () => {
  if (currentPreview) {
    currentPreview.style.display = 'none';
  }
  isPreviewActive = false;
};

// Handle mouse enter on card
export const handleCardHoverStart = (event) => {
  // Clear any existing timeout
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }

  // Don't show preview for card backs, if already in full view, or if interacting
  const img = event.target;
  if (
    !img.src ||
    img.src.includes('cardback') ||
    img.alt === 'Card back' ||
    img.parentElement?.classList.contains('full-view') ||
    isDragging ||
    isRightClicking ||
    isInteracting
  ) {
    return;
  }

  // Set timeout to show preview after 0.5 seconds
  hoverTimeout = setTimeout(() => {
    // Double-check we're not interacting when timeout fires
    if (!isDragging && !isRightClicking && !isInteracting) {
      showHoverPreview(event);
    }
  }, 500);
};

// Handle mouse leave on card
export const handleCardHoverEnd = (event) => {
  // Clear timeout if mouse leaves before 1 second
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }

  // Hide preview
  hideHoverPreview();
};

// Handle mouse move on card (update preview position if active)
export const handleCardHoverMove = (event) => {
  if (isPreviewActive && currentPreview) {
    positionPreview(currentPreview, event);
  }
};

// Initialize hover preview system
export const initializeHoverPreview = () => {
  // Remove existing preview if any
  const existingPreview = document.getElementById('hoverPreview');
  if (existingPreview) {
    existingPreview.remove();
  }

  currentPreview = null;
  isPreviewActive = false;

  console.log('Hover preview system initialized');
};

// Clean up hover preview system
export const cleanupHoverPreview = () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }

  hideHoverPreview();

  if (currentPreview) {
    currentPreview.remove();
    currentPreview = null;
  }
};

// Functions to control interaction states
export const setDragState = (dragging) => {
  isDragging = dragging;
  if (dragging) {
    hideHoverPreview();
  }
};

export const setRightClickState = (rightClicking) => {
  isRightClicking = rightClicking;
  if (rightClicking) {
    hideHoverPreview();
  }
};

export const setInteractionState = (interacting) => {
  isInteracting = interacting;
  if (interacting) {
    hideHoverPreview();
  }
};
