// Trampoline class - bouncy platforms
var Trampoline = (function() {
    function Trampoline(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width || 80;
        this.height = height || 20;
        this.bounceForce = -22;
        this.bounceAnimation = 0;
        this.baseColor = '#FF6B35';
        this.stripeColor = '#FFB347';
        this.frameColor = '#8B4513';
    }

    Trampoline.prototype.bounce = function() {
        this.bounceAnimation = 1;
    };

    Trampoline.prototype.update = function() {
        if (this.bounceAnimation > 0) {
            this.bounceAnimation -= 0.1;
            if (this.bounceAnimation < 0) this.bounceAnimation = 0;
        }
    };

    Trampoline.prototype.draw = function(ctx, cameraX, cameraY) {
        var drawX = this.x - cameraX;
        var drawY = this.y - cameraY;

        // Bounce squash effect
        var squash = this.bounceAnimation * 5;
        var stretch = this.bounceAnimation * 3;

        // Frame/legs
        ctx.fillStyle = this.frameColor;
        ctx.fillRect(drawX + 5, drawY + this.height - squash, 8, 15 + squash);
        ctx.fillRect(drawX + this.width - 13, drawY + this.height - squash, 8, 15 + squash);

        // Main surface
        ctx.fillStyle = this.baseColor;
        ctx.fillRect(drawX, drawY - stretch, this.width, this.height + squash);

        // Stripes
        ctx.fillStyle = this.stripeColor;
        var stripeWidth = 10;
        for (var i = 5; i < this.width - 5; i += 20) {
            ctx.fillRect(drawX + i, drawY - stretch + 3, stripeWidth, this.height + squash - 6);
        }

        // Border
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.strokeRect(drawX, drawY - stretch, this.width, this.height + squash);
    };

    return Trampoline;
})();
