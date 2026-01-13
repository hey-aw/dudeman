# Dudeman - Side-scroller Platformer

A side-scrolling platformer game built with vanilla JavaScript and HTML5 Canvas, compatible with code.org's JavaScript environment.

## How to Play

Open `index.html` in a web browser or run a local server:
```bash
python3 -m http.server 8080
```
Then navigate to `http://localhost:8080`

### Controls
- **Arrow Keys** or **WASD**: Move left/right
- **Space** or **Up Arrow**: Jump
- **E**: Interact (eat hamburger in Level 2)

## Game Overview

### Level 1: The House (Tutorial)
- Simple tutorial level with a grass floor
- House is a decorative background element
- "I'm hungry" text appears above the player at start
- Walk right to reach the EXIT pedestal
- Touch the exit to transition to Level 2

### Level 2: Heaven
- Use the trampoline to bounce up to the clouds
- Clouds act as trampolines - bounce between them to climb higher
- **AVOID ANVILS!** - Falling anvils will restart the level
- Anvils create holes in clouds when they hit them
- Reach the far right to find the hamburger on a pedestal
- Press **E** near the hamburger to eat it
- Enjoy the 1930s ragtime cartoon outro!

## Features

- **Player Physics**: Gravity, jumping, ground collision
- **Trampoline System**: Enhanced bounce mechanics
- **Cloud Platforms**: Bouncy clouds with destructible holes
- **Anvil Hazards**: Falling anvils that restart the level on hit
- **Text Box System**: Speech bubbles for player messages
- **Level Transitions**: Smooth fade transitions between levels
- **1930s Cartoon Outro**: Animated ending with dancing character

## File Structure

- `index.html` - Main HTML file with canvas
- `game.js` - Core game engine and game loop
- `player.js` - Player sprite and physics
- `level.js` - Level data and rendering
- `textbox.js` - Speech bubble text boxes
- `trampoline.js` - Bouncy trampoline objects
- `cloud.js` - Cloud platforms with hole system
- `anvil.js` - Falling anvil hazards
- `hamburger.js` - Goal object with eating animation
- `outro.js` - 1930s ragtime cartoon ending

## Technical Notes

- Built with vanilla JavaScript (ES5/ES6 compatible)
- No external dependencies
- Canvas API only
- Simple AABB collision detection
- 60 FPS game loop using requestAnimationFrame
