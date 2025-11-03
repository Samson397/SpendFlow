/**
 * API Route: Seed Database
 *
 * POST /api/admin/seed-database
 *
 * Seeds the database with default subscription plans.
 * Admin only endpoint for setting up the subscription system.
 */

import { NextResponse } from 'next/server';
import { seedDatabase } from '@/database/seed';

export async function POST() {
  try {
    console.log('🌱 Starting database seeding via API...');

    await seedDatabase();

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
    });

  } catch (error: unknown) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to seed database' 
      },
      { status: 500 }
    );
  }
}
