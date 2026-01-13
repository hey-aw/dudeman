// Anvil class - falling hazards that create holes in clouds
var Anvil = (function() {
    function Anvil(x, y) {
        this.x = x;
        this.y = y;
        this.width = 70;
        this.height = 50;
        this.vy = 0;
        this.gravity = 0.4;
        this.maxSpeed = 12;
        this.active = true;
        this.hitCloud = false;
        this.baseColor = '#4A4A4A';
        this.highlightColor = '#6A6A6A';
        this.shadowColor = '#2A2A2A';
    }

    Anvil.prototype.update = function() {
        if (!this.active) return;

        // Apply gravity
        this.vy += this.gravity;
        if (this.vy > this.maxSpeed) this.vy = this.maxSpeed;

        this.y += this.vy;

        // Deactivate if fallen too far
        if (this.y > 2000) {
            this.active = false;
        }
    };

    Anvil.prototype.checkPlayerCollision = function(player) {
        if (!this.active) return false;

        return player.x < this.x + this.width &&
               player.x + player.width > this.x &&
               player.y < this.y + this.height &&
               player.y + player.height > this.y;
    };

    Anvil.prototype.checkCloudCollision = function(cloud) {
        if (!this.active || this.hitCloud || cloud.destroyed) return false;

        // Check if anvil is hitting the cloud from above
        if (this.x < cloud.x + cloud.width &&
            this.x + this.width > cloud.x &&
            this.y + this.height > cloud.y &&
            this.y < cloud.y + cloud.height &&
            this.vy > 0) {
            
            // Create hole in cloud where anvil hit
            var holeCenter = this.x + this.width / 2;
            cloud.createHole(holeCenter - 30, 60);
            
            this.hitCloud = true;
            
            // Anvil continues falling through
            return true;
        }

        return false;
    };

    Anvil.prototype.draw = function(ctx, cameraX, cameraY) {
        if (!this.active) return;

        var drawX = this.x - cameraX;
        var drawY = this.y - cameraY;

        // Comically large anvil shape
        ctx.save();

        // Main body
        ctx.fillStyle = this.baseColor;
        
        // Top flat part
        ctx.fillRect(drawX, drawY, this.width, 15);
        
        // Middle narrower part
        ctx.fillRect(drawX + 10, drawY + 15, this.width - 20, 20);
        
        // Bottom wide part
        ctx.fillRect(drawX - 5, drawY + 35, this.width + 10, 15);

        // Highlight on top
        ctx.fillStyle = this.highlightColor;
        ctx.fillRect(drawX + 5, drawY + 2, this.width - 10, 5);

        // Shadow on bottom
        ctx.fillStyle = this.shadowColor;
        ctx.fillRect(drawX - 5, drawY + 45, this.width + 10, 5);

        // Outline
        ctx.strokeStyle = '#1A1A1A';
        ctx.lineWidth = 2;
        
        // Top outline
        ctx.strokeRect(drawX, drawY, this.width, 15);
        
        // Middle outline
        ctx.strokeRect(drawX + 10, drawY + 15, this.width - 20, 20);
        
        // Bottom outline
        ctx.strokeRect(drawX - 5, drawY + 35, this.width + 10, 15);

        // "ACME" text
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ACME', drawX + this.width / 2, drawY + 28);

        ctx.restore();
    };

    return Anvil;
})();

// AnvilSpawner - manages spawning anvils
var AnvilSpawner = (function() {
    function AnvilSpawner(levelWidth, spawnY) {
        this.levelWidth = levelWidth;
        this.spawnY = spawnY || -100;
        this.anvils = [];
        this.spawnTimer = 0;
        this.spawnInterval = 120; // frames between spawns (reduced from 180)
        this.minSpawnInterval = 60; // reduced from 90
        this.active = false;
    }

    AnvilSpawner.prototype.start = function() {
        this.active = true;
        this.spawnTimer = this.spawnInterval;
    };

    AnvilSpawner.prototype.stop = function() {
        this.active = false;
    };

    AnvilSpawner.prototype.update = function(player, clouds) {
        if (!this.active) return null;

        this.spawnTimer--;

        // Spawn new anvil
        if (this.spawnTimer <= 0) {
            var spawnX = 100 + Math.random() * (this.levelWidth - 200);
            this.anvils.push(new Anvil(spawnX, this.spawnY));
            
            // Randomize next spawn time
            this.spawnTimer = this.minSpawnInterval + Math.random() * (this.spawnInterval - this.minSpawnInterval);
        }

        // Update anvils and check collisions
        var playerHit = false;
        for (var i = this.anvils.length - 1; i >= 0; i--) {
            var anvil = this.anvils[i];
            anvil.update();

            // Check player collision
            if (anvil.checkPlayerCollision(player)) {
                playerHit = true;
            }

            // Check cloud collisions
            if (clouds) {
                for (var j = 0; j < clouds.length; j++) {
                    anvil.checkCloudCollision(clouds[j]);
                }
            }

            // Remove inactive anvils
            if (!anvil.active) {
                this.anvils.splice(i, 1);
            }
        }

        return playerHit;
    };

    AnvilSpawner.prototype.draw = function(ctx, cameraX, cameraY) {
        for (var i = 0; i < this.anvils.length; i++) {
            this.anvils[i].draw(ctx, cameraX, cameraY);
        }
    };

    AnvilSpawner.prototype.reset = function() {
        this.anvils = [];
        this.spawnTimer = this.spawnInterval;
    };

    return AnvilSpawner;
})();
