// Bird class - flying hazards that move left to right or right to left
var Bird = (function() {
    function Bird(x, y, speed, facingRight) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 30;
        this.speed = speed || 4;
        this.facingRight = facingRight !== false; // default true (flying right)
        this.wingPhase = Math.random() * Math.PI * 2;
        this.color = '#2C2C2C';
        this.beakColor = '#FF8C00';
        this.eyeColor = '#FFFFFF';
    }

    Bird.prototype.update = function() {
        if (this.facingRight) {
            this.x += this.speed;
        } else {
            this.x -= this.speed;
        }
        this.wingPhase += 0.3;
    };

    Bird.prototype.checkPlayerCollision = function(player) {
        // Slightly smaller hitbox for fairness
        var hitboxPadding = 5;
        return player.x + hitboxPadding < this.x + this.width - hitboxPadding &&
               player.x + player.width - hitboxPadding > this.x + hitboxPadding &&
               player.y + hitboxPadding < this.y + this.height - hitboxPadding &&
               player.y + player.height - hitboxPadding > this.y + hitboxPadding;
    };

    Bird.prototype.draw = function(ctx, cameraX, cameraY) {
        var drawX = this.x - cameraX;
        var drawY = this.y - cameraY;

        // Wing animation
        var wingOffset = Math.sin(this.wingPhase) * 8;

        ctx.save();

        // Flip horizontally if facing left
        if (!this.facingRight) {
            ctx.translate(drawX + this.width / 2, drawY + this.height / 2);
            ctx.scale(-1, 1);
            ctx.translate(-(drawX + this.width / 2), -(drawY + this.height / 2));
        }

        // Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(drawX + this.width / 2, drawY + this.height / 2, this.width / 2 - 5, this.height / 2 - 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.fillStyle = '#3D3D3D';
        // Top wing
        ctx.beginPath();
        ctx.moveTo(drawX + 10, drawY + this.height / 2);
        ctx.quadraticCurveTo(drawX + this.width / 2, drawY - 10 + wingOffset, drawX + this.width - 10, drawY + this.height / 2);
        ctx.quadraticCurveTo(drawX + this.width / 2, drawY + 5 + wingOffset, drawX + 10, drawY + this.height / 2);
        ctx.fill();

        // Head
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(drawX + this.width - 8, drawY + this.height / 2, 10, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = this.beakColor;
        ctx.beginPath();
        ctx.moveTo(drawX + this.width, drawY + this.height / 2);
        ctx.lineTo(drawX + this.width + 12, drawY + this.height / 2 + 2);
        ctx.lineTo(drawX + this.width, drawY + this.height / 2 + 6);
        ctx.closePath();
        ctx.fill();

        // Eye
        ctx.fillStyle = this.eyeColor;
        ctx.beginPath();
        ctx.arc(drawX + this.width - 5, drawY + this.height / 2 - 2, 3, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(drawX + this.width - 4, drawY + this.height / 2 - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Tail feathers
        ctx.fillStyle = '#3D3D3D';
        ctx.beginPath();
        ctx.moveTo(drawX + 5, drawY + this.height / 2 - 3);
        ctx.lineTo(drawX - 10, drawY + this.height / 2 - 8);
        ctx.lineTo(drawX + 5, drawY + this.height / 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(drawX + 5, drawY + this.height / 2 + 3);
        ctx.lineTo(drawX - 10, drawY + this.height / 2 + 8);
        ctx.lineTo(drawX + 5, drawY + this.height / 2);
        ctx.fill();

        ctx.restore();
    };

    return Bird;
})();

// Bird Spawner - manages multiple birds
var BirdSpawner = (function() {
    function BirdSpawner(levelWidth, levelHeight) {
        this.levelWidth = levelWidth;
        this.levelHeight = levelHeight;
        this.birds = [];
        this.spawnTimer = 0;
        this.spawnInterval = 70; // frames between spawns (faster)
        this.minSpawnInterval = 30;
        this.active = false;
        this.difficulty = 1;
    }

    BirdSpawner.prototype.start = function() {
        this.active = true;
        this.birds = [];
        this.spawnTimer = 0;
        this.difficulty = 1;
    };

    BirdSpawner.prototype.stop = function() {
        this.active = false;
    };

    BirdSpawner.prototype.reset = function() {
        this.birds = [];
        this.spawnTimer = 0;
        this.difficulty = 1;
    };

    BirdSpawner.prototype.update = function(player) {
        if (!this.active) return false;

        this.spawnTimer++;

        // Increase difficulty over time
        this.difficulty = Math.min(3, 1 + this.spawnTimer / 1000);

        // Spawn new birds
        var currentInterval = Math.max(this.minSpawnInterval, this.spawnInterval / this.difficulty);
        if (this.spawnTimer >= currentInterval) {
            // Always spawn one bird
            var firstDirection = this.spawnBird(player);
            // Often spawn a second from the opposite side to mix directions
            if (Math.random() < 0.6) {
                this.spawnBird(player, !firstDirection);
            }
            this.spawnTimer = 0;
        }

        // Update existing birds
        for (var i = this.birds.length - 1; i >= 0; i--) {
            var bird = this.birds[i];
            bird.update();

            // Check player collision
            if (bird.checkPlayerCollision(player)) {
                return true; // Player hit!
            }

            // Remove birds that have flown off screen (either direction)
            if (bird.x > this.levelWidth + 100 || bird.x < -100) {
                this.birds.splice(i, 1);
            }
        }

        return false;
    };

    BirdSpawner.prototype.spawnBird = function(player, forceFacingRight) {
        // Spawn bird at varying heights near player
        var minY = Math.max(50, player.y - 300);
        var maxY = Math.min(this.levelHeight - 100, player.y + 200);
        var y = minY + Math.random() * (maxY - minY);

        // Vary speed based on difficulty
        var baseSpeed = 3 + Math.random() * 2;
        var speed = baseSpeed * (0.8 + this.difficulty * 0.2);

        // Choose direction (optionally forced)
        var facingRight = forceFacingRight !== undefined ? forceFacingRight : Math.random() > 0.5;
        var spawnX;

        if (facingRight) {
            // Spawn from left side, fly right
            spawnX = player.x - 600;
        } else {
            // Spawn from right side, fly left
            spawnX = player.x + 600;
        }

        this.birds.push(new Bird(spawnX, y, speed, facingRight));
        return facingRight;
    };

    BirdSpawner.prototype.draw = function(ctx, cameraX, cameraY) {
        for (var i = 0; i < this.birds.length; i++) {
            this.birds[i].draw(ctx, cameraX, cameraY);
        }
    };

    return BirdSpawner;
})();
