# Pixel Palace Arcade 🎮

A modular web arcade hub featuring retro and modern-themed games. Earn tokens by playing games and test your skills!

## Features ✨

- **Game Hub**: Browse and launch games from a central interface.
- **Dynamic Themes**: Switch between Modern, Retro, and Cyberpunk visual themes.
- **Shop System**: Purchase new games and cosmetic items like themes using tokens.
- **Token System**: Earn tokens by playing games (Memory Match, Typing Speed Test, etc. implemented).
- **Responsive Design**: Works on both desktop and mobile devices.
- **Game Framework**: Easy to add new games through JSON configuration.

## Technologies Used 💻

- HTML5/CSS3 (Flexbox/Grid layouts)
- Vanilla JavaScript
- Express.js (Local server)
- Local Storage (Theme persistence & token tracking)
- [html2canvas](https://html2canvas.hertzen.com) (for theme preview generation - development tool)

## Installation 🛠️

1. Clone repository:
   ```bash
   git clone https://github.com/FireEmblem59/arcade-hub.git
   cd pixel-palace-arcade
   ```
2. Install dependencies: (not necessary)
   ```bash
   npm install express
   ```
3. Start the server: (or use live server if not using express)
   ```bash
   node server.js
   ```
4. Visit `http://localhost:3000` in your browser.

## Games Overview 🕹️

- Memory Match 👻
- Reaction Test ⚡
- Click Target 🎯
- Typing Speed Test ⌨️
- Stop the Bar 🚦
- Quick Math ➕➖✖️➗
- Lucky Card 🃏

---

## Theme Switching 🎨

Toggle between visual styles using the Emporium (Shop). The selected theme applies globally across the hub and supported games.

- Modern Theme: Clean, sleek, and contemporary design (primarily uses Roboto font).

- Retro Theme: Pixel-art styling with a classic 80s arcade vibe (primarily uses Press Start 2P font).

- Cyberpunk Theme: Neon lights, digital rain, and a techy, monospaced aesthetic (primarily uses Roboto Mono, Aldrich, Orbitron fonts).

All game thumbnails automatically adapt to the active theme!

---

## Contributing 🤝

Want to add your own game? Follow these steps:

1. Create game folder in `/games`
2. Add entry to `games.json`:
   ```json
   {
     "id": "your-game-id",
     "name": "Your Game Name",
     "folderName": "MyAwesomeGame",
     "description": "A brief description of your game.",
     "thumbnail": "games/MyAwesomeGame/assets/my_thumbnail.png", // Path to your base thumbnail
     "entryPoint": "index.html", // Main HTML file for your game
     "price": 500, // Or 0 if free
     "ownedByDefault": false // Or true if free
   }
   ```
3. Create themed assets:
   - `thumbnail_retro.png`
   - `thumbnail_modern.png`
   - `thumbnail_cyberpunk.png`

## License 📄

This project is licensed under the MIT License.
Free for personal/educational use. Attribute required for commercial use.
