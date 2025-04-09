// meta-changelog.js - Contains changelog content for the Meta-PTCG fork

const metaChangelogContent = `
<h2>Meta-PTCG v0.1.1 - Enhanced Room Experience (04/09/25)</h2>
<p>This update focuses on improving the room creation experience and server optimizations!</p>

<p><strong>NEW FEATURES</strong></p>
<ul style="list-style-type: disc; padding-left: 20px; margin-top: 10px; margin-bottom: 20px;">
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Pokémon-Themed Room IDs: </strong>Room IDs now use recognizable Pokémon locations (like "viridian-city-1234") instead of random strings, making rooms easier to remember and share.</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Random Trainer Names: </strong>When joining a room without specifying a username, you'll now be assigned a random Pokémon trainer name from the games and anime.</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Enhanced Connection Handling: </strong>Improved handling of connection issues with better error messages and automatic reconnection attempts.</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Direct Room Links: </strong>Join rooms directly via URL links (meta-ptcg.org/room/room-name) - coming very soon!</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Improved Game State Import/Export: </strong>Fixed issues with JSON handling for game state imports and exports.</li>
</ul>

<p><strong>TECHNICAL IMPROVEMENTS</strong></p>
<ul style="list-style-type: disc; padding-left: 20px; margin-top: 10px; margin-bottom: 20px;">
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Render Server Optimization: </strong>Enhanced server-side performance and reliability for faster game loading and smoother gameplay.</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Cloudflare Edge Caching: </strong>Implemented optimized edge caching for static assets, improving load times worldwide.</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>JSON API Improvements: </strong>Fixed issues with JSON responses for game state import/export functionality.</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Error Handling: </strong>Added better error handling throughout the application for improved stability.</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Code Modularization: </strong>Began the process of modularizing code components for better organization and maintainability.</li>
</ul>

<p><strong>COMING SOON</strong></p>
<ul style="list-style-type: disc; padding-left: 20px; margin-top: 10px; margin-bottom: 20px;">
    <li style="font-size: 16px; margin-bottom: 10px;">More custom features for meta formats, including format-specific rule enforcement</li>
    <li style="font-size: 16px; margin-bottom: 10px;">Custom meta-based decks with improved import/export logic</li>
    <li style="font-size: 16px; margin-bottom: 10px;">Further UI/UX improvements and visual enhancements</li>
    <li style="font-size: 16px; margin-bottom: 10px;">Enhanced chat features and spectator functionality</li>
    <li style="font-size: 16px; margin-bottom: 10px;">Automatic format validation for decklists</li>
    <li style="font-size: 16px; margin-bottom: 10px;">In-game tournament bracket system for Meta format events</li>
</ul>

<p>Thanks for your continued support of Meta-PTCG! We're continuously working to improve your experience.</p>
<strong>- Meta-PTCG Team</strong>
<br><br>
<hr>

<h2>Meta-PTCG v0.1.0 - Initial Fork Release (03/16/25)</h2>
<p>Welcome to the first release of Meta-PTCG, a fork of the original PTCG-sim with added features for custom meta formats!</p>

<p><strong>NEW FEATURES</strong></p>
<ul style="list-style-type: disc; padding-left: 20px; margin-top: 10px; margin-bottom: 20px;">
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Meta Format Support: </strong>Added support for custom meta formats with specialized rulesets.</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Enhanced Card Database: </strong>Expanded card database to better support custom formats and banned/restricted lists.</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Custom Format Selector: </strong>New dropdown menu to select between different meta formats when setting up games.</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Forte Button and Misc Game Markers:</strong> Added and optimized game mechanics to include the "Forte" button and miscellaneous game markers, enhancing gameplay for meta formats with diverse card types, tokens, and markers.</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Neon Glow CSS:</strong> Added vibrant coloring and neon glow effects to the game board for both self and opponent elements, improving visual appeal.</li>
</ul>

<p><strong>IMPROVEMENTS</strong></p>
<ul style="list-style-type: disc; padding-left: 20px; margin-top: 10px; margin-bottom: 20px;">
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Cloudflare Optimization:</strong> Optimized the website to run efficiently on Cloudflare.</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Changelog and Index Script Enhancements:</strong> Modified changelog and index scripts for better version control and enhanced functionality.</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Game Board CSS Enhancements:</strong> Enhanced the CSS in the game board for both self and opponent elements for more vibrant coloring and neon glow effects.</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Code Optimization:</strong> Optimized parts of the code for this fork, maintaining loose compatibility with the main branch.</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>DarkMode Script Optimization:</strong> optimized the scripts for darkmode.</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>Background Changes:</strong> Changed the background.</li>
    <li style="font-size: 16px; margin-bottom: 10px;"><strong>New Game Logic:</strong> Added new game logic for additional future customization.</li>
</ul>

<p>Thanks for checking out Meta-PTCG! This project aims to provide a dedicated platform for custom meta formats while maintaining compatibility with the original PTCG-sim.</p>
<strong>- Meta-PTCG Team</strong>
`;

// Export the content so it can be used in other scripts
if (typeof module !== 'undefined') {
  module.exports = { metaChangelogContent };
} else {
  // For browser environment
  window.metaChangelogContent = metaChangelogContent;
  console.log('Meta Changelog Content Assigned:', window.metaChangelogContent);

  // AUTOMATIC VERSION UPDATE CODE
  // This code extracts the version number from the H2 header and updates the link text
  document.addEventListener('DOMContentLoaded', function () {
    try {
      // Extract version from the first h2 tag in the changelog content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = metaChangelogContent;
      const firstH2 = tempDiv.querySelector('h2');

      if (firstH2) {
        // Extract version using regex to find pattern like "v0.1.1"
        const versionMatch = firstH2.textContent.match(/v\d+\.\d+\.\d+/);
        if (versionMatch && versionMatch[0]) {
          const version = versionMatch[0];
          console.log('Extracted version:', version);

          // Find the meta changelog link in the DOM and update it
          const metaChangelogLink =
            document.getElementById('metaChangelogLink');
          if (metaChangelogLink) {
            // Keep everything after the version number
            const currentText = metaChangelogLink.textContent;
            const suffixMatch = currentText.match(/(?:v[\d.]+)(.+)/);
            const suffix = suffixMatch ? suffixMatch[1] : ' ✧(≖ ヮ ≖)✧';

            // Update the text with new version but keep the suffix
            metaChangelogLink.textContent = `${version}${suffix}`;
            console.log(
              'Updated meta changelog link to:',
              metaChangelogLink.textContent
            );
          }
        }
      }
    } catch (e) {
      console.error('Error updating version number:', e);
    }
  });
}
