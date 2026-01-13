// Cloud class - cloud platforms that can be bouncy or solid, can have holes
var Cloud = (function() {
    function Cloud(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width || 150;
        this.height = height || 40;
        this.bounceForce = -18;
        this.bounceAnimation = 0;
        this.holes = []; // Array of {x, width} representing holes in the cloud
        this.baseColor = '#FFFFFF';
        this.shadowColor = '#E8E8E8';
        this.destroyed = false;
        this.isBouncy = true; // Default to bouncy, can be set to false for solid platforms
    }

    Cloud.prototype.bounce = function() {
        this.bounceAnimation = 1;
    };

    Cloud.prototype.update = function() {
        if (this.bounceAnimation > 0) {
            this.bounceAnimation -= 0.08;
            if (this.bounceAnimation < 0) this.bounceAnimation = 0;
        }
    };

    Cloud.prototype.createHole = function(holeX, holeWidth) {
        // holeX is relative to cloud x position
        this.holes.push({
            x: holeX - this.x,
            width: holeWidth || 60
        });

        // Check if cloud is completely destroyed
        this.checkDestroyed();
    };

    Cloud.prototype.checkDestroyed = function() {
        // Calculate total hole coverage
        var totalHoleWidth = 0;
        for (var i = 0; i < this.holes.length; i++) {
            totalHoleWidth += this.holes[i].width;
        }
        if (totalHoleWidth >= this.width * 0.8) {
            this.destroyed = true;
        }
    };

    Cloud.prototype.checkPlayerCollision = function(player) {
        if (this.destroyed) return false;

        // Basic bounding box check first
        if (!(player.x < this.x + this.width &&
              player.x + player.width > this.x &&
              player.y < this.y + this.height &&
              player.y + player.height > this.y)) {
            return false;
        }

        // Check if player is over a hole
        var playerCenterX = player.x + player.width / 2;
        for (var i = 0; i < this.holes.length; i++) {
            var hole = this.holes[i];
            var holeLeft = this.x + hole.x;
            var holeRight = holeLeft + hole.width;
            if (playerCenterX > holeLeft && playerCenterX < holeRight) {
                return false; // Player falls through hole
            }
        }

        return true;
    };

    Cloud.prototype.draw = function(ctx, cameraX, cameraY) {
        if (this.destroyed) return;

        var drawX = this.x - cameraX;
        var drawY = this.y - cameraY;

        // Bounce effect
        var bounce = Math.sin(this.bounceAnimation * Math.PI) * 5;

        ctx.save();

        // Create clipping region to exclude holes
        ctx.beginPath();
        ctx.rect(drawX, drawY - bounce, this.width, this.height + bounce);
        
        // Cut out holes
        for (var i = 0; i < this.holes.length; i++) {
            var hole = this.holes[i];
            ctx.rect(drawX + hole.x + hole.width, drawY - bounce, -hole.width, this.height + bounce);
        }
        ctx.clip('evenodd');

        // Draw cloud shape (fluffy)
        ctx.fillStyle = this.baseColor;
        
        // Main body
        this.drawCloudShape(ctx, drawX, drawY - bounce, this.width, this.height + bounce);

        // Shadow on bottom
        ctx.fillStyle = this.shadowColor;
        ctx.beginPath();
        ctx.ellipse(drawX + this.width / 2, drawY + this.height - 5 + bounce, this.width / 2 - 10, 10, 0, 0, Math.PI);
        ctx.fill();

        ctx.restore();

        // Draw hole edges (jagged)
        for (var j = 0; j < this.holes.length; j++) {
            var h = this.holes[j];
            ctx.strokeStyle = '#CCCCCC';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(drawX + h.x, drawY);
            ctx.lineTo(drawX + h.x, drawY + this.height);
            ctx.moveTo(drawX + h.x + h.width, drawY);
            ctx.lineTo(drawX + h.x + h.width, drawY + this.height);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    };

    Cloud.prototype.drawCloudShape = function(ctx, x, y, width, height) {
        // Draw cloud as rounded rectangle
        var cornerRadius = Math.min(width, height) * 0.3; // 30% of smaller dimension
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, cornerRadius);
        ctx.fill();
    };

    return Cloud;
})();
