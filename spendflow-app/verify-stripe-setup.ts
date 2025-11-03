#!/usr/bin/env node

/**
 * Stripe Setup Verification Script
 * Run with: npx tsx verify-stripe-setup.ts
 */

console.log('🔍 Verifying Stripe Setup...\n');

// Check environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

console.log('📋 Environment Variables:');
requiredEnvVars.forEach(key => {
  const value = process.env[key];
  const status = value ? '✅' : '❌';
  const displayValue = value ?
    (key.includes('SECRET') ? `${value.substring(0, 10)}...` : value) :
    'NOT SET';

  console.log(`  ${status} ${key}: ${displayValue}`);
});

// Check if price IDs are updated in schema
console.log('\n📋 Price IDs Check:');
try {
  const fs = require('fs');
  const path = require('path');
  const schemaPath = path.join(__dirname, 'src/database/schema.ts');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  const proPriceIdMatch = schemaContent.match(/stripePriceId:\s*['"`]([^'"`]+)['"`]/g);
  const proPriceIds = proPriceIdMatch ? proPriceIdMatch.filter((id: string) =>
    !id.includes('price_pro_monthly') && !id.includes('price_enterprise_monthly')
  ) : [];

  if (proPriceIds.length >= 2) {
    console.log('  ✅ Price IDs appear to be updated in schema.ts');
  } else {
    console.log('  ⚠️  Price IDs may still be placeholders in schema.ts');
  }
} catch (error) {
  console.log('  ❌ Could not check schema.ts');
}

console.log('\n🚀 Next Steps:');
console.log('1. Complete all environment variables');
console.log('2. Update price IDs in schema.ts');
console.log('3. Set up webhook endpoint');
console.log('4. Run: npm run dev');
console.log('5. Visit: http://localhost:3000/setup');
console.log('6. Test subscription flow');

console.log('\n✨ Happy coding!');
