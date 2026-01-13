// Hamburger class - the goal object with interaction
var Hamburger = (function() {
    function Hamburger(x, y) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 60;
        this.pedestalWidth = 100;
        this.pedestalHeight = 40;
        this.interactionDistance = 80;
        this.playerNear = false;
        this.eating = false;
        this.eatingProgress = 0;
        this.eatingDuration = 120; // frames
        this.eaten = false;
        this.floatOffset = 0;
        
        // Colors
        this.bunColor = '#D4A574';
        this.bunTopColor = '#E8C49B';
        this.pattyColor = '#8B4513';
        this.lettuceColor = '#228B22';
        this.cheeseColor = '#FFD700';
        this.pedestalColor = '#808080';
        this.pedestalTopColor = '#A0A0A0';
    }

    Hamburger.prototype.checkProximity = function(player) {
        var centerX = this.x + this.width / 2;
        var centerY = this.y + this.height / 2;
        var playerCenterX = player.x + player.width / 2;
        var playerCenterY = player.y + player.height / 2;

        var dx = centerX - playerCenterX;
        var dy = centerY - playerCenterY;
        var distance = Math.sqrt(dx * dx + dy * dy);

        this.playerNear = distance < this.interactionDistance && !this.eating && !this.eaten;
        return this.playerNear;
    };

    Hamburger.prototype.startEating = function() {
        if (this.playerNear && !this.eating && !this.eaten) {
            this.eating = true;
            this.eatingProgress = 0;
            return true;
        }
        return false;
    };

    Hamburger.prototype.update = function() {
        // Float animation
        this.floatOffset = Math.sin(Date.now() / 500) * 5;

        if (this.eating) {
            this.eatingProgress++;
            if (this.eatingProgress >= this.eatingDuration) {
                this.eating = false;
                this.eaten = true;
                return true; // Signal that eating is complete
            }
        }
        return false;
    };

    Hamburger.prototype.draw = function(ctx, cameraX, cameraY) {
        var drawX = this.x - cameraX;
        var drawY = this.y - cameraY + this.floatOffset;
        var pedestalDrawX = this.x - (this.pedestalWidth - this.width) / 2 - cameraX;
        var pedestalDrawY = this.y + this.height - cameraY;

        // Draw pedestal
        ctx.fillStyle = this.pedestalColor;
        ctx.fillRect(pedestalDrawX, pedestalDrawY, this.pedestalWidth, this.pedestalHeight);
        
        // Pedestal top
        ctx.fillStyle = this.pedestalTopColor;
        ctx.fillRect(pedestalDrawX, pedestalDrawY, this.pedestalWidth, 8);
        
        // Pedestal outline
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 2;
        ctx.strokeRect(pedestalDrawX, pedestalDrawY, this.pedestalWidth, this.pedestalHeight);

        if (this.eaten) return;

        // Eating animation - burger shrinks
        var scale = 1;
        if (this.eating) {
            scale = 1 - (this.eatingProgress / this.eatingDuration) * 0.8;
            // Add shake
            drawX += Math.sin(this.eatingProgress * 0.5) * 3;
        }

        var w = this.width * scale;
        var h = this.height * scale;
        var offsetX = (this.width - w) / 2;
        var offsetY = (this.height - h) / 2;

        ctx.save();

        // Top bun
        ctx.fillStyle = this.bunTopColor;
        ctx.beginPath();
        ctx.ellipse(drawX + this.width / 2, drawY + offsetY + 12 * scale, w / 2, 15 * scale, 0, Math.PI, 0);
        ctx.fill();
        
        ctx.fillStyle = this.bunColor;
        ctx.fillRect(drawX + offsetX, drawY + offsetY + 10 * scale, w, 15 * scale);

        // Sesame seeds
        if (!this.eating) {
            ctx.fillStyle = '#FFFACD';
            ctx.beginPath();
            ctx.ellipse(drawX + this.width / 2 - 15, drawY + offsetY + 5, 4, 2, 0.3, 0, Math.PI * 2);
            ctx.ellipse(drawX + this.width / 2 + 10, drawY + offsetY + 3, 4, 2, -0.2, 0, Math.PI * 2);
            ctx.ellipse(drawX + this.width / 2, drawY + offsetY + 8, 4, 2, 0.1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Lettuce (wavy)
        ctx.fillStyle = this.lettuceColor;
        ctx.beginPath();
        ctx.moveTo(drawX + offsetX - 5, drawY + offsetY + 25 * scale);
        for (var i = 0; i <= w + 10; i += 10) {
            ctx.lineTo(drawX + offsetX - 5 + i, drawY + offsetY + 25 * scale + (i % 20 === 0 ? 5 : 0) * scale);
        }
        ctx.lineTo(drawX + offsetX + w + 5, drawY + offsetY + 30 * scale);
        ctx.lineTo(drawX + offsetX - 5, drawY + offsetY + 30 * scale);
        ctx.closePath();
        ctx.fill();

        // Cheese
        ctx.fillStyle = this.cheeseColor;
        ctx.beginPath();
        ctx.moveTo(drawX + offsetX - 3, drawY + offsetY + 30 * scale);
        ctx.lineTo(drawX + offsetX + w + 3, drawY + offsetY + 30 * scale);
        ctx.lineTo(drawX + offsetX + w + 8, drawY + offsetY + 38 * scale);
        ctx.lineTo(drawX + offsetX - 8, drawY + offsetY + 38 * scale);
        ctx.closePath();
        ctx.fill();

        // Patty
        ctx.fillStyle = this.pattyColor;
        ctx.beginPath();
        ctx.ellipse(drawX + this.width / 2, drawY + offsetY + 42 * scale, w / 2 + 3, 8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bottom bun
        ctx.fillStyle = this.bunColor;
        ctx.fillRect(drawX + offsetX, drawY + offsetY + 45 * scale, w, 12 * scale);
        ctx.beginPath();
        ctx.ellipse(drawX + this.width / 2, drawY + offsetY + 57 * scale, w / 2, 5 * scale, 0, 0, Math.PI);
        ctx.fill();

        // Glow effect when player is near
        if (this.playerNear && !this.eating) {
            ctx.strokeStyle = 'rgba(255, 215, 0, ' + (0.5 + Math.sin(Date.now() / 200) * 0.3) + ')';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.ellipse(drawX + this.width / 2, drawY + this.height / 2, w / 2 + 10, h / 2 + 10, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    };

    Hamburger.prototype.reset = function() {
        this.playerNear = false;
        this.eating = false;
        this.eatingProgress = 0;
        this.eaten = false;
    };

    return Hamburger;
})();
