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
    attribute vec3 a_color;

    varying float v_alpha;
    varying vec3 v_color;

    uniform vec2 u_resolution;
    uniform float u_zIndex;

    void main() {
        vec2 zeroToOne = a_position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, -1), u_zIndex, 1);
        gl_PointSize = a_size;
        v_alpha = a_alpha;
        v_color = a_color;
    }
`;

const PARTICLE_FRAGMENT_SHADER = `
    precision mediump float;

    varying float v_alpha;
    varying vec3 v_color;

    void main() {
        float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
        if (dist > 0.5) {
            discard;
        }
        // Create a smooth falloff for a glowing effect
        float glow = pow(1.0 - dist * 2.0, 2.0);
        gl_FragColor = vec4(v_color, v_alpha * glow);
    }
`;

class ParticleSystem {
    constructor(gl, numParticles, themeConfig) {
        this.gl = gl;
        this.numParticles = numParticles;
        this.themeConfig = themeConfig;
        this.zIndex = themeConfig.zIndex || 0.0;
        this.behavior = themeConfig.behavior || 'standard';

        this.positions = new Float32Array(numParticles * 2);
        this.velocities = new Float32Array(numParticles * 2);
        this.sizes = new Float32Array(numParticles);
        this.alphas = new Float32Array(numParticles);
        this.lifetimes = new Float32Array(numParticles);
        this.colors = new Float32Array(numParticles * 3);

        if (this.behavior === 'firefly') {
            this.wanderAngles = new Float32Array(numParticles);
            this.blinkInfo = new Float32Array(numParticles * 4); // lastBlinkTime, blinkDuration, nextBlinkInterval, isBlinking
        } else if (this.behavior === 'petal') {
            this.rotations = new Float32Array(numParticles);
            this.rotationSpeeds = new Float32Array(numParticles);
            this.swayFactors = new Float32Array(numParticles * 2); // For more complex sway
            this.wind = { x: 0.1, y: 0 };
            this.lastWindGust = 0;
            this.nextWindGustTime = Math.random() * 4000 + 8000; // 8-12 seconds
        } else if (this.behavior === 'orbital-debris') {
            this.angles = new Float32Array(numParticles);
            this.radii = new Float32Array(numParticles * 2); // x-radius, y-radius
            this.centers = new Float32Array(numParticles * 2);
            this.speeds = new Float32Array(numParticles);
            this.orbitDurations = new Float32Array(numParticles);
        } else if (this.behavior === 'gravitational-anomaly') {
            this.spiralInfo = new Float32Array(numParticles * 4); // angle, radius, speed, height
            this.centers = new Float32Array(numParticles * 2);
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
        this.colorBuffer = gl.createBuffer();

        for (let i = 0; i < numParticles; i++) {
            this.spawnParticle(i);
        }
    }

    spawnParticle(i) {
        const { width, height } = this.gl.canvas;
        const config = this.themeConfig;

        this.positions[i * 2] = Math.random() * width;
        this.positions[i * 2 + 1] = Math.random() * height;

        this.sizes[i] = Math.random() * (config.maxSize - config.minSize) + config.minSize;
        this.lifetimes[i] = config.lifetime === Infinity ? Infinity : Math.random() * config.lifetime;

        if (this.behavior === 'firefly') {
            this.velocities[i * 2] = 0;
            this.velocities[i * 2 + 1] = 0;
            this.wanderAngles[i] = Math.random() * Math.PI * 2;
            this.blinkInfo[i * 4] = Date.now();
            this.blinkInfo[i * 4 + 1] = Math.random() * 200 + 100;
            this.blinkInfo[i * 4 + 2] = Math.random() * 3000 + 2000;
            this.blinkInfo[i * 4 + 3] = 0;
            this.alphas[i] = config.minAlpha;
            this.colors[i * 3] = config.color[0]; this.colors[i * 3 + 1] = config.color[1]; this.colors[i * 3 + 2] = config.color[2];
        } else if (this.behavior === 'petal') {
            this.positions[i * 2] = Math.random() * (width + 200) - 100;
            this.positions[i * 2 + 1] = -Math.random() * 50 - 10;
            this.velocities[i * 2] = (Math.random() - 0.5) * 0.3;
            this.velocities[i * 2 + 1] = (Math.random() * 0.3 + 0.7) * config.speed;
            this.rotations[i] = Math.random() * 360;
            this.rotationSpeeds[i] = (Math.random() - 0.5) * 3;
            this.alphas[i] = Math.random() * (config.maxAlpha - config.minAlpha) + config.minAlpha;
            this.swayFactors[i * 2] = Math.random() * 2 + 1;
            this.swayFactors[i * 2 + 1] = Math.random() * 0.5 + 0.5;
            this.colors[i * 3] = config.color[0]; this.colors[i * 3 + 1] = config.color[1]; this.colors[i * 3 + 2] = config.color[2];
        } else if (this.behavior === 'upward-waterfall') {
            const streamWidth = width * 0.7;
            const streamOffset = (width - streamWidth) / 2;
            this.positions[i * 2] = streamOffset + Math.random() * streamWidth;
            this.positions[i * 2 + 1] = height + Math.random() * 50; // Start from bottom
            this.velocities[i * 2] = (Math.random() - 0.5) * config.speed * 0.1;
            this.velocities[i * 2 + 1] = -(Math.random() * 0.4 + 0.8) * config.speed; // Fast upwards
            this.alphas[i] = Math.random() * (config.maxAlpha - config.minAlpha) + config.minAlpha;
            this.lifetimes[i] = Math.random() * config.lifetime;
            this.colors[i * 3] = config.startColor[0];
            this.colors[i * 3 + 1] = config.startColor[1];
            this.colors[i * 3 + 2] = config.startColor[2];
        } else if (this.behavior === 'orbital-debris') {
            const islandCenters = [[0.25 * width, 0.4 * height], [0.5 * width, 0.5 * height], [0.75 * width, 0.6 * height]];
            const center = islandCenters[i % islandCenters.length];
            this.centers[i * 2] = center[0] + (Math.random() - 0.5) * 100;
            this.centers[i * 2 + 1] = center[1] + (Math.random() - 0.5) * 50;
            this.radii[i * 2] = Math.random() * 150 + 100; // x-radius
            this.radii[i * 2 + 1] = this.radii[i * 2] * (Math.random() * 0.3 + 0.3); // y-radius
            this.angles[i] = Math.random() * Math.PI * 2;
            this.orbitDurations[i] = this.lifetimes[i];
            this.speeds[i] = (2 * Math.PI) / this.orbitDurations[i] * (Math.random() > 0.5 ? 1 : -1);
            this.colors[i * 3] = config.color[0];
            this.colors[i * 3 + 1] = config.color[1];
            this.colors[i * 3 + 2] = config.color[2];
            this.alphas[i] = Math.random() * (config.maxAlpha - config.minAlpha) + config.minAlpha;
        } else if (this.behavior === 'gravitational-anomaly') {
            const islandCenters = [[0.25 * width, 0.4 * height], [0.5 * width, 0.5 * height], [0.75 * width, 0.6 * height]];
            const center = islandCenters[i % islandCenters.length];
            this.centers[i * 2] = center[0];
            this.centers[i * 2 + 1] = center[1];
            this.spiralInfo[i * 4] = Math.random() * Math.PI * 2; // angle
            this.spiralInfo[i * 4 + 1] = Math.random() * 80 + 50; // radius
            this.spiralInfo[i * 4 + 2] = (Math.random() - 0.5) * 0.04; // spiral speed
            const color = config.colors[i % config.colors.length];
            this.colors[i * 3] = color[0];
            this.colors[i * 3 + 1] = color[1];
            this.colors[i * 3 + 2] = color[2];
            this.alphas[i] = Math.random() * (config.maxAlpha - config.minAlpha) + config.minAlpha;
            this.lifetimes[i] = Math.random() * 15 * 60 + 25 * 60; // 25-40 seconds
        } else if (this.behavior === 'horizontal-drift') {
            const fromLeft = Math.random() > 0.5;
            this.positions[i * 2] = fromLeft ? -Math.random() * 50 : width + Math.random() * 50;
            this.positions[i * 2 + 1] = Math.random() * height;
            this.velocities[i * 2] = (fromLeft ? 1 : -1) * (Math.random() * 0.5 + 0.5) * config.speed;
            this.velocities[i * 2 + 1] = (Math.random() - 0.5) * 0.1;
            this.alphas[i] = Math.random() * (config.maxAlpha - config.minAlpha) + config.minAlpha;
            this.driftFactors[i] = Math.random() * 2 - 1;
            this.colors[i * 3] = config.color[0]; this.colors[i * 3 + 1] = config.color[1]; this.colors[i * 3 + 2] = config.color[2];
        } else if (this.behavior === 'crystal-growth') {
            this.positions[i * 2] = Math.random() * width;
            this.positions[i * 2 + 1] = Math.random() * height;
            this.growthInfo[i * 2] = 0;
            this.growthInfo[i * 2 + 1] = (Math.random() * 0.02 + 0.01) * config.speed;
            this.lifetimes[i] = config.lifetime;
            this.alphas[i] = 0;
            this.sizes[i] = config.maxSize;
            this.colors[i * 3] = config.color[0]; this.colors[i * 3 + 1] = config.color[1]; this.colors[i * 3 + 2] = config.color[2];
        } else if (this.behavior === 'incense-smoke') {
            this.positions[i * 2] = width / 2 + (Math.random() - 0.5) * 100;
            this.positions[i * 2 + 1] = height;
            this.velocities[i * 2] = 0;
            this.velocities[i * 2 + 1] = -(Math.random() * 0.3 + 0.2) * config.speed;
            this.spiralInfo[i * 3] = Math.random() * Math.PI * 2;
            this.spiralInfo[i * 3 + 1] = Math.random() * 10 + 5;
            this.spiralInfo[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
            this.lifetimes[i] = config.lifetime;
            this.alphas[i] = 0;
            this.colors[i * 3] = config.color[0]; this.colors[i * 3 + 1] = config.color[1]; this.colors[i * 3 + 2] = config.color[2];
        } else { // 'standard' or 'ambient'
            this.velocities[i * 2] = (Math.random() - 0.5) * config.speed;
            this.velocities[i * 2 + 1] = (Math.random() - 0.5) * config.speed;
            this.alphas[i] = Math.random() * (config.maxAlpha - config.minAlpha) + config.minAlpha;
            this.colors[i * 3] = config.color[0]; this.colors[i * 3 + 1] = config.color[1]; this.colors[i * 3 + 2] = config.color[2];
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
                this.wanderAngles[i] += (Math.random() - 0.5) * 0.4;
                this.velocities[i * 2] += Math.cos(this.wanderAngles[i]) * 0.08;
                this.velocities[i * 2 + 1] += Math.sin(this.wanderAngles[i]) * 0.08;
                this.velocities[i * 2] *= 0.96; this.velocities[i * 2 + 1] *= 0.96;
                this.positions[i * 2] += this.velocities[i * 2]; this.positions[i * 2 + 1] += this.velocities[i * 2 + 1];
                if (this.positions[i * 2] < 0) { this.positions[i * 2] = 0; this.velocities[i * 2] *= -1; }
                if (this.positions[i * 2] > width) { this.positions[i * 2] = width; this.velocities[i * 2] *= -1; }
                if (this.positions[i * 2 + 1] < 0) { this.positions[i * 2 + 1] = 0; this.velocities[i * 2 + 1] *= -1; }
                if (this.positions[i * 2 + 1] > height) { this.positions[i * 2 + 1] = height; this.velocities[i * 2 + 1] *= -1; }
                const now = Date.now();
                if (this.blinkInfo[i * 4 + 3] === 1) {
                    if (now - this.blinkInfo[i * 4] > this.blinkInfo[i * 4 + 1]) { this.blinkInfo[i * 4 + 3] = 0; this.alphas[i] = config.minAlpha; }
                } else {
                    if (now - this.blinkInfo[i * 4] > this.blinkInfo[i * 4 + 2]) { this.blinkInfo[i * 4] = now; this.blinkInfo[i * 4 + 3] = 1; this.blinkInfo[i * 4 + 2] = Math.random() * 6000 + 2000; this.alphas[i] = config.maxAlpha; }
                }
            } else if (this.behavior === 'petal') {
                const now = Date.now();
                if (now - this.lastWindGust > this.nextWindGustTime) {
                    this.wind.x = Math.random() * 0.5 + 0.5;
                    setTimeout(() => { this.wind.x = 0.1; }, Math.random() * 800 + 500);
                    this.lastWindGust = now;
                    this.nextWindGustTime = Math.random() * 4000 + 8000;
                }
                this.positions[i * 2] += this.velocities[i * 2] + this.wind.x;
                this.positions[i * 2 + 1] += this.velocities[i * 2 + 1];
                this.rotations[i] += this.rotationSpeeds[i];
                this.positions[i * 2] += Math.sin(this.positions[i * 2 + 1] / (50 / this.swayFactors[i * 2])) * this.swayFactors[i * 2 + 1];
                if (this.positions[i * 2 + 1] > height + 20 || this.positions[i * 2] > width + 20 || this.positions[i * 2] < -20) { this.spawnParticle(i); }
            } else if (this.behavior === 'upward-waterfall') {
                this.positions[i * 2] += this.velocities[i * 2];
                this.positions[i * 2 + 1] += this.velocities[i * 2 + 1];
                const progress = 1 - (this.lifetimes[i] / config.lifetime);
                this.colors[i * 3] = config.startColor[0] + (config.endColor[0] - config.startColor[0]) * progress;
                this.colors[i * 3 + 1] = config.startColor[1] + (config.endColor[1] - config.startColor[1]) * progress;
                this.colors[i * 3 + 2] = config.startColor[2] + (config.endColor[2] - config.startColor[2]) * progress;
                if (progress > 0.6) { this.alphas[i] = config.maxAlpha * (1 - (progress - 0.6) / 0.4); }
                if (progress > 0.8) { this.sizes[i] = config.maxSize * (1 + (progress - 0.8) * 2); }
                if (this.positions[i * 2 + 1] < -20) { this.spawnParticle(i); }
            } else if (this.behavior === 'orbital-debris') {
                this.angles[i] += this.speeds[i];
                if (this.angles[i] > Math.PI * 2) this.angles[i] -= Math.PI * 2;
                if (this.angles[i] < 0) this.angles[i] += Math.PI * 2;
                this.positions[i * 2] = this.centers[i * 2] + Math.cos(this.angles[i]) * this.radii[i * 2];
                this.positions[i * 2 + 1] = this.centers[i * 2 + 1] + Math.sin(this.angles[i]) * this.radii[i * 2 + 1];
            } else if (this.behavior === 'gravitational-anomaly') {
                const fullLifetime = Math.random() * 15 * 60 + 25 * 60;
                const progress = 1 - (this.lifetimes[i] / fullLifetime);
                this.spiralInfo[i * 4] += this.spiralInfo[i * 4 + 2];
                const radius = this.spiralInfo[i * 4 + 1] * (1 - progress);
                const centerX = this.centers[i * 2] + Math.cos(progress * Math.PI * 8) * 50;
                const centerY = this.centers[i * 2 + 1] + Math.sin(progress * Math.PI * 6) * 30;
                this.positions[i * 2] = centerX + Math.cos(this.spiralInfo[i * 4]) * radius;
                this.positions[i * 2 + 1] = centerY + Math.sin(this.spiralInfo[i * 4]) * radius;
                this.alphas[i] = (1 - progress) * config.maxAlpha;
            } else {
                this.positions[i * 2] += this.velocities[i * 2];
                this.positions[i * 2 + 1] += this.velocities[i * 2 + 1];
                if (this.positions[i * 2] < 0 || this.positions[i * 2] > width || this.positions[i * 2 + 1] < 0 || this.positions[i * 2 + 1] > height) { this.spawnParticle(i); }
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
        const colorLocation = gl.getAttribLocation(program, "a_color");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(colorLocation);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
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
            ps.update();
            ps.bindBuffers(this.particleProgram);
            ps.draw();
        });

        this.animationFrameId = requestAnimationFrame(this.render);
    }

    loadTheme(themeName) {
        this.particleSystems = [];
        this.texturedQuads = [];
        this.stop();

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
        } else if (themeName === 'floating-islands') {
            // 1. Upward Waterfalls
            const upwardWaterfallConfig = {
                behavior: 'upward-waterfall',
                speed: 1.5, // Slower, more graceful
                minSize: 3.0,
                maxSize: 6.0,
                minAlpha: 0.8,
                maxAlpha: 1.0,
                lifetime: 400, // Longer lifetime to reach top and fade
                zIndex: -0.6, // Behind islands
                startColor: [0.39, 0.71, 0.98], // #64B5F6
                endColor: [0.88, 0.74, 0.95] // #E1BEE7
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 300, upwardWaterfallConfig));

            // 2. Floating Debris - Amethyst
            const amethystConfig = {
                behavior: 'orbital-debris',
                minSize: 4.0, maxSize: 8.0, minAlpha: 0.9, maxAlpha: 1.0, lifetime: 18 * 60, // 18 seconds
                zIndex: -0.5, color: [0.73, 0.41, 0.78], // #BA68C8
                glowColor: [1.0, 1.0, 1.0]
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 20, amethystConfig));

            // 3. Floating Debris - Rose Quartz
            const roseQuartzConfig = {
                behavior: 'orbital-debris',
                minSize: 5.0, maxSize: 10.0, minAlpha: 0.9, maxAlpha: 1.0, lifetime: 22 * 60, // 22 seconds
                zIndex: -0.5, color: [0.97, 0.73, 0.82], // #F8BBD0
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 15, roseQuartzConfig));

            // 4. Floating Debris - Clear Crystals
            const clearCrystalConfig = {
                behavior: 'orbital-debris',
                minSize: 3.0, maxSize: 7.0, minAlpha: 0.9, maxAlpha: 1.0, lifetime: 15 * 60, // 15 seconds
                zIndex: -0.5, color: [0.88, 0.96, 0.99], // #E1F5FE
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 25, clearCrystalConfig));

            // 5. Gravitational Anomalies
            const anomalyConfig = {
                behavior: 'gravitational-anomaly',
                speed: 0.8,
                minSize: 2.0, maxSize: 4.0, minAlpha: 0.7, maxAlpha: 1.0, lifetime: 30 * 60, // 25-40 seconds
                zIndex: -0.4,
                colors: [[1.0, 0.8, 0.5], [1.0, 0.84, 0.31]] // #ffcc80, #ffd54f
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 40, anomalyConfig));
            this.start();
        }
    }
}