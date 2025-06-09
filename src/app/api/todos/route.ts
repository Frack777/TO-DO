import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET /api/todos - Get all todos
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('todoapp');
    const todos = await db.collection('todos').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: Request) {
  try {
    const { title, description } = await request.json();
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('todoapp');
    
    const todo = {
      title,
      description: description || '',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('todos').insertOne(todo);
    
    return NextResponse.json({
      _id: result.insertedId,
      ...todo
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}
