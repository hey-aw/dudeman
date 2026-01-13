// Failure class - 1930s cartoon style failure animation with sad character
var Failure = (function() {
    function Failure(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.active = false;
        this.frame = 0;
        this.totalFrames = 240; // About 4 seconds at 60fps
        this.phase = 0; // 0: iris close, 1: title card, 2: sad character, 3: fade out
        
        // Animation properties
        this.irisRadius = canvasWidth;
        this.characterX = canvasWidth / 2;
        this.characterY = canvasHeight / 2 + 50;
        this.slumpOffset = 0;
        this.teardrops = [];
        
        // Text
        this.titleText = "OH NO!";
        
        // Music
        this.audioContext = null;
        this.musicStarted = false;
    }

    Failure.prototype.start = function() {
        this.active = true;
        this.frame = 0;
        this.phase = 0;
        this.irisRadius = this.canvasWidth;
        this.teardrops = [];
        this.musicStarted = false;
        this.initMusic();
    };

    Failure.prototype.draw = function(ctx) {
        if (!this.active) return;

        // Sepia/grayscale background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        if (this.phase === 0) {
            // Iris wipe effect
            this.drawIrisWipe(ctx);
        } else if (this.phase === 1) {
            // Title card
            this.drawTitleCard(ctx);
        } else if (this.phase === 2) {
            // Sad character scene
            this.drawSadScene(ctx);
        } else if (this.phase === 3) {
            // Fade out
            this.drawFadeOut(ctx);
        }

        // Film grain effect
        this.drawFilmGrain(ctx);

        // Vignette
        this.drawVignette(ctx);
    };

    Failure.prototype.drawIrisWipe = function(ctx) {
        // Draw previous scene in center
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.arc(this.canvasWidth / 2, this.canvasHeight / 2, this.irisRadius, 0, Math.PI * 2);
        ctx.fill();

        // Player in center
        if (this.irisRadius > 50) {
            ctx.fillStyle = '#4A90D9';
            ctx.fillRect(this.canvasWidth / 2 - 20, this.canvasHeight / 2 - 30, 40, 60);
        }
    };

    Failure.prototype.drawTitleCard = function(ctx) {
        // Darker radial lines background
        ctx.save();
        ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
        
        var numRays = 24;
        var rotation = (this.frame - 60) * 0.01;
        ctx.rotate(rotation);
        
        for (var i = 0; i < numRays; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#1a1a1a' : '#2a2a2a';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            var angle1 = (i / numRays) * Math.PI * 2;
            var angle2 = ((i + 1) / numRays) * Math.PI * 2;
            ctx.arc(0, 0, this.canvasWidth, angle1, angle2);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();

        // Title text with wobble
        var wobble = Math.sin((this.frame - 60) * 0.15) * 2;
        ctx.save();
        ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2 + wobble);

        // Text shadow
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 56px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.titleText, 3, 3);

        // Main text (sadder color)
        ctx.fillStyle = '#8B7355';
        ctx.fillText(this.titleText, 0, 0);

        ctx.restore();
    };

    Failure.prototype.drawSadScene = function(ctx) {
        // Darker spotlight background
        var gradient = ctx.createRadialGradient(
            this.canvasWidth / 2, this.canvasHeight / 2, 0,
            this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth / 2
        );
        gradient.addColorStop(0, '#3a3a3a');
        gradient.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Stage floor
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, this.canvasHeight / 2 + 100, this.canvasWidth, 200);

        // Teardrops
        for (var i = 0; i < this.teardrops.length; i++) {
            var tear = this.teardrops[i];
            ctx.save();
            ctx.globalAlpha = tear.opacity;
            ctx.fillStyle = '#87CEEB';
            ctx.beginPath();
            ctx.moveTo(tear.x, tear.y);
            ctx.lineTo(tear.x - 3, tear.y + 8);
            ctx.lineTo(tear.x + 3, tear.y + 8);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Sad character (slumped, sitting)
        var sadX = this.characterX;
        var sadY = this.characterY + this.slumpOffset;
        var slumpAngle = Math.sin(this.frame * 0.05) * 0.05;

        ctx.save();
        ctx.translate(sadX, sadY);
        ctx.rotate(slumpAngle);

        // Character body (1930s cartoon style - rubber hose)
        ctx.fillStyle = '#1a1a1a';
        
        // Body (slumped forward)
        ctx.beginPath();
        ctx.ellipse(0, 10, 25, 35, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Head (drooped)
        ctx.beginPath();
        ctx.arc(0, -40, 30, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (sad, droopy)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        // Left eye (droopy)
        ctx.ellipse(-10, -50, 10, 8, -0.2, 0, Math.PI * 2);
        // Right eye (droopy)
        ctx.ellipse(10, -50, 10, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Pupils (looking down)
        ctx.fillStyle = '#000000';
        var pupilOffsetY = 2;
        ctx.beginPath();
        ctx.arc(-10, -50 + pupilOffsetY, 5, 0, Math.PI * 2);
        ctx.arc(10, -50 + pupilOffsetY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Frown (sad mouth)
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -40, 15, 0.2 + Math.PI, Math.PI * 2 - 0.2);
        ctx.stroke();

        // Arms (hanging down, sad)
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        
        // Left arm (hanging)
        ctx.beginPath();
        ctx.moveTo(-20, 5);
        ctx.quadraticCurveTo(-25, 30, -30, 50);
        ctx.stroke();

        // Right arm (hanging)
        ctx.beginPath();
        ctx.moveTo(20, 5);
        ctx.quadraticCurveTo(25, 30, 30, 50);
        ctx.stroke();

        // Legs (sitting/crossed, sad)
        var legOffset = Math.sin(this.frame * 0.05) * 2;
        ctx.beginPath();
        ctx.moveTo(-10, 40);
        ctx.quadraticCurveTo(-15, 55, -10 - legOffset, 70);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(10, 40);
        ctx.quadraticCurveTo(15, 55, 10 + legOffset, 70);
        ctx.stroke();

        // Gloves (hanging)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-30, 50, 12, 0, Math.PI * 2);
        ctx.arc(30, 50, 12, 0, Math.PI * 2);
        ctx.fill();

        // Shoes
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(-10 - legOffset, 75, 15, 8, 0, 0, Math.PI * 2);
        ctx.ellipse(10 + legOffset, 75, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    };

    Failure.prototype.drawFadeOut = function(ctx) {
        // Fade to black
        var fadeProgress = Math.min(1, (this.frame - 210) / 30);
        ctx.fillStyle = 'rgba(0, 0, 0, ' + fadeProgress + ')';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    };

    Failure.prototype.drawFilmGrain = function(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.05;
        
        for (var i = 0; i < 1000; i++) {
            var x = Math.random() * this.canvasWidth;
            var y = Math.random() * this.canvasHeight;
            var brightness = Math.random() > 0.5 ? '#FFFFFF' : '#000000';
            ctx.fillStyle = brightness;
            ctx.fillRect(x, y, 1, 1);
        }
        
        ctx.restore();
    };

    Failure.prototype.drawVignette = function(ctx) {
        var gradient = ctx.createRadialGradient(
            this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth / 4,
            this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    };

    Failure.prototype.isComplete = function() {
        return this.frame >= this.totalFrames;
    };

    // Sad music using Web Audio API
    Failure.prototype.initMusic = function() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            // Web Audio API not supported
            console.log('Web Audio API not supported');
        }
    };

    Failure.prototype.playSadMusic = function() {
        if (!this.audioContext || this.musicStarted) return;
        this.musicStarted = true;

        // Sad, descending melody (minor key)
        var melody = [
            { note: 'A4', time: 0.0, dur: 0.3 },
            { note: 'G4', time: 0.4, dur: 0.3 },
            { note: 'F4', time: 0.8, dur: 0.3 },
            { note: 'E4', time: 1.2, dur: 0.4 },
            { note: 'D4', time: 1.7, dur: 0.3 },
            { note: 'C4', time: 2.1, dur: 0.5 },
            { note: 'A3', time: 2.7, dur: 0.4 },
            { note: 'C4', time: 3.2, dur: 0.6 }
        ];

        // Low, sad bass
        var bass = [
            { note: 'A2', time: 0.0, dur: 0.2 },
            { note: 'G2', time: 0.4, dur: 0.2 },
            { note: 'F2', time: 0.8, dur: 0.2 },
            { note: 'E2', time: 1.2, dur: 0.2 },
            { note: 'D2', time: 1.7, dur: 0.2 },
            { note: 'C2', time: 2.1, dur: 0.2 },
            { note: 'A1', time: 2.7, dur: 0.2 },
            { note: 'C2', time: 3.2, dur: 0.3 }
        ];

        var startTime = this.audioContext.currentTime + 0.1;

        // Play melody (sine wave for softer, sadder sound)
        for (var i = 0; i < melody.length; i++) {
            var m = melody[i];
            this.playNote(m.note, startTime + m.time, m.dur, 'sine', 0.2);
        }

        // Play bass (sawtooth for depth)
        for (var i = 0; i < bass.length; i++) {
            var b = bass[i];
            this.playNote(b.note, startTime + b.time, b.dur, 'sawtooth', 0.15);
        }
    };

    Failure.prototype.noteToFreq = function(note) {
        var notes = {
            'A1': 55.00, 'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00,
            'A3': 220.00, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00
        };
        return notes[note] || 261.63;
    };

    Failure.prototype.playNote = function(note, startTime, duration, waveType, volume) {
        if (!this.audioContext) return;

        var oscillator = this.audioContext.createOscillator();
        var gainNode = this.audioContext.createGain();

        oscillator.type = waveType || 'sine';
        oscillator.frequency.value = this.noteToFreq(note);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume || 0.15, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    };

    Failure.prototype.update = function() {
        if (!this.active) return false;

        this.frame++;

        // Start music when title card appears
        if (this.frame === 60 && this.audioContext) {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.playSadMusic();
        }

        // Phase transitions
        if (this.frame < 60) {
            this.phase = 0; // Iris close
            this.irisRadius = this.canvasWidth * (1 - this.frame / 60);
        } else if (this.frame < 120) {
            this.phase = 1; // Title card
        } else if (this.frame < 210) {
            this.phase = 2; // Sad character
            this.slumpOffset = Math.sin(this.frame * 0.05) * 5;
            
            // Spawn teardrops
            if (this.frame % 15 === 0) {
                this.teardrops.push({
                    x: this.characterX + (Math.random() - 0.5) * 40,
                    y: this.characterY - 30,
                    vy: 2 + Math.random() * 1,
                    opacity: 0.8
                });
            }
        } else {
            this.phase = 3; // Fade out
        }

        // Update teardrops
        for (var i = this.teardrops.length - 1; i >= 0; i--) {
            var tear = this.teardrops[i];
            tear.y += tear.vy;
            tear.opacity -= 0.02;
            if (tear.opacity <= 0 || tear.y > this.canvasHeight) {
                this.teardrops.splice(i, 1);
            }
        }

        // Check if failure animation is complete
        if (this.frame >= this.totalFrames) {
            return true; // Animation complete
        }

        return false;
    };

    return Failure;
})();
