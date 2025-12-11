#!/usr/bin/env node

/**
 * Simple test script to validate the application structure
 * This runs without requiring MongoDB or external APIs
 */

const path = require('path');

console.log('🧪 Testing Endelave Forecast Agent Structure...\n');

// Test 1: Check if all required files exist
console.log('✓ Test 1: Checking project files...');
const requiredFiles = [
  'src/index.js',
  'src/models/GuestForecastInput.js',
  'src/models/GuestForecastResult.js',
  'src/models/ActualGuestLog.js',
  'src/services/weatherService.js',
  'src/services/calendarService.js',
  'src/services/ferryService.js',
  'src/services/aiService.js',
  'src/services/emailService.js',
  'src/services/forecastService.js',
  'src/controllers/forecastController.js',
  'src/routes/forecastRoutes.js',
  'src/config/database.js',
  'src/utils/dateHelpers.js',
  'src/utils/logger.js',
  'src/scheduler.js',
  'package.json',
  '.env.example',
  'README.md'
];

const fs = require('fs');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.error(`  ✗ Missing: ${file}`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log(`  ✓ All ${requiredFiles.length} required files exist\n`);
} else {
  console.error('  ✗ Some files are missing\n');
  process.exit(1);
}

// Test 2: Check if modules can be required
console.log('✓ Test 2: Testing module imports...');
try {
  const dateHelpers = require('../src/utils/dateHelpers');
  const Logger = require('../src/utils/logger');
  
  // Test date helpers
  const testDate = new Date('2024-06-15');
  const weekday = dateHelpers.getDanishWeekday(testDate);
  const formatted = dateHelpers.formatDate(testDate);
  const isHoliday = dateHelpers.isDanishHoliday(testDate);
  
  console.log(`  ✓ Date helpers work: ${weekday}, ${formatted}, holiday: ${isHoliday}`);
  
  // Test logger
  Logger.info('Logger test successful');
  console.log('  ✓ Logger works\n');
} catch (error) {
  console.error('  ✗ Module import failed:', error.message);
  process.exit(1);
}

// Test 3: Validate package.json
console.log('✓ Test 3: Validating package.json...');
try {
  const packageJson = require('../package.json');
  const requiredDeps = [
    'express',
    'mongoose',
    'dotenv',
    'node-cron',
    'axios',
    'nodemailer',
    'openai',
    'googleapis'
  ];
  
  let allDepsPresent = true;
  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies[dep]) {
      console.error(`  ✗ Missing dependency: ${dep}`);
      allDepsPresent = false;
    }
  });
  
  if (allDepsPresent) {
    console.log(`  ✓ All ${requiredDeps.length} required dependencies present\n`);
  } else {
    console.error('  ✗ Some dependencies are missing\n');
    process.exit(1);
  }
} catch (error) {
  console.error('  ✗ Package.json validation failed:', error.message);
  process.exit(1);
}

// Test 4: Check environment example
console.log('✓ Test 4: Validating .env.example...');
try {
  const envExample = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  const requiredEnvVars = [
    'MONGODB_URI',
    'OPENAI_API_KEY',
    'OPENWEATHER_API_KEY',
    'EMAIL_HOST',
    'CRON_SCHEDULE'
  ];
  
  let allEnvVarsPresent = true;
  requiredEnvVars.forEach(envVar => {
    if (!envExample.includes(envVar)) {
      console.error(`  ✗ Missing env var: ${envVar}`);
      allEnvVarsPresent = false;
    }
  });
  
  if (allEnvVarsPresent) {
    console.log(`  ✓ All ${requiredEnvVars.length} required environment variables documented\n`);
  } else {
    console.error('  ✗ Some environment variables are missing\n');
    process.exit(1);
  }
} catch (error) {
  console.error('  ✗ .env.example validation failed:', error.message);
  process.exit(1);
}

// Test 5: Validate model schemas
console.log('✓ Test 5: Testing model schemas...');
try {
  // These will fail to initialize without MongoDB, but we can check if they load
  const GuestForecastInput = require('../src/models/GuestForecastInput');
  const GuestForecastResult = require('../src/models/GuestForecastResult');
  const ActualGuestLog = require('../src/models/ActualGuestLog');
  
  console.log('  ✓ All models load successfully\n');
} catch (error) {
  console.error('  ✗ Model loading failed:', error.message);
  process.exit(1);
}

// Test 6: Test service initialization (without API calls)
console.log('✓ Test 6: Testing service modules...');
try {
  // Set mock environment variables
  process.env.OPENAI_API_KEY = 'test_key';
  process.env.OPENWEATHER_API_KEY = 'test_key';
  process.env.FERRY_DEFAULT_CAPACITY = '100';
  
  const aiService = require('../src/services/aiService');
  const weatherService = require('../src/services/weatherService');
  const ferryService = require('../src/services/ferryService');
  
  // Test ferry estimation
  const ferryData = ferryService.estimateFerryData(new Date('2024-07-15'));
  console.log(`  ✓ Ferry service: ${ferryData.ferry_expected_passengers} passengers`);
  
  // Test AI fallback
  const mockInput = {
    weekday: 'Lørdag',
    is_holiday: true,
    temperature: 25,
    precipitation: 0,
    ferry_expected_passengers: 80,
    ferry_capacity: 100
  };
  const prediction = aiService.getFallbackPrediction(mockInput);
  console.log(`  ✓ AI fallback: ${prediction.predicted_guests} guests predicted\n`);
} catch (error) {
  console.error('  ✗ Service test failed:', error.message);
  process.exit(1);
}

// All tests passed
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ All tests passed!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📝 Next steps:');
console.log('1. Install MongoDB or use MongoDB Atlas (cloud)');
console.log('2. Copy .env.example to .env and add your API keys');
console.log('3. Run: npm start');
console.log('4. Test endpoints with curl or Postman\n');

console.log('💡 Example API calls:');
console.log('  curl http://localhost:3000/');
console.log('  curl -X POST http://localhost:3000/forecast/run');
console.log('  curl http://localhost:3000/forecast/today\n');
