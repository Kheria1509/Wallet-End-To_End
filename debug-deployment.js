#!/usr/bin/env node

/**
 * Debug Deployment Issues
 * This script helps debug common SPA deployment problems like MIME type errors
 */

const https = require('https');
const http = require('http');
const url = require('url');

// Configuration
const DEPLOYMENT_URL = process.argv[2] || 'https://wallet-end-to-end-frontend.onrender.com';
const EXPECTED_ASSETS = [
  '/assets/index-*.js',
  '/assets/index-*.css',
  '/vite.svg'
];

console.log('🔍 Debugging Wallet Frontend Deployment');
console.log('=' .repeat(50));
console.log(`📍 Target URL: ${DEPLOYMENT_URL}`);
console.log();

/**
 * Check if a URL returns the correct MIME type
 */
function checkUrl(testUrl, expectedContentType = null) {
  return new Promise((resolve) => {
    const parsedUrl = url.parse(testUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = client.request(testUrl, (res) => {
      const contentType = res.headers['content-type'] || 'not-set';
      const status = res.statusCode;
      
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          url: testUrl,
          status,
          contentType,
          body: body.substring(0, 200),
          headers: res.headers
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url: testUrl,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url: testUrl,
        error: 'Request timeout'
      });
    });
    
    req.end();
  });
}

/**
 * Extract asset paths from HTML
 */
function extractAssetPaths(html) {
  const assets = [];
  
  // Extract script src
  const scriptMatches = html.match(/<script[^>]+src="([^"]+)"/g);
  if (scriptMatches) {
    scriptMatches.forEach(match => {
      const src = match.match(/src="([^"]+)"/);
      if (src) assets.push(src[1]);
    });
  }
  
  // Extract link href (CSS)
  const linkMatches = html.match(/<link[^>]+href="([^"]+)"[^>]*rel="stylesheet"/g);
  if (linkMatches) {
    linkMatches.forEach(match => {
      const href = match.match(/href="([^"]+)"/);
      if (href) assets.push(href[1]);
    });
  }
  
  return assets;
}

/**
 * Main diagnostic function
 */
async function runDiagnostics() {
  try {
    console.log('🏠 Testing main page...');
    const mainPage = await checkUrl(DEPLOYMENT_URL);
    
    if (mainPage.error) {
      console.log(`❌ Failed to load main page: ${mainPage.error}`);
      return;
    }
    
    console.log(`✅ Main page status: ${mainPage.status}`);
    console.log(`📝 Content-Type: ${mainPage.contentType}`);
    console.log();
    
    // Check if main page returns HTML
    if (!mainPage.contentType.includes('text/html')) {
      console.log('⚠️  WARNING: Main page is not returning HTML!');
      console.log(`   Expected: text/html`);
      console.log(`   Got: ${mainPage.contentType}`);
      console.log();
    }
    
    // Extract asset paths from HTML
    console.log('🔍 Extracting asset paths from HTML...');
    const assets = extractAssetPaths(mainPage.body);
    console.log(`   Found ${assets.length} assets:`, assets);
    console.log();
    
    // Test each asset
    console.log('🧪 Testing asset URLs...');
    for (const asset of assets) {
      const assetUrl = asset.startsWith('http') ? asset : `${DEPLOYMENT_URL}${asset}`;
      const result = await checkUrl(assetUrl);
      
      if (result.error) {
        console.log(`❌ ${asset}: Error - ${result.error}`);
      } else {
        const isCorrectType = checkMimeType(asset, result.contentType);
        const status = isCorrectType ? '✅' : '❌';
        console.log(`${status} ${asset}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Content-Type: ${result.contentType}`);
        
        if (!isCorrectType) {
          console.log(`   ⚠️  Expected JS/CSS but got: ${result.contentType}`);
          if (result.body.includes('<!DOCTYPE html>')) {
            console.log(`   🚨 Asset is returning HTML instead of the actual file!`);
            console.log(`   📝 This indicates routing configuration problem.`);
          }
        }
        console.log();
      }
    }
    
    // Test common asset patterns
    console.log('🧪 Testing common asset patterns...');
    const testUrls = [
      '/assets/',
      '/assets/index.js',
      '/vite.svg',
      '/favicon.ico',
      '/nonexistent-asset.js'
    ];
    
    for (const testPath of testUrls) {
      const testUrl = `${DEPLOYMENT_URL}${testPath}`;
      const result = await checkUrl(testUrl);
      
      console.log(`🔗 ${testPath}: ${result.status || 'Error'} - ${result.contentType || result.error}`);
      if (result.status === 200 && result.body.includes('<!DOCTYPE html>')) {
        console.log(`   🚨 WARNING: Asset path returning HTML instead of 404!`);
      }
    }
    
    console.log();
    console.log('📋 RECOMMENDATIONS:');
    console.log('=' .repeat(30));
    
    if (assets.some(asset => {
      const url = `${DEPLOYMENT_URL}${asset}`;
      return mainPage.body.includes('<!DOCTYPE html>');
    })) {
      console.log('1. ❌ Asset routing is broken - assets are returning HTML');
      console.log('   📝 Check your deployment platform routing configuration');
      console.log('   📝 Ensure assets paths are served directly, not redirected to index.html');
      console.log();
      
      console.log('2. 🔧 For Render.com:');
      console.log('   - Update render.yaml routes section');
      console.log('   - Ensure /assets/* paths are not rewritten to index.html');
      console.log();
      
      console.log('3. 🔧 For Vercel:');
      console.log('   - Update vercel.json routes section');
      console.log('   - Assets should be served before catch-all route');
      console.log();
      
      console.log('4. 🔧 For Netlify:');
      console.log('   - Update _redirects file');
      console.log('   - Asset rules should come before /* catch-all');
    } else {
      console.log('✅ Asset routing appears to be working correctly!');
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  }
}

/**
 * Check if MIME type matches file extension
 */
function checkMimeType(path, contentType) {
  if (path.endsWith('.js')) {
    return contentType.includes('javascript') || contentType.includes('application/javascript');
  }
  if (path.endsWith('.css')) {
    return contentType.includes('text/css');
  }
  if (path.endsWith('.svg')) {
    return contentType.includes('image/svg') || contentType.includes('svg');
  }
  if (path.endsWith('.html')) {
    return contentType.includes('text/html');
  }
  return true; // Unknown type, assume OK
}

// Run diagnostics
runDiagnostics().catch(console.error);

console.log();
console.log('💡 USAGE:');
console.log('  node debug-deployment.js [URL]');
console.log('  node debug-deployment.js https://your-app.vercel.app');
console.log();
