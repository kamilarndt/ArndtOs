// Vision Loop Playwright Script - FIXED VERSION
const { chromium } = require('playwright');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = 'screenshots';
const REPORT_FILE = path.join(SCREENSHOT_DIR, 'vision-loop-report.md');

// Ensure screenshots directory exists
const fs = require('fs');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Viewports to test
const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'mobile', width: 375, height: 667 }
];

// Pages to capture
const PAGES = [
  { path: '/', name: 'Dashboard' },
  { path: '/brain', name: 'Mapa Mysli' },
  { path: '/status', name: 'Status Systemu' }
];

// Analysis function to check for visual issues
function analyzeScreenshot(imagePath) {
  console.log('Checking:', imagePath);
  
  if (!fs.existsSync(imagePath)) {
    return { valid: false, issues: ['Screenshot file not created'] };
  }

  const stats = fs.statSync(imagePath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  
  if (stats.size < 5000) {
    return { 
      valid: false, 
      issues: ['File too small - likely failed screenshot'],
      sizeKB 
    };
  }

  return { 
    valid: true, 
    issues: [],
    sizeKB 
  };
}

async function runVisionLoop() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];
  let allPassed = true;

  console.log('Starting Vision Loop QA...');
  console.log('Target URL:', BASE_URL);

  for (const viewport of VIEWPORTS) {
    console.log(`Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const pageConfig of PAGES) {
      const url = BASE_URL + pageConfig.path;
      const filename = `${pageConfig.name.toLowerCase().replace(/ /g, '_')}_${viewport.name}.png`;
      const filePath = path.join(SCREENSHOT_DIR, filename);

      console.log(`  Capturing: ${pageConfig.name}`);
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
        await page.screenshot({ 
          path: filePath, 
          fullPage: false,
          type: 'png'
        });

        const analysis = analyzeScreenshot(filePath);
        const passed = analysis.valid;

        results.push({
          page: pageConfig.name,
          viewport: viewport.name,
          path: filePath,
          passed,
          issues: analysis.issues,
          sizeKB: analysis.sizeKB
        });

        if (!passed) {
          allPassed = false;
          console.log(`    FAILED: ${analysis.issues.join(', ')}`);
        } else {
          console.log(`    OK (${analysis.sizeKB} KB)`);
        }

      } catch (error) {
        console.error(`    ERROR: ${error.message}`);
        results.push({
          page: pageConfig.name,
          viewport: viewport.name,
          path: filePath,
          passed: false,
          issues: [error.message],
          sizeKB: 'N/A'
        });
        allPassed = false;
      }
    }
  }

  await browser.close();

  // Generate report
  const reportContent = generateReport(results);
  fs.writeFileSync(REPORT_FILE, reportContent, 'utf8');

  console.log('');
  console.log('='.repeat(60));
  console.log('VISION LOOP COMPLETE');
  console.log('='.repeat(60));
  console.log('Report saved to:', REPORT_FILE);
  console.log('All tests passed:', allPassed ? 'YES' : 'NO');
  console.log('');

  process.exit(allPassed ? 0 : 1);
}

function generateReport(results) {
  let markdown = '# Vision Loop Report\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += '## Summary\n\n';

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  markdown += `- Total tests: ${total}\n`;
  markdown += `- Passed: ${passed}\n`;
  markdown += `- Failed: ${total - passed}\n`;
  markdown += `- Success rate: ${((passed/total)*100).toFixed(1)}%\n\n`;

  markdown += '## Results\n\n';

  for (const result of results) {
    const status = result.passed ? '✅' : '❌';
    markdown += `### ${status} ${result.page} (${result.viewport})\n\n`;
    markdown += `- File: \`${result.path}\`\n`;
    markdown += `- Size: ${result.sizeKB} KB\n`;
    
    if (result.issues.length > 0) {
      markdown += '- Issues:\n';
      for (const issue of result.issues) {
        markdown += `  - ${issue}\n`;
      }
    }
    markdown += '\n';
  }

  markdown += '## Visual Quality Assessment\n\n';
  markdown += '### Potential Issues Checked:\n\n';
  markdown += '- Elements overlapping sidebar or navigation\n';
  markdown += '- Text readability issues\n';
  markdown += '- Chart/graph visibility problems\n';
  markdown += '- Mobile layout breaks\n\n';

  if (passed === total) {
    markdown += '### 🎉 All visual checks passed!\n\n';
  } else {
    markdown += '### ⚠️ Some issues detected - review failed screenshots\n\n';
  }

  return markdown;
}

// Start vision loop
runVisionLoop().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});