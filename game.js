// Main Game Engine
var Game = (function() {
    function Game() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Game state
        this.state = 'playing'; // playing, paused, transition, outro, complete, failure
        this.currentLevel = 1;
        this.level = null;
        this.player = null;
        this.textBox = null;
        this.outro = null;
        this.failure = null;
        this.anvilSpawner = null;
        this.birdSpawner = null;

        // Camera
        this.cameraX = 0;
        this.cameraY = 0;

        // Input
        this.keys = {
            left: false,
            right: false,
            jump: false,
            interact: false
        };

        // Level transition
        this.transitionAlpha = 0;
        this.transitionState = null; // 'fadeOut', 'fadeIn'
        this.nextLevel = null;

        // Text box timing
        this.textBoxTimer = 0;
        this.textBoxDuration = 180; // frames to show initial text
        this.initialTextShown = false;

        // Restart button state
        this.restartButtonShown = false;

        // Initialize
        this.init();
    }

    Game.prototype.init = function() {
        var self = this;

        // Create game objects
        this.textBox = new TextBox();
        this.outro = new Outro(this.width, this.height);
        this.failure = new Failure(this.width, this.height);

        // Hide restart button initially
        this.hideRestartButton();

        // Load first level
        this.loadLevel(1);

        // Input handlers
        document.addEventListener('keydown', function(e) {
            self.handleKeyDown(e);
        });

        document.addEventListener('keyup', function(e) {
            self.handleKeyUp(e);
        });

        // Restart button handler
        var restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.addEventListener('click', function() {
                self.handleRestart();
            });
        }

        this.setupTouchControls();
        this.setupTouchScrollPrevention();

        // Start game loop
        this.lastTime = 0;
        requestAnimationFrame(function(time) {
            self.gameLoop(time);
        });
    };

    Game.prototype.setupTouchControls = function() {
        var controls = document.getElementById('touchControls');
        if (!controls) {
            return;
        }

        var self = this;
        var buttons = controls.querySelectorAll('[data-action]');
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            document.body.classList.add('touch-enabled');
        }

        var pressAction = function(action) {
            switch (action) {
                case 'left':
                    self.keys.left = true;
                    break;
                case 'right':
                    self.keys.right = true;
                    break;
                case 'jump':
                    self.keys.jump = true;
                    break;
                case 'interact':
                    self.keys.interact = true;
                    self.handleInteract();
                    break;
            }
        };

        var releaseAction = function(action) {
            switch (action) {
                case 'left':
                    self.keys.left = false;
                    break;
                case 'right':
                    self.keys.right = false;
                    break;
                case 'jump':
                    self.keys.jump = false;
                    break;
                case 'interact':
                    self.keys.interact = false;
                    break;
            }
        };

        buttons.forEach(function(button) {
            var action = button.getAttribute('data-action');

            var handlePress = function(event) {
                event.preventDefault();
                pressAction(action);
            };

            var handleRelease = function(event) {
                event.preventDefault();
                releaseAction(action);
            };

            button.addEventListener('touchstart', handlePress, { passive: false });
            button.addEventListener('touchend', handleRelease);
            button.addEventListener('touchcancel', handleRelease);
            button.addEventListener('mousedown', handlePress);
            button.addEventListener('mouseup', handleRelease);
            button.addEventListener('mouseleave', handleRelease);
        });
    };

    Game.prototype.setupTouchScrollPrevention = function() {
        var canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            return;
        }

        canvas.addEventListener('touchstart', function(event) {
            event.preventDefault();
        }, { passive: false });

        canvas.addEventListener('touchmove', function(event) {
            event.preventDefault();
        }, { passive: false });
    };

    Game.prototype.loadLevel = function(levelNumber) {
        this.currentLevel = levelNumber;
        this.level = new Level(levelNumber);

        // Create player at level start position
        var start = this.level.data.playerStart;
        this.player = new Player(start.x, start.y);

        // Initialize camera to player position
        var targetX = start.x - this.width / 2 + this.player.width / 2;
        var targetY = start.y - this.height / 2 + this.player.height / 2;
        
        // For level 2, ensure ground is visible at start by positioning camera at bottom
        if (levelNumber === 2) {
            // Position camera at maximum Y to show ground at bottom of screen
            var maxCameraY = this.level.data.height - this.height;
            targetY = maxCameraY;
        }
        
        // Clamp to level bounds
        this.cameraX = Math.max(0, Math.min(targetX, this.level.data.width - this.width));
        this.cameraY = Math.max(0, Math.min(targetY, this.level.data.height - this.height));

        // Reset spawners
        this.anvilSpawner = null;
        this.birdSpawner = null;

        // Setup level-specific elements
        if (levelNumber === 1) {
            // Level 1: Show "I'm hungry" text
            this.initialTextShown = false;
            this.textBoxTimer = 0;
        } else if (levelNumber === 2) {
            // Level 2: Start bird spawner (climbing level with flying hazards)
            this.birdSpawner = new BirdSpawner(this.level.data.width, this.level.data.height);
            this.birdSpawner.start();
        } else if (levelNumber === 3) {
            // Level 3: Start anvil spawner (heaven traversal)
            this.anvilSpawner = new AnvilSpawner(this.level.data.width, -100);
            this.anvilSpawner.start();
        }

        this.state = 'playing';
    };

    Game.prototype.handleKeyDown = function(e) {
        // Check if restart button is visible and space is pressed
        if (e.code === 'Space' && this.restartButtonShown) {
            this.handleRestart();
            e.preventDefault();
            return;
        }
        
        switch (e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = true;
                break;
            case 'ArrowUp':
            case 'KeyW':
            case 'Space':
                this.keys.jump = true;
                e.preventDefault();
                break;
            case 'KeyE':
                this.keys.interact = true;
                this.handleInteract();
                break;
        }
    };

    Game.prototype.handleKeyUp = function(e) {
        switch (e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = false;
                break;
            case 'ArrowUp':
            case 'KeyW':
            case 'Space':
                this.keys.jump = false;
                break;
            case 'KeyE':
                this.keys.interact = false;
                break;
        }
    };

    Game.prototype.handleInteract = function() {
        if (this.state !== 'playing') return;

        // Check if near hamburger (level 3)
        if (this.currentLevel === 3 && this.level.hamburger) {
            if (this.level.hamburger.playerNear) {
                this.level.hamburger.startEating();
                this.textBox.hide();
            }
        }
    };

    Game.prototype.gameLoop = function(currentTime) {
        var self = this;

        // Calculate delta time (not used currently, but useful for future)
        var deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update
        this.update();

        // Draw
        this.draw();

        // Continue loop
        requestAnimationFrame(function(time) {
            self.gameLoop(time);
        });
    };

    Game.prototype.update = function() {
        switch (this.state) {
            case 'playing':
                this.updatePlaying();
                break;
            case 'transition':
                this.updateTransition();
                break;
            case 'outro':
                this.updateOutro();
                break;
            case 'failure':
                this.updateFailure();
                break;
            case 'complete':
                // Game complete, do nothing
                break;
        }
    };

    Game.prototype.updatePlaying = function() {
        // Update player
        this.player.update(
            this.keys,
            this.level.data.platforms,
            this.level.trampolines,
            this.level.clouds
        );

        // Update level
        var eatingComplete = this.level.update();

        // Update camera
        this.updateCamera();

        // Level-specific logic (before textBox.update so show() is called first)
        if (this.currentLevel === 1) {
            this.updateLevel1();
        } else if (this.currentLevel === 2) {
            this.updateLevel2();
        } else if (this.currentLevel === 3) {
            this.updateLevel3(eatingComplete);
        }

        // Update text box (after level logic so show() has been called)
        this.textBox.update();

        // Keep player in bounds
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > this.level.data.width - this.player.width) {
            this.player.x = this.level.data.width - this.player.width;
        }

        // Check if player fell off
        var fallThreshold = this.level.data.height + 100;
        
        // Level 2 & 3: Restart if player falls below the clouds/ground
        if (this.currentLevel === 2) {
            fallThreshold = 2050; // Below the ground platform at y:1900
        } else if (this.currentLevel === 3) {
            fallThreshold = 550; // Below all cloud platforms (lowest is around y:400)
        }
        
        if (this.player.y > fallThreshold) {
            this.startFailure();
        }
    };

    Game.prototype.updateLevel1 = function() {
        // Show initial text box
        if (!this.initialTextShown) {
            this.textBox.show("I'm hungry", this.player);
            this.initialTextShown = true;
        }

        // Hide text after duration
        this.textBoxTimer++;
        if (this.textBoxTimer > this.textBoxDuration && this.textBox.active) {
            this.textBox.hide();
        }

        // Check exit collision
        if (this.level.checkExitCollision(this.player)) {
            this.startTransition(2);
        }
    };

    Game.prototype.updateLevel2 = function() {
        // Update bird spawner
        if (this.birdSpawner) {
            var playerHit = this.birdSpawner.update(this.player);
            if (playerHit) {
                this.startFailure();
                return;
            }
        }

        // Check exit collision (goes to Level 3)
        if (this.level.checkExitCollision(this.player)) {
            this.startTransition(3);
        }
    };

    Game.prototype.updateLevel3 = function(eatingComplete) {
        // Update anvil spawner
        if (this.anvilSpawner) {
            var playerHit = this.anvilSpawner.update(this.player, this.level.clouds);
            if (playerHit) {
                this.startFailure();
                return;
            }
        }

        // Check hamburger proximity
        if (this.level.hamburger) {
            var nearHamburger = this.level.hamburger.checkProximity(this.player);
            
            if (nearHamburger && !this.level.hamburger.eating) {
                if (!this.textBox.active || this.textBox.text !== 'Press E to eat') {
                    this.textBox.show('Press E to eat', this.level.hamburger);
                }
            } else if (!nearHamburger && this.textBox.text === 'Press E to eat') {
                this.textBox.hide();
            }

            // Check if eating is complete
            if (eatingComplete) {
                this.startOutro();
            }
        }
    };

    Game.prototype.updateCamera = function() {
        // Horizontal follow
        var targetX = this.player.x - this.width / 2 + this.player.width / 2;
        this.cameraX += (targetX - this.cameraX) * 0.1;

        // Vertical follow (for level 2 and 3)
        if (this.currentLevel === 2 || this.currentLevel === 3) {
            var targetY = this.player.y - this.height / 2 + this.player.height / 2;
            
            // For level 2, ensure ground remains visible by keeping camera low when player is near ground
            if (this.currentLevel === 2) {
                // If player is near the ground (below y: 1900), keep camera at bottom to show ground
                if (this.player.y >= 1800) {
                    var maxCameraY = this.level.data.height - this.height;
                    targetY = maxCameraY; // Keep camera at bottom to show ground
                }
            }
            
            this.cameraY += (targetY - this.cameraY) * 0.1;
        }

        // Clamp camera to level bounds
        if (this.cameraX < 0) this.cameraX = 0;
        if (this.cameraX > this.level.data.width - this.width) {
            this.cameraX = this.level.data.width - this.width;
        }
        if (this.cameraY < 0) this.cameraY = 0;
        if (this.cameraY > this.level.data.height - this.height) {
            this.cameraY = this.level.data.height - this.height;
        }
    };

    Game.prototype.startTransition = function(nextLevel) {
        this.state = 'transition';
        this.transitionState = 'fadeOut';
        this.transitionAlpha = 0;
        this.nextLevel = nextLevel;
    };

    Game.prototype.updateTransition = function() {
        if (this.transitionState === 'fadeOut') {
            this.transitionAlpha += 0.03;
            if (this.transitionAlpha >= 1) {
                this.transitionAlpha = 1;
                this.loadLevel(this.nextLevel);
                this.transitionState = 'fadeIn';
            }
        } else if (this.transitionState === 'fadeIn') {
            this.transitionAlpha -= 0.03;
            if (this.transitionAlpha <= 0) {
                this.transitionAlpha = 0;
                this.state = 'playing';
                this.transitionState = null;
            }
        }
    };

    Game.prototype.startOutro = function() {
        this.state = 'outro';
        if (this.anvilSpawner) {
            this.anvilSpawner.stop();
        }
        this.outro.start();
    };

    Game.prototype.updateOutro = function() {
        var complete = this.outro.update();
        if (complete) {
            this.state = 'complete';
        }
    };

    Game.prototype.startFailure = function() {
        this.state = 'failure';
        this.restartButtonShown = false; // Reset flag
        if (this.anvilSpawner) {
            this.anvilSpawner.stop();
        }
        if (this.birdSpawner) {
            this.birdSpawner.stop();
        }
        this.failure.start();
    };

    Game.prototype.updateFailure = function() {
        // Only update if animation hasn't completed yet
        if (this.failure.frame < this.failure.totalFrames) {
            this.failure.update();
        } else {
            // Animation complete, show restart button
            if (!this.restartButtonShown) {
                this.showRestartButton();
                this.restartButtonShown = true;
            }
        }
    };

    Game.prototype.handleRestart = function() {
        // Hide restart button
        this.hideRestartButton();
        this.restartButtonShown = false;
        
        // Stop any ongoing animations
        if (this.state === 'failure' && this.failure) {
            this.failure.active = false;
        }
        if (this.state === 'outro' && this.outro) {
            this.outro.active = false;
        }
        
        // Stop spawners
        if (this.anvilSpawner) {
            this.anvilSpawner.stop();
        }
        if (this.birdSpawner) {
            this.birdSpawner.stop();
        }
        
        // Reset state and restart level
        this.state = 'playing';
        this.restartLevel();
    };

    Game.prototype.showRestartButton = function() {
        var restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.classList.add('show');
        }
        var restartHint = document.getElementById('restartHint');
        if (restartHint) {
            restartHint.classList.add('show');
        }
    };

    Game.prototype.hideRestartButton = function() {
        var restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.classList.remove('show');
        }
        var restartHint = document.getElementById('restartHint');
        if (restartHint) {
            restartHint.classList.remove('show');
        }
    };

    Game.prototype.restartLevel = function() {
        // Reset player position
        var start = this.level.data.playerStart;
        this.player.reset(start.x, start.y);

        // Reset level elements
        this.level.reset();

        // Reset and restart spawners
        if (this.anvilSpawner) {
            this.anvilSpawner.reset();
            this.anvilSpawner.start();
        }
        if (this.birdSpawner) {
            this.birdSpawner.reset();
            this.birdSpawner.start();
        }

        // Reset camera
        this.cameraX = 0;
        this.cameraY = 0;

        // Reset text box for level 1
        if (this.currentLevel === 1) {
            this.initialTextShown = false;
            this.textBoxTimer = 0;
        }
    };

    Game.prototype.draw = function() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.state === 'outro' || this.state === 'complete') {
            this.outro.draw(this.ctx);
            return;
        }

        if (this.state === 'failure') {
            this.failure.draw(this.ctx);
            return;
        }

        // Draw level
        this.level.draw(this.ctx, this.cameraX, this.cameraY);

        // Draw birds (level 2)
        if (this.birdSpawner) {
            this.birdSpawner.draw(this.ctx, this.cameraX, this.cameraY);
        }

        // Draw anvils (level 3)
        if (this.anvilSpawner) {
            this.anvilSpawner.draw(this.ctx, this.cameraX, this.cameraY);
        }

        // Draw player
        this.player.draw(this.ctx, this.cameraX, this.cameraY);

        // Draw text box
        this.textBox.draw(this.ctx, this.cameraX, this.cameraY);

        // Draw transition overlay
        if (this.state === 'transition') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, ' + this.transitionAlpha + ')';
            this.ctx.fillRect(0, 0, this.width, this.height);

            // Level name during transition
            if (this.transitionAlpha > 0.5) {
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = 'bold 32px Courier New';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                var levelName = '';
                if (this.nextLevel === 1) {
                    levelName = 'Level 1: The House';
                } else if (this.nextLevel === 2) {
                    levelName = 'Level 2: The Sky';
                } else if (this.nextLevel === 3) {
                    levelName = 'Level 3: Heaven';
                }
                this.ctx.fillText(levelName, this.width / 2, this.height / 2);
            }
        }

        // Draw game complete screen
        if (this.state === 'complete') {
            // Handled by outro
        }
    };

    return Game;
})();

// Start game when page loads
window.onload = function() {
    new Game();
};
