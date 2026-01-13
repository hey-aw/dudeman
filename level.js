// Level data and rendering system
var Level = (function() {
    // Level 1: House Tutorial
    var level1 = {
        name: 'House',
        width: 1200,
        height: 600,
        playerStart: { x: 50, y: 400 },
        backgroundColor: '#87CEEB', // Sky blue
        
        // Single grass floor platform
        platforms: [
            { x: 0, y: 520, width: 1200, height: 80, color: '#228B22', type: 'grass' }
        ],
        
        // Exit pedestal at far right
        exitPlatform: { x: 1050, y: 460, width: 80, height: 60 },
        
        // House background elements (decorative only)
        background: {
            house: {
                x: 150,
                y: 280,
                width: 300,
                height: 240,
                wallColor: '#F5DEB3',
                roofColor: '#8B4513',
                doorColor: '#8B4513',
                windowColor: '#87CEEB'
            },
            sun: { x: 700, y: 80, radius: 50, color: '#FFD700' },
            clouds: [
                { x: 100, y: 60, width: 100, height: 40 },
                { x: 400, y: 100, width: 120, height: 50 },
                { x: 800, y: 50, width: 90, height: 35 }
            ],
            trees: [
                { x: 550, y: 400, trunkWidth: 30, trunkHeight: 120, foliageRadius: 50 },
                { x: 700, y: 420, trunkWidth: 25, trunkHeight: 100, foliageRadius: 40 }
            ]
        },
        
        trampolines: [],
        clouds: [],
        cloudsAreBouncy: false
    };

    // Level 2: Sky - Long horizontal climb with bouncy clouds, avoid birds
    var level2 = {
        name: 'Sky',
        width: 4000,
        height: 2000,
        playerStart: { x: 100, y: 1840 },  // y = ground(1900) - playerHeight(60) = on ground
        backgroundColor: '#4A90D9',
        
        // Ground platform - starts at left edge, falls away as cliff edge at x: 600
        platforms: [
            { x: 0, y: 1900, width: 600, height: 100, color: '#90EE90', type: 'grass' }
        ],
        
        // Trampoline at the cliff edge to help reach first cloud
        trampolineData: [
            { x: 480, y: 1880, width: 100, height: 20 }
        ],
        
        // Cloud platforms - long challenging climb with bouncy clouds
        cloudData: [
            // === SECTION 1: Initial ascent (reachable from cliff edge) ===
            { x: 550, y: 1750, width: 200, height: 50 },  // First cloud - jump from cliff/trampoline
            { x: 750, y: 1600, width: 180, height: 50 },
            { x: 500, y: 1450, width: 200, height: 50 },
            { x: 750, y: 1300, width: 180, height: 45 },
            
            // === SECTION 2: First horizontal stretch ===
            { x: 500, y: 1200, width: 200, height: 50 },
            { x: 750, y: 1150, width: 180, height: 45 },
            { x: 1000, y: 1100, width: 220, height: 55 },
            { x: 1250, y: 1050, width: 180, height: 45 },
            
            // === SECTION 3: Tricky gaps ===
            { x: 1500, y: 950, width: 140, height: 40 },
            { x: 1750, y: 880, width: 120, height: 35 },
            { x: 1950, y: 800, width: 150, height: 45 },
            { x: 2150, y: 720, width: 130, height: 40 },
            
            // === SECTION 4: Zigzag climb ===
            { x: 2350, y: 650, width: 180, height: 50 },
            { x: 2100, y: 550, width: 160, height: 45 },
            { x: 2350, y: 450, width: 200, height: 50 },
            { x: 2600, y: 380, width: 180, height: 45 },
            
            // === SECTION 5: Final stretch ===
            { x: 2850, y: 320, width: 220, height: 55 },
            { x: 3100, y: 280, width: 200, height: 50 },
            { x: 3350, y: 240, width: 250, height: 55 },
            { x: 3650, y: 200, width: 300, height: 60 }
        ],
        
        cloudsAreBouncy: true,
        
        // Exit to Level 3 (at top right)
        exitPlatform: { x: 3800, y: 140, width: 80, height: 60 },
        
        // Background elements
        background: {
            stars: [],
            decorativeClouds: []
        },
        
        trampolines: [],
        clouds: []
    };

    // Level 3: Heaven - Horizontal traversal, clouds are platforms (not bouncy), avoid anvils
    var level3 = {
        name: 'Heaven',
        width: 2600,
        height: 600,
        playerStart: { x: 100, y: 340 },  // y = firstCloud(400) - playerHeight(60) = on cloud
        backgroundColor: '#E6E6FA', // Lavender heaven sky
        
        // No ground - just clouds
        platforms: [],
        
        // Cloud platforms (horizontal layout, NOT bouncy)
        cloudData: [
            // Starting area
            { x: 50, y: 400, width: 180, height: 50 },
            { x: 320, y: 350, width: 150, height: 45 },
            { x: 550, y: 400, width: 160, height: 50 },
            
            // Middle section - larger gaps, smaller platforms
            { x: 800, y: 320, width: 160, height: 55 },
            { x: 1080, y: 380, width: 140, height: 45 },
            { x: 1320, y: 300, width: 150, height: 50 },
            
            // Final stretch - challenging jumps
            { x: 1580, y: 350, width: 140, height: 45 },
            { x: 1840, y: 280, width: 160, height: 55 },
            { x: 2120, y: 350, width: 180, height: 50 },
            
            // Hamburger platform
            { x: 2350, y: 300, width: 200, height: 60 }
        ],
        
        cloudsAreBouncy: false,
        
        // Hamburger at far right
        hamburgerPosition: { x: 2400, y: 240 },
        
        // Background elements
        background: {
            // Golden gates in background
            gates: { x: 2300, y: 50, width: 300, height: 100 },
            // Halos and sparkles
            halos: [],
            stars: []
        },
        
        trampolines: [],
        clouds: []
    };

    // Initialize stars and decorative clouds for level 2
    for (var i = 0; i < 100; i++) {
        level2.background.stars.push({
            x: Math.random() * level2.width,
            y: Math.random() * 600,
            size: 1 + Math.random() * 2,
            twinkle: Math.random() * Math.PI * 2
        });
    }
    // Decorative background clouds
    for (var dc = 0; dc < 15; dc++) {
        level2.background.decorativeClouds.push({
            x: Math.random() * level2.width,
            y: 100 + Math.random() * 400,
            width: 80 + Math.random() * 120,
            height: 30 + Math.random() * 30,
            opacity: 0.2 + Math.random() * 0.3
        });
    }

    // Initialize stars and halos for level 3
    for (var j = 0; j < 100; j++) {
        level3.background.stars.push({
            x: Math.random() * level3.width,
            y: Math.random() * level3.height,
            size: 1 + Math.random() * 3,
            twinkle: Math.random() * Math.PI * 2
        });
    }
    for (var h = 0; h < 10; h++) {
        level3.background.halos.push({
            x: 200 + Math.random() * (level3.width - 400),
            y: 50 + Math.random() * 150,
            size: 20 + Math.random() * 30
        });
    }

    function Level(levelNumber) {
        this.levelNumber = levelNumber;
        if (levelNumber === 1) {
            this.data = level1;
        } else if (levelNumber === 2) {
            this.data = level2;
        } else {
            this.data = level3;
        }
        this.trampolines = [];
        this.clouds = [];
        this.hamburger = null;
        
        this.init();
    }

    Level.prototype.init = function() {
        // Create trampolines
        if (this.data.trampolineData) {
            for (var i = 0; i < this.data.trampolineData.length; i++) {
                var t = this.data.trampolineData[i];
                this.trampolines.push(new Trampoline(t.x, t.y, t.width, t.height));
            }
        }

        // Create clouds
        if (this.data.cloudData) {
            for (var j = 0; j < this.data.cloudData.length; j++) {
                var c = this.data.cloudData[j];
                var cloud = new Cloud(c.x, c.y, c.width, c.height);
                // Set bounce behavior based on level
                cloud.isBouncy = this.data.cloudsAreBouncy;
                this.clouds.push(cloud);
            }
        }

        // Create hamburger (level 3 only)
        if (this.data.hamburgerPosition) {
            this.hamburger = new Hamburger(
                this.data.hamburgerPosition.x,
                this.data.hamburgerPosition.y
            );
        }
    };

    Level.prototype.update = function() {
        // Update trampolines
        for (var i = 0; i < this.trampolines.length; i++) {
            this.trampolines[i].update();
        }

        // Update clouds
        for (var j = 0; j < this.clouds.length; j++) {
            this.clouds[j].update();
        }

        // Update hamburger
        if (this.hamburger) {
            return this.hamburger.update();
        }

        return false;
    };

    Level.prototype.draw = function(ctx, cameraX, cameraY) {
        // Draw background color
        ctx.fillStyle = this.data.backgroundColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (this.levelNumber === 1) {
            this.drawLevel1Background(ctx, cameraX, cameraY);
        } else if (this.levelNumber === 2) {
            this.drawLevel2Background(ctx, cameraX, cameraY);
        } else {
            this.drawLevel3Background(ctx, cameraX, cameraY);
        }

        // Draw platforms
        this.drawPlatforms(ctx, cameraX, cameraY);

        // Draw trampolines
        for (var i = 0; i < this.trampolines.length; i++) {
            this.trampolines[i].draw(ctx, cameraX, cameraY);
        }

        // Draw clouds
        for (var j = 0; j < this.clouds.length; j++) {
            this.clouds[j].draw(ctx, cameraX, cameraY);
        }

        // Draw hamburger
        if (this.hamburger) {
            this.hamburger.draw(ctx, cameraX, cameraY);
        }

        // Draw exit pedestal (level 1 and 2)
        if ((this.levelNumber === 1 || this.levelNumber === 2) && this.data.exitPlatform) {
            this.drawExitPedestal(ctx, cameraX, cameraY);
        }
    };

    Level.prototype.drawLevel1Background = function(ctx, cameraX, cameraY) {
        var bg = this.data.background;

        // Draw sun
        ctx.fillStyle = bg.sun.color;
        ctx.beginPath();
        ctx.arc(bg.sun.x - cameraX, bg.sun.y - cameraY, bg.sun.radius, 0, Math.PI * 2);
        ctx.fill();

        // Sun rays
        ctx.strokeStyle = bg.sun.color;
        ctx.lineWidth = 3;
        for (var r = 0; r < 12; r++) {
            var angle = (r / 12) * Math.PI * 2;
            var innerR = bg.sun.radius + 10;
            var outerR = bg.sun.radius + 25;
            ctx.beginPath();
            ctx.moveTo(
                bg.sun.x - cameraX + Math.cos(angle) * innerR,
                bg.sun.y - cameraY + Math.sin(angle) * innerR
            );
            ctx.lineTo(
                bg.sun.x - cameraX + Math.cos(angle) * outerR,
                bg.sun.y - cameraY + Math.sin(angle) * outerR
            );
            ctx.stroke();
        }

        // Draw decorative clouds
        ctx.fillStyle = '#FFFFFF';
        for (var c = 0; c < bg.clouds.length; c++) {
            var cloud = bg.clouds[c];
            this.drawCloudShape(ctx, cloud.x - cameraX, cloud.y - cameraY, cloud.width, cloud.height);
        }

        // Draw house
        var house = bg.house;
        var hx = house.x - cameraX;
        var hy = house.y - cameraY;

        ctx.fillStyle = house.wallColor;
        ctx.fillRect(hx, hy, house.width, house.height);

        ctx.fillStyle = house.roofColor;
        ctx.beginPath();
        ctx.moveTo(hx - 20, hy);
        ctx.lineTo(hx + house.width / 2, hy - 80);
        ctx.lineTo(hx + house.width + 20, hy);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = house.doorColor;
        ctx.fillRect(hx + house.width / 2 - 25, hy + house.height - 80, 50, 80);
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(hx + house.width / 2 + 15, hy + house.height - 40, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = house.windowColor;
        ctx.fillRect(hx + 40, hy + 50, 60, 50);
        ctx.fillRect(hx + house.width - 100, hy + 50, 60, 50);
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.strokeRect(hx + 40, hy + 50, 60, 50);
        ctx.strokeRect(hx + house.width - 100, hy + 50, 60, 50);
        
        ctx.beginPath();
        ctx.moveTo(hx + 70, hy + 50);
        ctx.lineTo(hx + 70, hy + 100);
        ctx.moveTo(hx + 40, hy + 75);
        ctx.lineTo(hx + 100, hy + 75);
        ctx.stroke();

        for (var t = 0; t < bg.trees.length; t++) {
            var tree = bg.trees[t];
            var tx = tree.x - cameraX;
            var ty = tree.y - cameraY;

            ctx.fillStyle = '#8B4513';
            ctx.fillRect(tx - tree.trunkWidth / 2, ty, tree.trunkWidth, tree.trunkHeight);

            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.arc(tx, ty, tree.foliageRadius, 0, Math.PI * 2);
            ctx.arc(tx - tree.foliageRadius / 2, ty + 20, tree.foliageRadius * 0.8, 0, Math.PI * 2);
            ctx.arc(tx + tree.foliageRadius / 2, ty + 20, tree.foliageRadius * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    Level.prototype.drawLevel2Background = function(ctx, cameraX, cameraY) {
        var bg = this.data.background;

        // Gradient sky
        var gradient = ctx.createLinearGradient(0, 0 - cameraY, 0, this.data.height - cameraY);
        gradient.addColorStop(0, '#0a0a2e');
        gradient.addColorStop(0.2, '#1a1a4e');
        gradient.addColorStop(0.5, '#4A90D9');
        gradient.addColorStop(1, '#87CEEB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw decorative background clouds
        if (bg.decorativeClouds) {
            for (var dc = 0; dc < bg.decorativeClouds.length; dc++) {
                var cloud = bg.decorativeClouds[dc];
                ctx.fillStyle = 'rgba(255, 255, 255, ' + cloud.opacity + ')';
                this.drawCloudShape(ctx, cloud.x - cameraX, cloud.y - cameraY, cloud.width, cloud.height);
            }
        }

        // Draw stars
        for (var s = 0; s < bg.stars.length; s++) {
            var star = bg.stars[s];
            var twinkle = Math.sin(Date.now() / 500 + star.twinkle) * 0.5 + 0.5;
            ctx.fillStyle = 'rgba(255, 255, 255, ' + twinkle + ')';
            ctx.beginPath();
            ctx.arc(star.x - cameraX, star.y - cameraY, star.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // "Climb to Heaven" hint at top
        ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
        ctx.font = 'bold 28px Georgia';
        ctx.textAlign = 'center';
        ctx.fillText('↑ Climb to Heaven ↑', 2000 - cameraX, 80 - cameraY);

        // Bird warning near start
        ctx.fillStyle = 'rgba(255, 100, 100, 0.6)';
        ctx.font = 'bold 18px Georgia';
        ctx.fillText('⚠ Watch out for birds! ⚠', 300 - cameraX, 1750 - cameraY);
    };

    Level.prototype.drawLevel3Background = function(ctx, cameraX, cameraY) {
        var bg = this.data.background;

        // Heavenly gradient
        var gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        gradient.addColorStop(0, '#FFE4B5'); // Soft gold
        gradient.addColorStop(0.5, '#E6E6FA'); // Lavender
        gradient.addColorStop(1, '#FFFAF0'); // Floral white
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw sparkles/stars
        for (var s = 0; s < bg.stars.length; s++) {
            var star = bg.stars[s];
            var twinkle = Math.sin(Date.now() / 300 + star.twinkle) * 0.5 + 0.5;
            ctx.fillStyle = 'rgba(255, 215, 0, ' + (twinkle * 0.6) + ')';
            ctx.beginPath();
            ctx.arc(star.x - cameraX, star.y - cameraY, star.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw floating halos
        for (var h = 0; h < bg.halos.length; h++) {
            var halo = bg.halos[h];
            var float = Math.sin(Date.now() / 1000 + h) * 5;
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(halo.x - cameraX, halo.y - cameraY + float, halo.size, halo.size * 0.3, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw golden gates at the end
        if (bg.gates) {
            var gates = bg.gates;
            var gx = gates.x - cameraX;
            var gy = gates.y - cameraY;

            // Gate glow
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(gx + gates.width / 2, gy + gates.height / 2, gates.width / 2 + 80, gates.height / 2 + 80, 0, 0, Math.PI * 2);
            ctx.fill();

            // Gate pillars
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(gx, gy, 25, gates.height);
            ctx.fillRect(gx + gates.width - 25, gy, 25, gates.height);

            // Gate arch
            ctx.beginPath();
            ctx.moveTo(gx, gy);
            ctx.quadraticCurveTo(gx + gates.width / 2, gy - 40, gx + gates.width, gy);
            ctx.lineTo(gx + gates.width - 25, gy);
            ctx.quadraticCurveTo(gx + gates.width / 2, gy - 25, gx + 25, gy);
            ctx.closePath();
            ctx.fill();

            // Gate bars
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 4;
            for (var b = 40; b < gates.width - 40; b += 25) {
                ctx.beginPath();
                ctx.moveTo(gx + b, gy);
                ctx.lineTo(gx + b, gy + gates.height);
                ctx.stroke();
            }
        }

        // "HEAVEN" text
        ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
        ctx.font = 'bold 48px Georgia';
        ctx.textAlign = 'center';
        ctx.fillText('HEAVEN', this.data.width / 2 - cameraX, 80 - cameraY);
    };

    Level.prototype.drawPlatforms = function(ctx, cameraX, cameraY) {
        for (var i = 0; i < this.data.platforms.length; i++) {
            var plat = this.data.platforms[i];
            var px = plat.x - cameraX;
            var py = plat.y - cameraY;

            if (plat.type === 'grass') {
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(px, py + 20, plat.width, plat.height - 20);

                ctx.fillStyle = plat.color;
                ctx.fillRect(px, py, plat.width, 25);

                ctx.fillStyle = '#32CD32';
                for (var g = 0; g < plat.width; g += 15) {
                    var bladeHeight = 5 + Math.random() * 10;
                    ctx.fillRect(px + g, py - bladeHeight, 3, bladeHeight);
                }
            } else {
                ctx.fillStyle = plat.color || '#8B4513';
                ctx.fillRect(px, py, plat.width, plat.height);
            }
        }
    };

    Level.prototype.drawExitPedestal = function(ctx, cameraX, cameraY) {
        var exit = this.data.exitPlatform;
        var ex = exit.x - cameraX;
        var ey = exit.y - cameraY;

        // Pedestal base
        ctx.fillStyle = '#808080';
        ctx.fillRect(ex, ey + 40, exit.width, 20);

        ctx.fillStyle = '#A0A0A0';
        ctx.fillRect(ex + 15, ey + 10, exit.width - 30, 30);

        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(ex + 5, ey, exit.width - 10, 15);

        // Arrow/label
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        var bounce = Math.sin(Date.now() / 300) * 5;
        
        if (this.levelNumber === 1) {
            ctx.fillText('→', ex + exit.width / 2, ey - 10 + bounce);
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#333333';
            ctx.fillText('EXIT', ex + exit.width / 2, ey + 55);
        } else if (this.levelNumber === 2) {
            ctx.fillText('↑', ex + exit.width / 2, ey - 10 + bounce);
            ctx.font = 'bold 12px Arial';
            ctx.fillStyle = '#FFD700';
            ctx.fillText('HEAVEN', ex + exit.width / 2, ey + 55);
        }
    };

    Level.prototype.drawCloudShape = function(ctx, x, y, width, height) {
        // Draw cloud as rounded rectangle
        var cornerRadius = Math.min(width, height) * 0.3; // 30% of smaller dimension
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, cornerRadius);
        ctx.fill();
    };

    Level.prototype.checkExitCollision = function(player) {
        if ((this.levelNumber === 1 || this.levelNumber === 2) && this.data.exitPlatform) {
            var exit = this.data.exitPlatform;
            return player.x < exit.x + exit.width &&
                   player.x + player.width > exit.x &&
                   player.y < exit.y + exit.height &&
                   player.y + player.height > exit.y;
        }
        return false;
    };

    Level.prototype.reset = function() {
        // Reset clouds
        for (var i = 0; i < this.clouds.length; i++) {
            this.clouds[i].holes = [];
            this.clouds[i].destroyed = false;
        }

        // Reset hamburger
        if (this.hamburger) {
            this.hamburger.reset();
        }
    };

    return Level;
})();
