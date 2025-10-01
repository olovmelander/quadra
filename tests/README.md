# Quadra Test Suite

This directory contains all tests and benchmarks for the Quadra game.

## Directory Structure

```
tests/
├── unit/              # Automated unit tests (run with Node.js)
│   ├── test-optimization.js
│   └── test-god-rays.js
├── performance/       # Interactive performance benchmarks (run in browser)
│   ├── benchmark-rendering.html
│   └── test-god-rays-performance.html
└── README.md
```

## Running Tests

### Unit Tests

Unit tests verify code correctness and optimization implementations.

**Run all unit tests:**
```bash
cd tests/unit
node test-optimization.js
node test-god-rays.js
```

**Run specific test:**
```bash
node tests/unit/test-optimization.js
node tests/unit/test-god-rays.js
```

#### Available Unit Tests

**`test-optimization.js`** - WebGL Renderer Optimization
- Verifies attribute location caching in TexturedQuad
- Verifies attribute location caching in ParticleSystem
- Ensures no redundant `getAttribLocation()` calls
- Validates core rendering logic integrity

**`test-god-rays.js`** - Sunset God Rays Optimization
- Verifies CSS definitions exist for god rays
- Checks GPU acceleration optimization
- Validates animation efficiency
- Confirms visual output functionality
- Tests theme layering and interaction optimization

**`test-rainy-window-optimization.js`** - Rainy Window Collision Optimization
- Verifies squared distance comparison (no sqrt in collision)
- Checks swap-and-pop array removal optimization
- Validates style string caching
- Ensures Math.pow() replaced with multiplication
- Confirms core animation logic integrity
- Verifies only 1 sqrt() call remains (for drop merge)

### Performance Benchmarks

Performance benchmarks provide interactive measurements and visualizations.

**Run benchmarks:**
1. Open the HTML file in a web browser
2. Click the "Run Benchmark" button
3. Review the performance metrics

#### Available Benchmarks

**`benchmark-rendering.html`** - WebGL Rendering Performance
- Measures frame rendering time
- Tests particle system performance
- Benchmarks texture quad rendering
- Provides before/after optimization comparison

**`test-god-rays-performance.html`** - God Rays Performance
- Measures initial render time
- Tests style recalculation overhead
- Monitors memory usage
- Verifies GPU acceleration status
- Validates visual output

**`benchmark-rainy-window.html`** - Rainy Window Performance
- Real-time FPS monitoring
- Frame time measurement and analysis
- Validates collision optimization (no sqrt in hot path)
- Verifies array removal efficiency (O(1) swap-and-pop)
- Confirms style string caching
- Interactive 5-second benchmark with detailed metrics

## Test Organization Philosophy

### Unit Tests (`tests/unit/`)
- **Purpose:** Automated verification of code correctness
- **Runtime:** Node.js
- **Output:** Pass/fail with detailed diagnostics
- **CI/CD:** Can be integrated into automated pipelines

### Performance Tests (`tests/performance/`)
- **Purpose:** Interactive performance measurement and visualization
- **Runtime:** Web browser
- **Output:** Visual metrics, charts, and comparisons
- **Use Case:** Manual performance validation and debugging

## Adding New Tests

### Adding a Unit Test

1. Create `tests/unit/test-your-feature.js`
2. Use Node.js filesystem API to read source files
3. Implement verification logic
4. Exit with code 0 (pass) or 1 (fail)
5. Update this README

Example structure:
```javascript
const fs = require('fs');

console.log('=== Your Feature Test ===\n');

const sourceCode = fs.readFileSync('./your-file.js', 'utf8');

console.log('Test 1: Description');
if (sourceCode.includes('expected-pattern')) {
    console.log('  ✓ PASS');
} else {
    console.log('  ✗ FAIL');
    process.exit(1);
}

console.log('\n=== All Tests Passed! ===');
process.exit(0);
```

### Adding a Performance Benchmark

1. Create `tests/performance/benchmark-your-feature.html`
2. Include performance measurement code
3. Provide visual metrics display
4. Add start/reset controls
5. Update this README

## Best Practices

✅ **Keep tests focused** - One test file per feature/optimization
✅ **Clear naming** - Use descriptive test names (test-feature-name.js)
✅ **Comprehensive output** - Show what's being tested and why
✅ **Exit codes** - Unit tests should exit 0 (pass) or 1 (fail)
✅ **Documentation** - Update this README when adding tests

## Test Coverage

Current test coverage:

| Component | Unit Tests | Performance Tests |
|-----------|------------|-------------------|
| WebGL Renderer | ✅ | ✅ |
| Attribute Caching | ✅ | ✅ |
| Sunset God Rays | ✅ | ✅ |
| Rainy Window Collision | ✅ | ✅ |
| Particle Systems | ✅ | ✅ |
| Textured Quads | ✅ | ✅ |

## CI/CD Integration

To integrate unit tests into CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Run Unit Tests
  run: |
    node tests/unit/test-optimization.js
    node tests/unit/test-god-rays.js
```

## Troubleshooting

**Problem:** Unit test can't find source files
**Solution:** Run from project root: `node tests/unit/test-name.js`

**Problem:** Performance benchmark not loading
**Solution:** Use a local web server (not `file://` protocol)

**Problem:** Performance metrics show as "N/A"
**Solution:** Some metrics require Chrome/Chromium (e.g., `performance.memory`)

## Related Documentation

- [OPTIMIZATION_REPORT.md](../OPTIMIZATION_REPORT.md) - God rays optimization details
- [PERFORMANCE_OPTIMIZATION.md](../PERFORMANCE_OPTIMIZATION.md) - General optimization docs

---

**Last Updated:** 2025-10-01
