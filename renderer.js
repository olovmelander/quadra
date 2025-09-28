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

    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, v_alpha);
    }
`;

class ParticleSystem {
    constructor(gl, numParticles, themeConfig) {
        this.gl = gl;
        this.numParticles = numParticles;
        this.themeConfig = themeConfig;
        this.zIndex = themeConfig.zIndex || 0.0;

        this.positions = new Float32Array(numParticles * 2);
        this.velocities = new Float32Array(numParticles * 2);
        this.sizes = new Float32Array(numParticles);
        this.alphas = new Float32Array(numParticles);
        this.lifetimes = new Float32Array(numParticles);

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

        this.positions[i * 2] = Math.random() * width;
        this.positions[i * 2 + 1] = Math.random() * height;

        this.velocities[i * 2] = (Math.random() - 0.5) * config.speed;
        this.velocities[i * 2 + 1] = (Math.random() - 0.5) * config.speed;

        this.sizes[i] = Math.random() * (config.maxSize - config.minSize) + config.minSize;
        this.alphas[i] = Math.random() * (config.maxAlpha - config.minAlpha) + config.minAlpha;
        this.lifetimes[i] = Math.random() * config.lifetime;
    }

    update() {
        const { width, height } = this.gl.canvas;

        for (let i = 0; i < this.numParticles; i++) {
            this.lifetimes[i]--;
            if (this.lifetimes[i] <= 0) {
                this.spawnParticle(i);
            }

            this.positions[i * 2] += this.velocities[i * 2];
            this.positions[i * 2 + 1] += this.velocities[i * 2 + 1];

            if (this.positions[i * 2] < 0 || this.positions[i * 2] > width ||
                this.positions[i * 2 + 1] < 0 || this.positions[i * 2 + 1] > height) {
                this.spawnParticle(i);
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
            const himalayanConfig = {
                speed: 0.5,
                minSize: 1.0,
                maxSize: 2.5,
                minAlpha: 0.2,
                maxAlpha: 0.7,
                lifetime: 1000,
                zIndex: -0.6 // In front of mountains (-0.7) but behind other things
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 70, himalayanConfig));
            this.start();
        } else if (themeName === 'ice-temple') {
            const snowCrystalConfig = {
                speed: 1.5,
                minSize: 2.0,
                maxSize: 5.0,
                minAlpha: 0.5,
                maxAlpha: 1.0,
                lifetime: 800,
                zIndex: -0.5, // In front of crystals
            };
            this.particleSystems.push(new ParticleSystem(this.gl, 80, snowCrystalConfig));
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
        }
    }
}