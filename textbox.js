// TextBox class - displays messages above player or objects
var TextBox = (function() {
    function TextBox() {
        this.active = false;
        this.text = '';
        this.x = 0;
        this.y = 0;
        this.targetObject = null;
        this.offsetY = -60;
        this.padding = 15;
        this.backgroundColor = '#FFFFFF';
        this.borderColor = '#333333';
        this.textColor = '#333333';
        this.font = 'bold 16px Courier New';
        this.fadeIn = 0;
        this.maxFade = 1;
    }

    TextBox.prototype.show = function(text, targetObject) {
        this.active = true;
        this.text = text;
        this.targetObject = targetObject;
        this.fadeIn = 0.1; // Start with slight visibility for immediate feedback
    };

    TextBox.prototype.hide = function() {
        this.active = false;
        this.text = '';
        this.targetObject = null;
        this.fadeIn = 0;
    };

    TextBox.prototype.update = function() {
        if (this.active && this.fadeIn < this.maxFade) {
            this.fadeIn += 0.05;
            if (this.fadeIn > this.maxFade) this.fadeIn = this.maxFade;
        }

        if (this.targetObject) {
            this.x = this.targetObject.x + this.targetObject.width / 2;
            this.y = this.targetObject.y + this.offsetY;
        }
    };

    TextBox.prototype.draw = function(ctx, cameraX, cameraY) {
        if (!this.active || this.fadeIn <= 0) return;

        var drawX = this.x - cameraX;
        var drawY = this.y - cameraY;

        ctx.save();
        ctx.globalAlpha = this.fadeIn;

        // Measure text
        ctx.font = this.font;
        var textWidth = ctx.measureText(this.text).width;
        var boxWidth = textWidth + this.padding * 2;
        var boxHeight = 30;

        // Center the box
        var boxX = drawX - boxWidth / 2;
        var boxY = drawY;

        // Keep box on screen (clamp to canvas bounds)
        var canvasWidth = ctx.canvas.width;
        var canvasHeight = ctx.canvas.height;
        if (boxX < 10) boxX = 10;
        if (boxX + boxWidth > canvasWidth - 10) boxX = canvasWidth - boxWidth - 10;
        if (boxY < 10) boxY = 10;
        if (boxY + boxHeight > canvasHeight - 10) boxY = canvasHeight - boxHeight - 10;
        
        // Update drawX for text centering (use box center)
        drawX = boxX + boxWidth / 2;
        
        // Draw box background
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // Draw border
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Draw speech bubble tail
        ctx.fillStyle = this.backgroundColor;
        ctx.beginPath();
        ctx.moveTo(drawX - 8, boxY + boxHeight);
        ctx.lineTo(drawX, boxY + boxHeight + 10);
        ctx.lineTo(drawX + 8, boxY + boxHeight);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = this.borderColor;
        ctx.stroke();

        // Draw text
        ctx.fillStyle = this.textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, drawX, boxY + boxHeight / 2);

        ctx.restore();
    };

    TextBox.prototype.roundRect = function(ctx, x, y, width, height, radius) {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
    };

    return TextBox;
})();
