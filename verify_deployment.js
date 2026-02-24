#!/usr/bin/env node

/**
 * Production Readiness Verification Script
 * Run this before deployment: node verify_deployment.js
 */

const fs = require('fs');
const path = require('path');

const checks = [];
const ROOT = path.join(__dirname);

// Color codes for terminal
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function check(name, passed, details = '') {
    checks.push({ name, passed, details });
    const icon = passed ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
    const msg = `${icon} ${name}`;
    if (details) console.log(`  ${msg} - ${details}`);
    else console.log(`  ${msg}`);
}

console.log(`\n${YELLOW}🔍 Production Readiness Check${RESET}\n`);

// Check frontend build
console.log(`${YELLOW}Frontend:${RESET}`);
try {
    const distPath = path.join(ROOT, 'frontend', 'dist');
    const exists = fs.existsSync(distPath);
    check('Build output exists', exists, exists ? 'dist/ folder found' : 'Run: cd frontend && npm run build');
} catch (e) {
    check('Build output exists', false, e.message);
}

// Check frontend config
try {
    const configPath = path.join(ROOT, 'frontend', 'src', 'lib', 'config.js');
    const content = fs.readFileSync(configPath, 'utf8');
    const hasEnv = content.includes('VITE_API_BASE_URL');
    const hasSocket = content.includes('VITE_SOCKET_URL');
    check('Environment config set up', hasEnv && hasSocket);
} catch (e) {
    check('Environment config set up', false, e.message);
}

// Check netlify config
try {
    const netlifyPath = path.join(ROOT, 'frontend', 'netlify.toml');
    const exists = fs.existsSync(netlifyPath);
    check('Netlify config exists', exists);
} catch (e) {
    check('Netlify config exists', false, e.message);
}

// Check SPA redirects
try {
    const redirectsPath = path.join(ROOT, 'frontend', 'public', '_redirects');
    const exists = fs.existsSync(redirectsPath);
    check('SPA redirects configured', exists);
} catch (e) {
    check('SPA redirects configured', false, e.message);
}

// Check backend
console.log(`\n${YELLOW}Backend:${RESET}`);
try {
    const packagePath = path.join(ROOT, 'backend', 'package.json');
    const json = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const hasStart = json.scripts && json.scripts.start;
    check('Start script configured', hasStart);
} catch (e) {
    check('Start script configured', false, e.message);
}

// Check backend env template
try {
    const envPath = path.join(ROOT, 'backend', '.env.example');
    const exists = fs.existsSync(envPath);
    check('Environment template exists', exists);
} catch (e) {
    check('Environment template exists', false, e.message);
}

// Check dependencies
console.log(`\n${YELLOW}Dependencies:${RESET}`);
try {
    const frontendPath = path.join(ROOT, 'frontend', 'node_modules');
    const backendPath = path.join(ROOT, 'backend', 'node_modules');
    const frontendExists = fs.existsSync(frontendPath);
    const backendExists = fs.existsSync(backendPath);
    check('Frontend dependencies installed', frontendExists);
    check('Backend dependencies installed', backendExists);
} catch (e) {
    check('Dependencies installed', false, e.message);
}

// Check Git
console.log(`\n${YELLOW}Git:${RESET}`);
try {
    const gitPath = path.join(ROOT, '.git');
    const exists = fs.existsSync(gitPath);
    check('Git repository initialized', exists);
} catch (e) {
    check('Git repository initialized', false, e.message);
}

// Check .env protection
console.log(`\n${YELLOW}Security:${RESET}`);
try {
    const gitignorePath = path.join(ROOT, '.gitignore');
    const content = fs.readFileSync(gitignorePath, 'utf8');
    const protectsEnv = content.includes('.env');
    check('.env files protected in .gitignore', protectsEnv);
} catch (e) {
    check('.env files protected', false, e.message);
}

// Summary
console.log(`\n${YELLOW}Summary:${RESET}`);
const passed = checks.filter(c => c.passed).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`  ${passed}/${total} checks passed (${percentage}%)\n`);

if (percentage === 100) {
    console.log(`${GREEN}✓ Ready for deployment! Follow DEPLOY_NOW.md${RESET}\n`);
    process.exit(0);
} else {
    console.log(`${RED}✗ Please fix issues above before deploying${RESET}\n`);
    process.exit(1);
}
