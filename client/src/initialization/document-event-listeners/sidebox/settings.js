export const initializeSettings = () => {
  const darkModeCheckbox = document.getElementById('darkModeCheckbox');

  // Set the checkbox to be checked and enable dark mode by default
  darkModeCheckbox.checked = true; // Check the checkbox by default
  darkMode(); // Call the darkMode function to apply dark mode styles immediately

  darkModeCheckbox.addEventListener('change', darkMode);

  const showZonesCheckbox = document.getElementById('showZonesCheckbox');
  showZonesCheckbox.addEventListener('change', showOutlines);

  const hideHandCheckbox = document.getElementById('hideHandCheckbox');
  hideHandCheckbox.addEventListener('change', () => {
    if (hideHandCheckbox.checked) {
      if (systemState.initiator === 'self' && !systemState.isTwoPlayer) {
        stopLookingAtCards('opp', '', 'hand', false, true);
      } else if (!systemState.isTwoPlayer) {
        stopLookingAtCards('self', '', 'hand', false, true);
      }
    } else {
      if (systemState.initiator === 'self' && !systemState.isTwoPlayer) {
        lookAtCards('opp', '', 'hand', false, true);
      } else if (!systemState.isTwoPlayer) {
        lookAtCards('self', '', 'hand', false, true);
      }
    }
  });

  const changeBackgroundButton = document.getElementById('changeBackgroundButton');
  changeBackgroundButton.addEventListener('click', () => {
    changeBackground();
  });
};