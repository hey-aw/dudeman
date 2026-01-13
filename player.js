// Player class - handles player sprite, movement, and physics
var Player = (function() {
    function Player(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.jumpForce = -14;
        this.gravity = 0.6;
        this.friction = 0.85;
        this.grounded = false;
        this.state = 'idle'; // idle, running, jumping
        this.facingRight = true;
        this.color = '#4A90D9';
        this.outlineColor = '#2E5A8A';
        // Maximum Y position the player can fall to (clamped per-level). Null means no clamp.
        this.maxFallY = null;
    }

    Player.prototype.update = function(keys, platforms, trampolines, clouds) {
        // Horizontal movement
        if (keys.left) {
            this.vx = -this.speed;
            this.facingRight = false;
            if (this.grounded) this.state = 'running';
        } else if (keys.right) {
            this.vx = this.speed;
            this.facingRight = true;
            if (this.grounded) this.state = 'running';
        } else {
            this.vx *= this.friction;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;
            if (this.grounded) this.state = 'idle';
        }

        // Jump
        if (keys.jump && this.grounded) {
            this.vy = this.jumpForce;
            this.grounded = false;
            this.state = 'jumping';
        }

        // Apply gravity
        this.vy += this.gravity;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Reset grounded
        this.grounded = false;

        // Platform collision
        this.handlePlatformCollisions(platforms);

        // Trampoline collision
        if (trampolines) {
            this.handleTrampolineCollisions(trampolines);
        }

        // Cloud collision
        if (clouds) {
            this.handleCloudCollisions(clouds);
        }

        // Prevent falling below level bounds (safety). Only clamp if a limit is set.
        if (this.maxFallY !== null && this.y > this.maxFallY) {
            this.y = this.maxFallY;
            this.vy = 0;
            this.grounded = true;
        }

        // Update state
        if (!this.grounded && this.state !== 'jumping') {
            this.state = 'jumping';
        }
    };

    Player.prototype.handlePlatformCollisions = function(platforms) {
        for (var i = 0; i < platforms.length; i++) {
            var plat = platforms[i];
            if (this.checkCollision(plat)) {
                // Determine collision side
                var overlapLeft = (this.x + this.width) - plat.x;
                var overlapRight = (plat.x + plat.width) - this.x;
                var overlapTop = (this.y + this.height) - plat.y;
                var overlapBottom = (plat.y + plat.height) - this.y;

                var minOverlapX = Math.min(overlapLeft, overlapRight);
                var minOverlapY = Math.min(overlapTop, overlapBottom);

                if (minOverlapY < minOverlapX) {
                    // Vertical collision
                    if (overlapTop < overlapBottom && this.vy > 0) {
                        // Landing on top
                        this.y = plat.y - this.height;
                        this.vy = 0;
                        this.grounded = true;
                    } else if (overlapBottom < overlapTop && this.vy < 0) {
                        // Hitting from below
                        this.y = plat.y + plat.height;
                        this.vy = 0;
                    }
                } else {
                    // Horizontal collision
                    if (overlapLeft < overlapRight) {
                        this.x = plat.x - this.width;
                    } else {
                        this.x = plat.x + plat.width;
                    }
                    this.vx = 0;
                }
            }
        }
    };

    Player.prototype.handleTrampolineCollisions = function(trampolines) {
        for (var i = 0; i < trampolines.length; i++) {
            var tramp = trampolines[i];
            if (this.checkCollision(tramp) && this.vy > 0) {
                // Bounce!
                this.y = tramp.y - this.height;
                this.vy = tramp.bounceForce;
                this.grounded = false;
                tramp.bounce();
            }
        }
    };

    Player.prototype.handleCloudCollisions = function(clouds) {
        for (var i = 0; i < clouds.length; i++) {
            var cloud = clouds[i];
            if (cloud.checkPlayerCollision(this) && this.vy > 0) {
                this.y = cloud.y - this.height;
                
                if (cloud.isBouncy) {
                    // Bounce off cloud!
                    this.vy = cloud.bounceForce;
                    this.grounded = false;
                    cloud.bounce();
                } else {
                    // Land on cloud like a platform
                    this.vy = 0;
                    this.grounded = true;
                }
            }
        }
    };

    Player.prototype.checkCollision = function(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    };

    Player.prototype.draw = function(ctx, cameraX, cameraY) {
        var drawX = this.x - cameraX;
        var drawY = this.y - cameraY;

        // Body
        ctx.fillStyle = this.color;
        ctx.fillRect(drawX, drawY, this.width, this.height);

        // Outline
        ctx.strokeStyle = this.outlineColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(drawX, drawY, this.width, this.height);

        // Eyes
        var eyeOffsetX = this.facingRight ? 10 : 5;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(drawX + eyeOffsetX, drawY + 15, 10, 10);
        ctx.fillRect(drawX + eyeOffsetX + 15, drawY + 15, 10, 10);

        // Pupils
        var pupilOffset = this.facingRight ? 4 : 0;
        ctx.fillStyle = '#000000';
        ctx.fillRect(drawX + eyeOffsetX + pupilOffset + 2, drawY + 18, 4, 6);
        ctx.fillRect(drawX + eyeOffsetX + 15 + pupilOffset + 2, drawY + 18, 4, 6);

        // Legs animation
        var legOffset = 0;
        if (this.state === 'running') {
            legOffset = Math.sin(Date.now() / 100) * 5;
        }
        ctx.fillStyle = this.outlineColor;
        ctx.fillRect(drawX + 5, drawY + this.height, 10, 10 + legOffset);
        ctx.fillRect(drawX + 25, drawY + this.height, 10, 10 - legOffset);
    };

    Player.prototype.reset = function(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.grounded = false;
        this.state = 'idle';
    };

    return Player;
})();
