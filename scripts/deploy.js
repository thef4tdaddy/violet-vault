#!/usr/bin/env node

/**
 * VioletVault Deployment Script
 * 
 * Handles the deployment process with safety checks and validation
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');

// Configuration
const config = {
  environments: ['development', 'staging', 'production'],
  requiredFiles: ['package.json', 'vite.config.js', 'src/main.jsx'],
  buildDir: 'dist',
  backupDir: 'backups'
};

class DeploymentManager {
  constructor(environment = 'production') {
    this.environment = environment;
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.buildPath = path.join(projectRoot, config.buildDir);
  }

  async deploy() {
    console.log('🚀 VioletVault Deployment Manager');
    console.log('==================================');
    console.log(`Environment: ${this.environment}`);
    console.log(`Timestamp: ${this.timestamp}\n`);

    try {
      await this.preDeploymentChecks();
      await this.runTests();
      await this.createBuild();
      await this.validateBuild();
      await this.deployToEnvironment();
      await this.postDeploymentValidation();
      
      console.log('\n✅ Deployment completed successfully!');
    } catch (error) {
      console.error('\n❌ Deployment failed:', error.message);
      process.exit(1);
    }
  }

  async preDeploymentChecks() {
    console.log('🔍 Running pre-deployment checks...');
    
    // Check if we're on the correct branch
    const { stdout: branch } = await execAsync('git branch --show-current');
    const currentBranch = branch.trim();
    
    if (this.environment === 'production' && currentBranch !== 'main') {
      throw new Error(`Production deployments must be from 'main' branch. Currently on: ${currentBranch}`);
    }
    
    if (this.environment === 'staging' && !['develop', 'main'].includes(currentBranch)) {
      console.warn(`⚠️  Staging deployment from '${currentBranch}' branch`);
    }

    // Check for uncommitted changes
    const { stdout: status } = await execAsync('git status --porcelain');
    if (status.trim()) {
      throw new Error('Uncommitted changes detected. Please commit or stash changes before deployment.');
    }

    // Check if required files exist
    for (const file of config.requiredFiles) {
      const filePath = path.join(projectRoot, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }

    // Check environment file
    const envFile = `.env.${this.environment}`;
    const envPath = path.join(projectRoot, envFile);
    if (!fs.existsSync(envPath)) {
      console.warn(`⚠️  Environment file not found: ${envFile}`);
    }

    console.log('✅ Pre-deployment checks passed');
  }

  async runTests() {
    console.log('🧪 Running tests and quality checks...');
    
    try {
      // Run linting
      console.log('  Running ESLint...');
      await execAsync('npm run lint', { cwd: projectRoot });
      
      // Check formatting
      console.log('  Checking code formatting...');
      await execAsync('npm run format:check', { cwd: projectRoot });
      
      // TODO: Add unit tests when available
      // await execAsync('npm test', { cwd: projectRoot });
      
      console.log('✅ Quality checks passed');
    } catch (error) {
      throw new Error(`Quality checks failed: ${error.message}`);
    }
  }

  async createBuild() {
    console.log(`🔨 Creating ${this.environment} build...`);
    
    try {
      // Clean previous build
      if (fs.existsSync(this.buildPath)) {
        await execAsync(`rm -rf ${this.buildPath}`, { cwd: projectRoot });
      }

      // Create build
      const buildCommand = this.environment === 'production' 
        ? 'npm run build' 
        : `npm run build:${this.environment}`;
        
      await execAsync(buildCommand, { cwd: projectRoot });
      
      console.log('✅ Build created successfully');
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  async validateBuild() {
    console.log('🔍 Validating build...');
    
    // Check if build directory exists
    if (!fs.existsSync(this.buildPath)) {
      throw new Error('Build directory not found');
    }

    // Check for required build files
    const requiredBuildFiles = ['index.html'];
    for (const file of requiredBuildFiles) {
      const filePath = path.join(this.buildPath, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required build file missing: ${file}`);
      }
    }

    // Check build size
    const { stdout } = await execAsync(`du -sh ${this.buildPath}`);
    const buildSize = stdout.split('\t')[0];
    console.log(`  Build size: ${buildSize}`);

    // Basic HTML validation
    const indexPath = path.join(this.buildPath, 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    if (!indexContent.includes('<div id="root">')) {
      throw new Error('Build validation failed: Missing root div in index.html');
    }

    console.log('✅ Build validation passed');
  }

  async deployToEnvironment() {
    console.log(`📤 Deploying to ${this.environment}...`);
    
    // This is where you would integrate with your hosting provider
    // Examples: Netlify, Vercel, AWS S3, etc.
    
    switch (this.environment) {
      case 'production':
        await this.deployToProduction();
        break;
      case 'staging':
        await this.deployToStaging();
        break;
      case 'development':
        await this.deployToDevelopment();
        break;
      default:
        throw new Error(`Unknown environment: ${this.environment}`);
    }
  }

  async deployToProduction() {
    console.log('🏭 Production deployment...');
    
    // TODO: Integrate with your production hosting provider
    // Example for different providers:
    
    // Netlify: netlify deploy --prod --dir=dist
    // Vercel: vercel --prod
    // AWS S3: aws s3 sync dist/ s3://your-bucket --delete
    // Custom server: rsync -av dist/ user@server:/var/www/
    
    console.log('📋 MANUAL DEPLOYMENT REQUIRED:');
    console.log('1. Upload contents of dist/ directory to production server');
    console.log('2. Verify deployment at production URL');
    console.log('3. Run post-deployment checks');
    
    // Placeholder for actual deployment
    console.log('✅ Production deployment prepared');
  }

  async deployToStaging() {
    console.log('🧪 Staging deployment...');
    
    // Similar to production but to staging environment
    console.log('📋 MANUAL STAGING DEPLOYMENT:');
    console.log('1. Upload contents of dist/ directory to staging server');
    console.log('2. Verify deployment at staging URL');
    
    console.log('✅ Staging deployment prepared');
  }

  async deployToDevelopment() {
    console.log('🛠️  Development deployment...');
    
    // Could start local preview server
    console.log('💡 Starting preview server...');
    console.log('Run: npm run preview');
    
    console.log('✅ Development deployment ready');
  }

  async postDeploymentValidation() {
    console.log('🔍 Post-deployment validation...');
    
    // TODO: Add automated checks
    // - HTTP status check
    // - Basic functionality test
    // - Performance check
    
    console.log('📋 MANUAL VALIDATION CHECKLIST:');
    console.log('1. [ ] Application loads without errors');
    console.log('2. [ ] User authentication works');
    console.log('3. [ ] Core features accessible');
    console.log('4. [ ] No console errors');
    console.log('5. [ ] Data loads correctly');
    
    console.log('✅ Ready for post-deployment validation');
  }
}

// CLI Interface
const environment = process.argv[2] || 'production';

if (!config.environments.includes(environment)) {
  console.error(`❌ Invalid environment: ${environment}`);
  console.error(`Available environments: ${config.environments.join(', ')}`);
  process.exit(1);
}

const deployer = new DeploymentManager(environment);
deployer.deploy().catch(console.error);