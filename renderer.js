// =================================================================================
// RENDERER.JS - WebGL Rendering Engine for Quadra
// =================================================================================

const TEXTURE_VERTEX_SHADER = `
    attribute vec3 a_position;
    attribute vec2 a_texcoord;

    varying vec2 v_texcoord;

    void main() {
       // x, y are clip space coords, z is depth
       gl_Position = vec4(a_position.xy, a_position.z, 1.0);
       v_texcoord = a_texcoord;
    }
`;

const TEXTURE_FRAGMENT_SHADER = `
    precision mediump float;

    varying vec2 v_texcoord;
    uniform sampler2D u_texture;

    void main() {
       gl_FragColor = texture2D(u_texture, v_texcoord);
    }
`;

class TexturedQuad {
    constructor(gl, sourceCanvas, zIndex) {
        this.gl = gl;
        this.texture = this.createTexture(sourceCanvas);
        this.zIndex = zIndex;

        // Create a buffer for the quad's positions.
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        const positions = [
            -1, -1, zIndex,
             1, -1, zIndex,
            -1,  1, zIndex,
            -1,  1, zIndex,
             1, -1, zIndex,
             1,  1, zIndex,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        this.texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
        const texcoords = [
            0, 1,
            1, 1,
            0, 0,
            0, 0,
            1, 1,
            1, 0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
    }

    createTexture(source) {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        return texture;
    }

    bindBuffers(program) {
        const gl = this.gl;

        const posLoc = gl.getAttribLocation(program, "a_position");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

        const texcoordLoc = gl.getAttribLocation(program, "a_texcoord");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
        gl.enableVertexAttribArray(texcoordLoc);
        gl.vertexAttribPointer(texcoordLoc, 2, gl.FLOAT, false, 0, 0);
    }

    draw() {
        const gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}


const PARTICLE_VERTEX_SHADER = `
    attribute vec2 a_position;
    attribute float a_size;
    attribute float a_alpha;

    varying float v_alpha;

    uniform vec2 u_resolution;
    uniform float u_zIndex;

    void main() {
        vec2 zeroToOne = a_position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, -1), u_zIndex, 1);
        gl_PointSize = a_size;
        v_alpha = a_alpha;
    }
`;

const PARTICLE_FRAGMENT_SHADER = `
    precision mediump float;

    varying float v_alpha;
    uniform vec3 u_color;

    void main() {
        float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
        if (dist > 0.5) {
            discard;
        }
        // Softer, wider glow with a slightly brighter core
        float glow = pow(1.0 - dist * 2.0, 1.5) * 0.8 + 0.2;
        gl_FragColor = vec4(u_color, v_alpha * glow);
    }
`;

class ParticleSystem {
    constructor(gl, numParticles, themeConfig) {
        this.gl = gl;
        this.numParticles = numParticles;
        this.themeConfig = themeConfig;
        this.zIndex = themeConfig.zIndex || 0.0;
        this.behavior = themeConfig.behavior || 'standard';
        this.islandTargets = this.themeConfig.islandData || null;

        this.positions = new Float32Array(numParticles * 2);
        this.velocities = new Float32Array(numParticles * 2);
        this.sizes = new Float32Array(numParticles);
        this.alphas = new Float32Array(numParticles);
        this.lifetimes = new Float32Array(numParticles);

        if (this.islandTargets) {
            this.particleIslandMap = new Int32Array(numParticles);
        }

        if (this.behavior === 'firefly') {
            this.wanderAngles = new Float32Array(numParticles);
            // 0: state (0:fade-in, 1:glow, 2:fade-out, 3:dark), 1: timer, 2: fadeInTime, 3: glowTime, 4: fadeOutTime, 5: darkTime
            this.blinkInfo = new Float32Array(numParticles * 6);
            this.fireflyStates = new Uint8Array(numParticles); // 0: wandering, 1: targeting, 2: clustering
            this.clusterTargets = new Float32Array(numParticles * 2);
            this.clusterTimers = new Float32Array(numParticles);
            this.dartInfo = new Float32Array(numParticles * 2); // 0: isDarting, 1: dartTimer
            this.clusterPoints = Array.from({length: 5}, () => ({
                x: Math.random() * this.gl.canvas.width,
                y: Math.random() * this.gl.canvas.height * 0.6 + this.gl.canvas.height * 0.35 // Mid-to-lower section
            }));
        } else if (this.behavior === 'petal') {
            this.rotations = new Float32Array(numParticles);
            this.rotationSpeeds = new Float32Array(numParticles);
            this.swayFactors = new Float32Array(numParticles * 2); // For more complex sway
            this.wind = { x: 0.1, y: 0 };
            this.lastWindGust = 0;
            this.nextWindGustTime = Math.random() * 4000 + 8000; // 8-12 seconds
        } else if (this.behavior === 'spiraling-debris') {
            this.angles = new Float32Array(numParticles);
            this.radii = new Float32Array(numParticles * 3); // x-radius, y-radius, z-radius (for perspective)
            this.centers = new Float32Array(numParticles * 2);
            this.speeds = new Float32Array(numParticles);
        } else if (this.behavior === 'horizontal-drift') {
            this.driftFactors = new Float32Array(numParticles);
        } else if (this.behavior === 'crystal-growth') {
            this.growthInfo = new Float32Array(numParticles * 2); // currentSize, growthRate
        } else if (this.behavior === 'incense-smoke') {
            this.spiralInfo = new Float32Array(numParticles * 3); // angle, radius, speed
        }

        this.positionBuffer = gl.createBuffer();
        this.sizeBuffer = gl.createBuffer();
        this.alphaBuffer = gl.createBuffer();

        for (let i = 0; i < numParticles; i++) {
            this.spawnParticle(i);
        }
    }

    spawnParticle(i) {
        const { width, height } = this.gl.canvas;
        const config = this.themeConfig;

        if (this.islandTargets) {
            this.particleIslandMap[i] = Math.floor(Math.random() * this.islandTargets.length);
        }

        this.positions[i * 2] = Math.random() * width;
        this.positions[i * 2 + 1] = Math.random() * height;

        this.sizes[i] = Math.random() * (config.maxSize - config.minSize) + config.minSize;
        this.lifetimes[i] = config.lifetime === Infinity ? Infinity : Math.random() * config.lifetime;

        if (this.behavior === 'firefly') {
            this.positions[i * 2 + 1] = Math.random() * height * 0.9 + height * 0.1; // Spawn away from very top/bottom
            this.velocities[i * 2] = 0;
            this.velocities[i * 2 + 1] = 0;
            this.wanderAngles[i] = Math.random() * Math.PI * 2;

            // Blinking state machine setup
            const blinkOffset = i * 6;
            this.blinkInfo[blinkOffset] = Math.floor(Math.random() * 4); // Start in a random state
            this.blinkInfo[blinkOffset + 2] = Math.random() * 200 + 300; // Fade-in: 0.3-0.5s
            this.blinkInfo[blinkOffset + 3] = Math.random() * 500 + 500; // Glow: 0.5-1.0s
            this.blinkInfo[blinkOffset + 4] = Math.random() * 300 + 500; // Fade-out: 0.5-0.8s
            this.blinkInfo[blinkOffset + 5] = Math.random() * 2000 + 1000; // Dark: 1-3s
            this.blinkInfo[blinkOffset + 1] = this.blinkInfo[blinkOffset + 2 + this.blinkInfo[blinkOffset]]; // Set initial timer
            this.alphas[i] = 0; // Start dark

            this.fireflyStates[i] = 0; // Start in wandering state
            this.clusterTimers[i] = 0;
            this.dartInfo[i * 2] = 0; // Not darting
            this.dartInfo[i * 2 + 1] = 0; // Dart timer
        } else if (this.behavior === 'petal') {
            this.positions[i * 2] = Math.random() * (width + 200) - 100; // Start further off-screen
            this.positions[i * 2 + 1] = -Math.random() * 50 - 10; // Start just above the screen
            this.velocities[i * 2] = (Math.random() - 0.5) * 0.3; // Base horizontal drift
            this.velocities[i * 2 + 1] = (Math.random() * 0.3 + 0.7) * config.speed; // Vertical speed with less variation
            this.rotations[i] = Math.random() * 360;
            this.rotationSpeeds[i] = (Math.random() - 0.5) * 3;
            this.alphas[i] = Math.random() * (config.maxAlpha - config.minAlpha) + config.minAlpha;
            this.swayFactors[i * 2] = Math.random() * 2 + 1; // Sway frequency
            this.swayFactors[i * 2 + 1] = Math.random() * 0.5 + 0.5; // Sway amplitude
        } else if (this.behavior === 'upward-waterfall') {
            let spawnX, spawnY;
            if (this.islandTargets && this.islandTargets.length > 0) {
                const island = this.islandTargets[this.particleIslandMap[i]];
                const rect = island.raw.getBoundingClientRect();
                spawnX = rect.left + Math.random() * rect.width;
                spawnY = rect.top + rect.height;
            } else {
                spawnX = Math.random() * width;
                spawnY = height + Math.random() * height * 0.5;
            }
            this.positions[i * 2] = spawnX;
            this.positions[i * 2 + 1] = spawnY;
            this.velocities[i * 2] = (Math.random() - 0.5) * config.speed * 0.2;
            this.velocities[i * 2 + 1] = -(Math.random() * 0.4 + 0.8) * config.speed; // Fast upwards
            this.alphas[i] = Math.random() * (config.maxAlpha - config.minAlpha) + config.minAlpha;
            this.lifetimes[i] = Math.random() * config.lifetime;
        } else if (this.behavior === 'spiraling-debris') {
            if (this.islandTargets && this.islandTargets.length > 0) {
                const island = this.islandTargets[this.particleIslandMap[i]];
                const rect = island.raw.getBoundingClientRect();
                this.centers[i * 2] = rect.left + rect.width / 2;
                this.centers[i * 2 + 1] = rect.top + rect.height / 2;
            } else {
                this.centers[i * 2] = Math.random() * width;
                this.centers[i * 2 + 1] = Math.random() * height;
            }
            this.radii[i * 3] = Math.random() * 80 + 40; // x-radius
            this.radii[i * 3 + 1] = Math.random() * 40 + 20; // y-radius
            this.angles[i] = Math.random() * Math.PI * 2;
            this.speeds[i] = (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1);
            this.alphas[i] = Math.random() * (config.maxAlpha - config.minAlpha) + config.minAlpha;
        } else if (this.behavior === 'horizontal-drift') {
            const fromLeft = Math.random() > 0.5;
            this.positions[i * 2] = fromLeft ? -Math.random() * 50 : width + Math.random() * 50;
            this.positions[i * 2 + 1] = Math.random() * height;
            this.velocities[i * 2] = (fromLeft ? 1 : -1) * (Math.random() * 0.5 + 0.5) * config.speed;
            this.velocities[i * 2 + 1] = (Math.random() - 0.5) * 0.1; // Slow vertical drift
            this.alphas[i] = Math.random() * (config.maxAlpha - config.minAlpha) + config.minAlpha;
            this.driftFactors[i] = Math.random() * 2 - 1; // -1 to 1
        } else if (this.behavior === 'crystal-growth') {
            this.positions[i * 2] = Math.random() * width;
            this.positions[i * 2 + 1] = Math.random() * height;
            this.growthInfo[i * 2] = 0; // currentSize
            this.growthInfo[i * 2 + 1] = (Math.random() * 0.02 + 0.01) * config.speed; // growthRate
            this.lifetimes[i] = config.lifetime;
            this.alphas[i] = 0;
            this.sizes[i] = config.maxSize; // The shader uses a_size for gl_PointSize
        } else if (this.behavior === 'incense-smoke') {
            this.positions[i * 2] = width / 2 + (Math.random() - 0.5) * 100;
            this.positions[i * 2 + 1] = height;
            this.velocities[i * 2] = 0;
            this.velocities[i * 2 + 1] = -(Math.random() * 0.3 + 0.2) * config.speed;
            this.spiralInfo[i * 3] = Math.random() * Math.PI * 2; // angle
            this.spiralInfo[i * 3 + 1] = Math.random() * 10 + 5;  // initial radius
            this.spiralInfo[i * 3 + 2] = (Math.random() - 0.5) * 0.04; // spiral speed
            this.lifetimes[i] = config.lifetime;
            this.alphas[i] = 0;
        } else if (this.behavior === 'waterfall') {
            // Spawn in multiple streams
            const streamIndex = i % 7; // 7 waterfalls
            const streamX = (0.1 + streamIndex * 0.13 + Math.random() * 0.05) * width;
            this.positions[i * 2] = streamX;
            this.positions[i * 2 + 1] = Math.random() * -height; // Start well above screen
            this.velocities[i * 2] = (Math.random() - 0.5) * config.speed * 0.1; // Little horizontal sway
            this.velocities[i * 2 + 1] = (Math.random() * 0.2 + 0.8) * config.speed; // Fast downwards
            this.alphas[i] = Math.random() * (config.maxAlpha - config.minAlpha) + config.minAlpha;
            this.lifetimes[i] = Math.random() * config.lifetime;
        } else { // 'standard' or 'ambient'
            this.velocities[i * 2] = (Math.random() - 0.5) * config.speed;
            this.velocities[i * 2 + 1] = (Math.random() - 0.5) * config.speed;
            this.alphas[i] = Math.random() * (config.maxAlpha - config.minAlpha) + config.minAlpha;
        }
    }

    update() {
        const { width, height } = this.gl.canvas;
        const config = this.themeConfig;

        for (let i = 0; i < this.numParticles; i++) {
            if (this.lifetimes[i] !== Infinity) {
                this.lifetimes[i]--;
                if (this.lifetimes[i] <= 0) {
                    this.spawnParticle(i);
                    continue;
                }
            }

            if (this.behavior === 'firefly') {
                const state = this.fireflyStates[i];
                const dartOffset = i * 2;
                const isDarting = this.dartInfo[dartOffset] === 1;

                // Movement Logic
                if (isDarting) {
                    this.dartInfo[dartOffset + 1]--; // Decrement dart timer
                    if (this.dartInfo[dartOffset + 1] <= 0) {
                        this.dartInfo[dartOffset] = 0; // End dart
                    }
                } else {
                    // Wandering behavior
                    this.wanderAngles[i] += (Math.random() - 0.5) * 0.3; // More gentle turns
                    const baseSpeed = 0.05;
                    this.velocities[i * 2] += Math.cos(this.wanderAngles[i]) * baseSpeed;
                    this.velocities[i * 2 + 1] += Math.sin(this.wanderAngles[i]) * baseSpeed;

                    // Occasional darting
                    if (Math.random() < 0.005) {
                        this.dartInfo[dartOffset] = 1; // Start darting
                        this.dartInfo[dartOffset + 1] = Math.random() * 30 + 20; // Dart for 20-50 frames
                        const dartAngle = this.wanderAngles[i] + (Math.random() - 0.5) * 0.5;
                        const dartSpeed = Math.random() * 1.5 + 1.0;
                        this.velocities[i * 2] = Math.cos(dartAngle) * dartSpeed;
                        this.velocities[i * 2 + 1] = Math.sin(dartAngle) * dartSpeed;
                    }
                }

                // Apply friction/drag
                this.velocities[i * 2] *= 0.97;
                this.velocities[i * 2 + 1] *= 0.97;

                this.positions[i * 2] += this.velocities[i * 2];
                this.positions[i * 2 + 1] += this.velocities[i * 2 + 1];

                // Screen boundary collision
                if (this.positions[i * 2] < 0) { this.positions[i * 2] = 0; this.velocities[i * 2] *= -0.8; }
                if (this.positions[i * 2] > width) { this.positions[i * 2] = width; this.velocities[i * 2] *= -0.8; }
                if (this.positions[i * 2 + 1] < 0) { this.positions[i * 2 + 1] = 0; this.velocities[i * 2 + 1] *= -0.8; }
                if (this.positions[i * 2 + 1] > height) { this.positions[i * 2 + 1] = height; this.velocities[i * 2 + 1] *= -0.8; }

                // Blinking State Machine
                const blinkOffset = i * 6;
                let blinkState = this.blinkInfo[blinkOffset];
                let timer = this.blinkInfo[blinkOffset + 1];
                const fadeInTime = this.blinkInfo[blinkOffset + 2];
                const glowTime = this.blinkInfo[blinkOffset + 3];
                const fadeOutTime = this.blinkInfo[blinkOffset + 4];
                const darkTime = this.blinkInfo[blinkOffset + 5];
                const maxAlpha = config.maxAlpha || 1.0;

                timer -= 16.67; // Approximate ms per frame
                if (timer <= 0) {
                    blinkState = (blinkState + 1) % 4;
                    this.blinkInfo[blinkOffset] = blinkState;
                    const durations = [fadeInTime, glowTime, fadeOutTime, darkTime];
                    timer = durations[blinkState];
                }
                this.blinkInfo[blinkOffset + 1] = timer;

                switch (blinkState) {
                    case 0: // FADE_IN
                        this.alphas[i] = maxAlpha * (1.0 - timer / fadeInTime);
                        break;
                    case 1: // GLOW
                        this.alphas[i] = maxAlpha;
                        break;
                    case 2: // FADE_OUT
                        this.alphas[i] = maxAlpha * (timer / fadeOutTime);
                        break;
                    case 3: // DARK
                        this.alphas[i] = 0;
                        break;
                }
            } else if (this.behavior === 'ambient') {
                this.positions[i * 2] += this.velocities[i * 2];
                this.positions[i * 2 + 1] += this.velocities[i * 2 + 1];

                if (this.positions[i * 2] < 0 || this.positions[i * 2] > width) this.velocities[i * 2] *= -1;
                if (this.positions[i * 2 + 1] < 0 || this.positions[i * 2 + 1] > height) this.velocities[i * 2 + 1] *= -1;

            } else if (this.behavior === 'petal') {
                // Wind Gust Logic
                const now = Date.now();
                if (now - this.lastWindGust > this.nextWindGustTime) {
                    this.wind.x = Math.random() * 0.5 + 0.5; // Stronger gust
                    setTimeout(() => { this.wind.x = 0.1; }, Math.random() * 800 + 500); // Gust duration
                    this.lastWindGust = now;
                    this.nextWindGustTime = Math.random() * 4000 + 8000;
                }

                // Apply base velocity and wind
                this.positions[i * 2] += this.velocities[i * 2] + this.wind.x;
                this.positions[i * 2 + 1] += this.velocities[i * 2 + 1];
                this.rotations[i] += this.rotationSpeeds[i];

                // More complex sway using swayFactors
                const swayFrequency = this.swayFactors[i * 2];
                const swayAmplitude = this.swayFactors[i * 2 + 1];
                this.positions[i * 2] += Math.sin(this.positions[i * 2 + 1] / (50 / swayFrequency)) * swayAmplitude;


                // Reset when it goes off screen (bottom or sides)
                if (this.positions[i * 2 + 1] > height + 20 || this.positions[i * 2] > width + 20 || this.positions[i * 2] < -20) {
                    this.spawnParticle(i);
                }
            } else if (this.behavior === 'upward-waterfall') {
                this.positions[i * 2] += this.velocities[i * 2];
                this.positions[i * 2 + 1] += this.velocities[i * 2 + 1];
                if (this.positions[i * 2 + 1] < -20) { // Reset when it goes off top
                    this.spawnParticle(i);
                }
            } else if (this.behavior === 'spiraling-debris') {
                if (this.islandTargets && this.islandTargets.length > 0) {
                    const island = this.islandTargets[this.particleIslandMap[i]];
                    const rect = island.raw.getBoundingClientRect();
                    this.centers[i * 2] = rect.left + rect.width / 2;
                    this.centers[i * 2 + 1] = rect.top + rect.height / 2;
                }
                this.angles[i] += this.speeds[i];
                const centerX = this.centers[i * 2];
                const centerY = this.centers[i * 2 + 1];
                const radiusX = this.radii[i * 3];
                const radiusY = this.radii[i * 3 + 1];
                this.positions[i * 2] = centerX + Math.cos(this.angles[i]) * radiusX;
                this.positions[i * 2 + 1] = centerY + Math.sin(this.angles[i]) * radiusY;
                // Fade in and out
                this.alphas[i] = Math.sin(this.angles[i] * 0.5) * 0.5 + 0.5;

            } else if (this.behavior === 'horizontal-drift') {
                this.positions[i * 2] += this.velocities[i * 2];
                this.positions[i * 2 + 1] += this.velocities[i * 2 + 1];
                this.positions[i * 2 + 1] += Math.sin(this.positions[i * 2] / 100) * this.driftFactors[i] * 0.2;

                if ((this.velocities[i * 2] > 0 && this.positions[i * 2] > width + 20) ||
                    (this.velocities[i * 2] < 0 && this.positions[i * 2] < -20)) {
                    this.spawnParticle(i);
                }
            } else if (this.behavior === 'crystal-growth') {
                const lifetime = this.themeConfig.lifetime;
                const progress = (lifetime - this.lifetimes[i]) / lifetime;

                // Grow then shrink
                this.growthInfo[i * 2] += this.growthInfo[i * 2 + 1];
                this.sizes[i] = Math.min(this.themeConfig.maxSize, this.growthInfo[i * 2]);

                // Fade in then fade out
                if (progress < 0.5) {
                    this.alphas[i] = progress * 2 * this.themeConfig.maxAlpha;
                } else {
                    this.alphas[i] = (1 - progress) * 2 * this.themeConfig.maxAlpha;
                }

                if (this.lifetimes[i] <= 0) {
                    this.spawnParticle(i);
                }
            } else if (this.behavior === 'incense-smoke') {
                const lifetime = this.themeConfig.lifetime;
                const progress = (lifetime - this.lifetimes[i]) / lifetime;

                // Update spiral
                this.spiralInfo[i * 3] += this.spiralInfo[i * 3 + 2]; // angle
                this.spiralInfo[i * 3 + 1] += 0.1; // radius increases

                const spiralX = Math.cos(this.spiralInfo[i * 3]) * this.spiralInfo[i * 3 + 1];
                this.positions[i * 2] += spiralX;
                this.positions[i * 2 + 1] += this.velocities[i * 2 + 1];

                // Fade in and out
                if (progress < 0.2) {
                    this.alphas[i] = progress / 0.2 * this.themeConfig.maxAlpha;
                } else {
                    this.alphas[i] = (1 - (progress - 0.2) / 0.8) * this.themeConfig.maxAlpha;
                }
                this.sizes[i] = this.themeConfig.minSize + progress * (this.themeConfig.maxSize - this.themeConfig.minSize);

                if (this.lifetimes[i] <= 0) {
                    this.spawnParticle(i);
                }
            } else if (this.behavior === 'waterfall') {
                this.positions[i * 2] += this.velocities[i * 2];
                this.positions[i * 2 + 1] += this.velocities[i * 2 + 1];
                // Lifetime check at the top handles respawning
            } else { // standard behavior
                this.positions[i * 2] += this.velocities[i * 2];
                this.positions[i * 2 + 1] += this.velocities[i * 2 + 1];

                if (this.positions[i * 2] < 0 || this.positions[i * 2] > width ||
                    this.positions[i * 2 + 1] < 0 || this.positions[i * 2 + 1] > height) {
                    this.spawnParticle(i);
                }
            }
        }
    }

    bindBuffers(program) {
        const gl = this.gl;

        const positionLocation = gl.getAttribLocation(program, "a_position");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const sizeLocation = gl.getAttribLocation(program, "a_size");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.sizes, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(sizeLocation);
        gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, 0, 0);

        const alphaLocation = gl.getAttribLocation(program, "a_alpha");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.alphaBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.alphas, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(alphaLocation);
        gl.vertexAttribPointer(alphaLocation, 1, gl.FLOAT, false, 0, 0);
    }

    draw() {
        this.gl.drawArrays(this.gl.POINTS, 0, this.numParticles);
    }
}

class WebGLRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = this.canvas.getContext('webgl', { depth: true, antialias: true }) || this.canvas.getContext('experimental-webgl', { depth: true, antialias: true });

        if (!this.gl) {
            console.error("WebGL not supported!");
            return;
        }

        this.gl.enable(this.gl.DEPTH_TEST);

        this.textureProgram = this.createProgram(TEXTURE_VERTEX_SHADER, TEXTURE_FRAGMENT_SHADER);
        this.textureProgram.uniforms = {
            u_texture: this.gl.getUniformLocation(this.textureProgram, "u_texture"),
        };

        this.particleProgram = this.createProgram(PARTICLE_VERTEX_SHADER, PARTICLE_FRAGMENT_SHADER);
        this.particleProgram.uniforms = {
            u_resolution: this.gl.getUniformLocation(this.particleProgram, "u_resolution"),
            u_zIndex: this.gl.getUniformLocation(this.particleProgram, "u_zIndex"),
            u_color: this.gl.getUniformLocation(this.particleProgram, "u_color"),
        };

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.texturedQuads = [];
        this.particleSystems = [];
        this.render = this.render.bind(this);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    addLayer(sourceCanvas, zIndex) {
        const quad = new TexturedQuad(this.gl, sourceCanvas, zIndex);
        this.texturedQuads.push(quad);
        this.texturedQuads.sort((a, b) => a.zIndex - b.zIndex);
    }

    createProgram(vertexShaderSource, fragmentShaderSource) {
        const gl = this.gl;
        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    start() {
        if (this.animationFrameId) {
            this.stop();
        }
        this.animationFrameId = requestAnimationFrame(this.render);
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        // Clear the canvas when stopping
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }


    render() {
        const gl = this.gl;
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Draw textured quads
        gl.useProgram(this.textureProgram);
        gl.uniform1i(this.textureProgram.uniforms.u_texture, 0);

        this.texturedQuads.forEach(quad => {
            gl.activeTexture(gl.TEXTURE0);
            quad.bindBuffers(this.textureProgram);
            quad.draw();
        });

        // Draw particle systems
        gl.useProgram(this.particleProgram);
        gl.uniform2f(this.particleProgram.uniforms.u_resolution, gl.canvas.width, gl.canvas.height);

        this.particleSystems.forEach(ps => {
            gl.uniform1f(this.particleProgram.uniforms.u_zIndex, ps.zIndex);
            gl.uniform3fv(this.particleProgram.uniforms.u_color, ps.themeConfig.color || [1.0, 1.0, 1.0]);
            ps.update();
            ps.bindBuffers(this.particleProgram);
            ps.draw();
        });

        this.animationFrameId = requestAnimationFrame(this.render);
    }

    loadTheme(themeName, themeData = null) {
        this.particleSystems = [];
        this.texturedQuads = [];
        this.stop();

        const setupParticles = (islandData) => {
            if (themeName === 'floating-islands') {
                const upwardWaterfallConfig = {
                    behavior: 'upward-waterfall',
                    speed: 1.5,
                    minSize: 2.0,
                    maxSize: 5.0,
                    minAlpha: 0.3,
                    maxAlpha: 0.8,
                    lifetime: 400,
                    zIndex: -0.4,
                    color: [0.39, 0.71, 0.98], // #64b5f6
                    islandData: islandData
                };
                this.particleSystems.push(new ParticleSystem(this.gl, 300, upwardWaterfallConfig));

                const amethystConfig = {
                    behavior: 'spiraling-debris',
                    minSize: 4.0, maxSize: 9.0, minAlpha: 0.8, maxAlpha: 1.0,
                    lifetime: Infinity, zIndex: -0.2, color: [0.73, 0.41, 0.78], // #ba68c8
                    islandData: islandData
                };
                this.particleSystems.push(new ParticleSystem(this.gl, 20, amethystConfig));

                const roseQuartzConfig = {
                    behavior: 'spiraling-debris',
                    minSize: 3.0, maxSize: 7.0, minAlpha: 0.8, maxAlpha: 1.0,
                    lifetime: Infinity, zIndex: -0.2, color: [0.97, 0.73, 0.82], // #f8bbd0
                    islandData: islandData
                };
                this.particleSystems.push(new ParticleSystem(this.gl, 25, roseQuartzConfig));

                const anomalyConfig = {
                    behavior: 'spiraling-debris',
                    minSize: 1.5, maxSize: 3.0, minAlpha: 0.5, maxAlpha: 0.9,
                    lifetime: Infinity, zIndex: -0.3, color: [1.0, 0.8, 0.5], // #ffcc80
                    islandData: islandData
                };
                this.particleSystems.push(new ParticleSystem(this.gl, 40, anomalyConfig));
            }
            this.start();
        };

        if (themeName === 'floating-islands') {
            // The island data is populated asynchronously, so we need to wait for it.
            // A simple timeout will work for this context.
            setTimeout(() => {
                if (themeData && themeData.length > 0) {
                    setupParticles(themeData);
                } else {
                    // Retry if the data isn't ready yet
                    setTimeout(() => setupParticles(themeData), 100);
                }
            }, 50);
            return;
        }

        if (themeName === 'himalayan-peak') {
            const snowConfig = {
                behavior: 'horizontal-drift',
                speed: 1.5, // Faster, sharper wind
                minSize: 1.0,
                maxSize: 3.0,
                minAlpha: 0.4,
                maxAlpha: 0.9,
                lifetime: Infinity, // They reset when off-screen
                zIndex: -0.6,
                color: [1.0, 1.0, 1.0]
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 250, snowConfig));
            this.start();
        } else if (themeName === 'ice-temple') {
            const snowCrystalConfig = {
                behavior: 'petal', // Use petal logic for gentle falling snow
                speed: 0.5,
                minSize: 2.0,
                maxSize: 5.0,
                minAlpha: 0.5,
                maxAlpha: 1.0,
                lifetime: 1600,
                zIndex: -0.5,
                color: [0.9, 0.95, 1.0]
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 80, snowCrystalConfig));

            const iceGrowthConfig = {
                behavior: 'crystal-growth',
                speed: 1.0, // Controls growth rate
                minSize: 0.0,
                maxSize: 4.0,
                minAlpha: 0.0,
                maxAlpha: 0.7,
                lifetime: 500, // shorter life, they appear and disappear
                zIndex: -0.3, // On top of most things
                color: [0.8, 0.9, 1.0]
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 100, iceGrowthConfig));

            this.start();
        } else if (themeName === 'moonlit-forest') {
            // Background fireflies (dimmer, smaller)
            const fireflyBackConfig = {
                behavior: 'firefly',
                minSize: 1.0, maxSize: 3.0,
                maxAlpha: 0.7,
                lifetime: Infinity, zIndex: -0.7,
                color: [0.78, 0.91, 0.42] // #C8E86B
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 15, fireflyBackConfig));

