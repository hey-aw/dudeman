// Outro class - 1930s ragtime cartoon style outro animation
var Outro = (function() {
    function Outro(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.active = false;
        this.frame = 0;
        this.totalFrames = 360; // About 6 seconds at 60fps
        this.phase = 0; // 0: iris close, 1: title card, 2: character dance, 3: the end
        
        // Animation properties
        this.irisRadius = canvasWidth;
        this.characterX = canvasWidth / 2;
        this.characterY = canvasHeight / 2 + 50;
        this.bounceOffset = 0;
        this.musicNotes = [];
        
        // Text
        this.titleText = "THAT'S ALL, FOLKS!";
        this.endText = "THE END";
        
        // Music
        this.audioContext = null;
        this.musicStarted = false;
        this.musicNoteIndex = 0;
        this.lastNoteTime = 0;
    }

    Outro.prototype.start = function() {
        this.active = true;
        this.frame = 0;
        this.phase = 0;
        this.irisRadius = this.canvasWidth;
        this.musicNotes = [];
        this.musicStarted = false;
        this.musicNoteIndex = 0;
        this.lastNoteTime = 0;
        this.initMusic();
    };

    Outro.prototype.draw = function(ctx) {
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
            // Character dancing
            this.drawDanceScene(ctx);
        } else if (this.phase === 3) {
            // The End
            this.drawTheEnd(ctx);
        }

        // Film grain effect
        this.drawFilmGrain(ctx);

        // Vignette
        this.drawVignette(ctx);
    };

    Outro.prototype.drawIrisWipe = function(ctx) {
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

    Outro.prototype.drawTitleCard = function(ctx) {
        // Radial lines background
        ctx.save();
        ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
        
        var numRays = 24;
        var rotation = (this.frame - 60) * 0.02;
        ctx.rotate(rotation);
        
        for (var i = 0; i < numRays; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#2a2a2a' : '#3a3a3a';
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
        var wobble = Math.sin((this.frame - 60) * 0.1) * 3;
        ctx.save();
        ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2 + wobble);
        ctx.rotate(Math.sin((this.frame - 60) * 0.05) * 0.05);

        // Text shadow
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 48px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.titleText, 3, 3);

        // Main text
        ctx.fillStyle = '#F5DEB3';
        ctx.fillText(this.titleText, 0, 0);

        ctx.restore();
    };

    Outro.prototype.drawDanceScene = function(ctx) {
        // Spotlight background
        var gradient = ctx.createRadialGradient(
            this.canvasWidth / 2, this.canvasHeight / 2, 0,
            this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth / 2
        );
        gradient.addColorStop(0, '#4a4a4a');
        gradient.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Stage floor
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(0, this.canvasHeight / 2 + 100, this.canvasWidth, 200);

        // Music notes
        for (var i = 0; i < this.musicNotes.length; i++) {
            var note = this.musicNotes[i];
            ctx.save();
            ctx.translate(note.x, note.y);
            ctx.rotate(note.rotation);
            ctx.globalAlpha = note.opacity;
            ctx.fillStyle = '#F5DEB3';
            ctx.font = '30px Georgia';
            ctx.fillText('♪', 0, 0);
            ctx.restore();
        }

        // Dancing character
        var danceX = this.characterX + Math.sin(this.frame * 0.1) * 20;
        var danceY = this.characterY - this.bounceOffset;
        var lean = Math.sin(this.frame * 0.1) * 0.1;

        ctx.save();
        ctx.translate(danceX, danceY);
        ctx.rotate(lean);

        // Character body (1930s cartoon style - rubber hose)
        ctx.fillStyle = '#1a1a1a';
        
        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, 25, 35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.arc(0, -50, 30, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (pie eyes)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(-10, -55, 10, 12, 0, 0, Math.PI * 2);
        ctx.ellipse(10, -55, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#000000';
        var pupilOffset = Math.sin(this.frame * 0.1) * 3;
        ctx.beginPath();
        ctx.arc(-10 + pupilOffset, -55, 5, 0, Math.PI * 2);
        ctx.arc(10 + pupilOffset, -55, 5, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -45, 15, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Arms (rubber hose style)
        var armAngle = Math.sin(this.frame * 0.15) * 0.5;
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        
        // Left arm
        ctx.beginPath();
        ctx.moveTo(-20, -10);
        ctx.quadraticCurveTo(-50, -30 + Math.sin(this.frame * 0.15) * 20, -60, -50 + Math.sin(this.frame * 0.15) * 30);
        ctx.stroke();

        // Right arm
        ctx.beginPath();
        ctx.moveTo(20, -10);
        ctx.quadraticCurveTo(50, -30 - Math.sin(this.frame * 0.15) * 20, 60, -50 - Math.sin(this.frame * 0.15) * 30);
        ctx.stroke();

        // Legs
        var legOffset = Math.sin(this.frame * 0.15) * 15;
        ctx.beginPath();
        ctx.moveTo(-10, 30);
        ctx.quadraticCurveTo(-15, 50, -10 - legOffset, 70);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(10, 30);
        ctx.quadraticCurveTo(15, 50, 10 + legOffset, 70);
        ctx.stroke();

        // Gloves
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-60, -50 + Math.sin(this.frame * 0.15) * 30, 12, 0, Math.PI * 2);
        ctx.arc(60, -50 - Math.sin(this.frame * 0.15) * 30, 12, 0, Math.PI * 2);
        ctx.fill();

        // Shoes
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(-10 - legOffset, 75, 15, 8, 0, 0, Math.PI * 2);
        ctx.ellipse(10 + legOffset, 75, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    };

    Outro.prototype.drawTheEnd = function(ctx) {
        // Fade in
        var fadeProgress = Math.min(1, (this.frame - 300) / 30);

        // Radial background
        ctx.save();
        ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
        
        var numRays = 16;
        for (var i = 0; i < numRays; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#2a2a2a' : '#3a3a3a';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            var angle1 = (i / numRays) * Math.PI * 2;
            var angle2 = ((i + 1) / numRays) * Math.PI * 2;
            ctx.arc(0, 0, this.canvasWidth, angle1, angle2);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();

        // "THE END" text
        ctx.globalAlpha = fadeProgress;

        // Decorative frame
        ctx.strokeStyle = '#F5DEB3';
        ctx.lineWidth = 8;
        var frameWidth = 350;
        var frameHeight = 150;
        var frameX = (this.canvasWidth - frameWidth) / 2;
        var frameY = (this.canvasHeight - frameHeight) / 2;
        
        ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);
        ctx.strokeRect(frameX + 10, frameY + 10, frameWidth - 20, frameHeight - 20);

        // Text
        ctx.fillStyle = '#F5DEB3';
        ctx.font = 'bold 64px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.endText, this.canvasWidth / 2, this.canvasHeight / 2);

        ctx.globalAlpha = 1;
    };

    Outro.prototype.drawFilmGrain = function(ctx) {
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

    Outro.prototype.drawVignette = function(ctx) {
        var gradient = ctx.createRadialGradient(
            this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth / 4,
            this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    };

    Outro.prototype.isComplete = function() {
        return this.frame >= this.totalFrames;
    };

    // Ragtime bitmusic using Web Audio API
    Outro.prototype.initMusic = function() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            // Web Audio API not supported
            console.log('Web Audio API not supported');
        }
    };

    Outro.prototype.playRagtimeMusic = function() {
        if (!this.audioContext || this.musicStarted) return;
        this.musicStarted = true;

        // "The Entertainer" by Scott Joplin - opening A section
        // The famous syncopated opening motif
        var melody = [
            { note: 'D5', time: 0.0, dur: 0.125 },
            { note: 'D5', time: 0.125, dur: 0.125 },
            { note: 'E5', time: 0.25, dur: 0.25 },
            { note: 'C5', time: 0.5, dur: 0.25 },
            { note: 'E5', time: 0.75, dur: 0.125 },
            { note: 'C5', time: 0.875, dur: 0.125 },
            { note: 'E5', time: 1.0, dur: 0.125 },
            { note: 'C5', time: 1.125, dur: 0.25 },
            { note: 'D5', time: 1.375, dur: 0.125 },
            { note: 'D5', time: 1.5, dur: 0.125 },
            { note: 'E5', time: 1.625, dur: 0.25 },
            { note: 'C5', time: 1.875, dur: 0.25 },
            { note: 'E5', time: 2.125, dur: 0.125 },
            { note: 'C5', time: 2.25, dur: 0.125 },
            { note: 'E5', time: 2.375, dur: 0.125 },
            { note: 'C5', time: 2.5, dur: 0.375 },
            { note: 'A4', time: 2.875, dur: 0.125 },
            { note: 'A4', time: 3.0, dur: 0.125 },
            { note: 'B4', time: 3.125, dur: 0.25 },
            { note: 'G4', time: 3.375, dur: 0.25 },
            { note: 'B4', time: 3.625, dur: 0.125 },
            { note: 'G4', time: 3.75, dur: 0.125 },
            { note: 'B4', time: 3.875, dur: 0.125 },
            { note: 'G4', time: 4.0, dur: 0.25 },
            { note: 'A4', time: 4.25, dur: 0.125 },
            { note: 'A4', time: 4.375, dur: 0.125 },
            { note: 'B4', time: 4.5, dur: 0.25 },
            { note: 'G4', time: 4.75, dur: 0.25 },
            { note: 'B4', time: 5.0, dur: 0.125 },
            { note: 'G4', time: 5.125, dur: 0.125 },
            { note: 'B4', time: 5.25, dur: 0.125 },
            { note: 'G4', time: 5.375, dur: 0.375 },
            { note: 'C5', time: 5.75, dur: 0.5 }
        ];

        // Bass pattern (oom-pah ragtime style - C major)
        var bass = [
            { note: 'C3', time: 0.0, dur: 0.25 },
            { note: 'E3', time: 0.25, dur: 0.25 },
            { note: 'G3', time: 0.5, dur: 0.25 },
            { note: 'C3', time: 0.75, dur: 0.25 },
            { note: 'E3', time: 1.0, dur: 0.25 },
            { note: 'G3', time: 1.25, dur: 0.25 },
            { note: 'C3', time: 1.5, dur: 0.25 },
            { note: 'E3', time: 1.75, dur: 0.25 },
            { note: 'G3', time: 2.0, dur: 0.25 },
            { note: 'C3', time: 2.25, dur: 0.25 },
            { note: 'E3', time: 2.5, dur: 0.25 },
            { note: 'G3', time: 2.75, dur: 0.25 },
            { note: 'C3', time: 3.0, dur: 0.25 },
            { note: 'E3', time: 3.25, dur: 0.25 },
            { note: 'G3', time: 3.5, dur: 0.25 },
            { note: 'C3', time: 3.75, dur: 0.25 },
            { note: 'E3', time: 4.0, dur: 0.25 },
            { note: 'G3', time: 4.25, dur: 0.25 },
            { note: 'C3', time: 4.5, dur: 0.25 },
            { note: 'E3', time: 4.75, dur: 0.25 },
            { note: 'G3', time: 5.0, dur: 0.25 },
            { note: 'C3', time: 5.25, dur: 0.25 },
            { note: 'E3', time: 5.5, dur: 0.25 },
            { note: 'G3', time: 5.75, dur: 0.5 }
        ];

        var startTime = this.audioContext.currentTime + 0.1;

        // Play melody
        for (var i = 0; i < melody.length; i++) {
            var m = melody[i];
            this.playNote(m.note, startTime + m.time, m.dur, 'square', 0.3);
        }

        // Play bass
        for (var i = 0; i < bass.length; i++) {
            var b = bass[i];
            this.playNote(b.note, startTime + b.time, b.dur, 'sawtooth', 0.25);
        }
    };

    Outro.prototype.noteToFreq = function(note) {
        var notes = {
            'C3': 130.81, 'E3': 164.81, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77
        };
        return notes[note] || 261.63;
    };

    Outro.prototype.playNote = function(note, startTime, duration, waveType, volume) {
        if (!this.audioContext) return;

        var oscillator = this.audioContext.createOscillator();
        var gainNode = this.audioContext.createGain();

        oscillator.type = waveType || 'square';
        oscillator.frequency.value = this.noteToFreq(note);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume || 0.2, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    };

    Outro.prototype.update = function() {
        if (!this.active) return false;

        this.frame++;

        // Start music when title card appears
        if (this.frame === 60 && this.audioContext) {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.playRagtimeMusic();
        }

        // Phase transitions
        if (this.frame < 60) {
            this.phase = 0; // Iris close
            this.irisRadius = this.canvasWidth * (1 - this.frame / 60);
        } else if (this.frame < 120) {
            this.phase = 1; // Title card
        } else if (this.frame < 300) {
            this.phase = 2; // Character dance
            this.bounceOffset = Math.abs(Math.sin(this.frame * 0.15)) * 30;
            
            // Spawn music notes
            if (this.frame % 20 === 0) {
                this.musicNotes.push({
                    x: this.characterX + (Math.random() - 0.5) * 100,
                    y: this.characterY - 50,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -2,
                    rotation: Math.random() * Math.PI * 2,
                    opacity: 1
                });
            }
        } else {
            this.phase = 3; // The End
        }

        // Update music notes
        for (var i = this.musicNotes.length - 1; i >= 0; i--) {
            var note = this.musicNotes[i];
            note.x += note.vx;
            note.y += note.vy;
            note.rotation += 0.05;
            note.opacity -= 0.015;
            if (note.opacity <= 0) {
                this.musicNotes.splice(i, 1);
            }
        }

        // Check if outro is complete
        if (this.frame >= this.totalFrames) {
            return true; // Outro complete
        }

        return false;
    };

    return Outro;
})();
