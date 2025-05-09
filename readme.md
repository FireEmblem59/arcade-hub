# Pixel Palace Arcade 🎮

A modular web arcade hub featuring retro and modern-themed games. Earn tokens by playing games and test your skills!

## Features ✨

- **Game Hub**: Browse and launch games from a central interface.
- **Dynamic Themes**: Switch between Retro and Modern visual themes.
- **Token System**: Earn tokens by winning games (Memory Match implemented).
- **Responsive Design**: Works on both desktop and mobile devices.
- **Game Framework**: Easy to add new games through JSON configuration.

## Technologies Used 💻

- HTML5/CSS3 (Flexbox/Grid layouts)
- Vanilla JavaScript
- Express.js (Local server)
- Local Storage (Theme persistence & token tracking)

## Installation 🛠️

1. Clone repository:
   ```bash
   git clone https://github.com/FireEmblem59/arcade-hub.git
   cd pixel-palace-arcade
   ```
2. Install dependencies:
   ```bash
   npm install express
   ```
3. Start the server:
   ```bash
   node server.js
   ```
4. Visit `http://localhost:3000` in your browser.

## Games Overview 🕹️

### Memory Match 👻

- Match pairs of symbols to earn tokens
- **Reward calculation**:
  - Base moves for full reward: 10
  - Maximum allowed moves: 20
  - Maximum tokens: 100
  - Formula: `Reward = max(0, 100 - (excess_moves * 10))`

### Reaction Test ⚡ (Coming Soon!)

- Test your click reaction speed
- Earn tokens based on response time

---

## Theme Switching 🎨

Toggle between visual styles using header buttons:

- **Retro Theme**: Pixel-art styling (`Press Start 2P` font)
- **Modern Theme**: Clean material design (`Roboto` font)

All game thumbnails automatically adapt to the active theme!

---

## Contributing 🤝

Want to add your own game? Follow these steps:

1. Create game folder in `/games`
2. Add entry to `games.json`:
   ```json
   {
     "id": "your-game-id",
     "name": "Game Name",
     "folderName": "Your Game Folder",
     "description": "Brief description",
     "thumbnail": "path/to/thumbnail.png",
     "entryPoint": "game.html"
   }
   ```
3. Create themed assets:
   - `thumbnail_retro.png`
   - `thumbnail_modern.png`

## License 📄

This project is licensed under the MIT License.
Free for personal/educational use. Attribute required for commercial use.
