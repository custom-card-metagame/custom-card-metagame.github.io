const fs = require('fs');
const ejs = require('ejs');

// Read the EJS file
const template = fs.readFileSync('index.ejs', 'utf8');

// Render it with empty data
const html = ejs.render(template, {
  importDataJSON: null
});

// Write to dist/index.html
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', html);

// Copy other assets
fs.cpSync('src', 'dist/src', { recursive: true });