            // Mid-ground fireflies (primary layer)
            const fireflyMidConfig = {
                behavior: 'firefly',
                minSize: 2.0, maxSize: 5.0,
                maxAlpha: 1.0,
                lifetime: Infinity, zIndex: -0.5,
                color: [0.99, 0.86, 0.45] // #FFE873
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 20, fireflyMidConfig));

            // Foreground fireflies (larger, brighter)
            const fireflyFrontConfig = {
                behavior: 'firefly',
                minSize: 3.0, maxSize: 6.0,
                maxAlpha: 1.0,
                lifetime: Infinity, zIndex: -0.1,
                color: [0.98, 0.86, 0.36] // #F9DC5C
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 10, fireflyFrontConfig));

            // Magical dust particles in moonbeams
            const dustConfig = {
                behavior: 'ambient',
                speed: 0.15,
                minSize: 1.0, maxSize: 2.0,
                minAlpha: 0.1, maxAlpha: 0.4,
                lifetime: Infinity,
                zIndex: -0.4, // Positioned within moonbeam area
                color: [0.95, 0.92, 0.8] // Soft yellow-white
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 70, dustConfig));
            this.start();
        } else if (themeName === 'meditation-temple') {
            const smokeConfig = {
                behavior: 'incense-smoke',
                speed: 1.0,
                minSize: 2.0,
                maxSize: 15.0,
                minAlpha: 0.0,
                maxAlpha: 0.15,
                lifetime: 1200, // 20 seconds
                zIndex: -0.1,
                color: [0.9, 0.9, 0.95]
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 20, smokeConfig));
            this.start();
        } else if (themeName === 'crystal-cave') {
            const shardConfig = {
                speed: 0.8,
                minSize: 4.0,
                maxSize: 10.0,
                minAlpha: 0.4,
                maxAlpha: 0.8,
                lifetime: 1500,
                zIndex: -0.4,
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 25, shardConfig));

            const dustConfig = {
                speed: 0.2,
                minSize: 1.0,
                maxSize: 2.5,
                minAlpha: 0.3,
                maxAlpha: 0.7,
                lifetime: 2000,
                zIndex: -0.3,
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 100, dustConfig));
            this.start();
        } else if (themeName === 'candlelit-monastery') {
            const smokeConfig = {
                speed: 0.5,
                minSize: 2.0,
                maxSize: 10.0,
                minAlpha: 0.1,
                maxAlpha: 0.3,
                lifetime: 1800,
                zIndex: -0.5, // In front of archways
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 15, smokeConfig));
            this.start();
        } else if (themeName === 'forest') {
            const ambientConfig = {
                behavior: 'ambient',
                speed: 0.2,
                minSize: 1.0,
                maxSize: 3.0,
                minAlpha: 0.1,
                maxAlpha: 0.4,
                lifetime: Infinity,
                zIndex: -0.2,
                color: [0.8, 0.87, 1.0] // Bluish white
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 50, ambientConfig));

            const fireflyConfig = {
                behavior: 'firefly',
                minSize: 8.0,
                maxSize: 12.0,
                minAlpha: 0.3,
                maxAlpha: 1.0,
                lifetime: Infinity,
                zIndex: -0.1,
                color: [0.94, 0.94, 0.66] // Yellowish
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 25, fireflyConfig));
            this.start();
        } else if (themeName === 'cherry-blossom-garden') {
            // Create 3 layers of petals for depth
            const petalLayers = [
                { // Far layer
                    behavior: 'petal', speed: 0.6, minSize: 4.0, maxSize: 8.0,
                    minAlpha: 0.6, maxAlpha: 0.8, lifetime: 1800, // ~30 seconds
                    zIndex: -0.5, color: [1.0, 0.8, 0.85], count: 60
                },
                { // Mid layer
                    behavior: 'petal', speed: 0.8, minSize: 6.0, maxSize: 12.0,
                    minAlpha: 0.8, maxAlpha: 1.0, lifetime: 1500, // ~25 seconds
                    zIndex: -0.3, color: [1.0, 0.85, 0.9], count: 80
                },
                { // Near layer
                    behavior: 'petal', speed: 1.0, minSize: 8.0, maxSize: 15.0,
                    minAlpha: 0.9, maxAlpha: 1.0, lifetime: 1200, // ~20 seconds
                    zIndex: -0.1, color: [1.0, 0.9, 0.95], count: 60
                }
            ];

            petalLayers.forEach(config => {
                this.particleSystems.push(new ParticleSystem(this.gl, config.count, config));
            });

            this.start();
        }
    }
}