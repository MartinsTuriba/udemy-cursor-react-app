import { NextResponse } from 'next/server';

// Mock database (replace with your actual database)
let apiKeys = [];

export async function GET() {
  try {
    return NextResponse.json(apiKeys);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    const newKey = {
      id: Date.now().toString(),
      name: data.name,
      value: `key_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
    };
    
    apiKeys.push(newKey);
    return NextResponse.json(newKey);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    apiKeys = apiKeys.filter(key => key.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
} 