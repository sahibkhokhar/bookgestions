import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// POST body types
interface AddBookRequest {
  book: {
    key: string;
    title: string;
    authors: string[];
    coverUrl?: string;
  };
  read: boolean;
}

interface UpdateReadRequest {
  key: string;
  read: boolean;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const entries = await prisma.libraryEntry.findMany({
      where: { user: { email: session.user.email } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Failed to fetch library:', error);
    return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: AddBookRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { book, read } = body;
  if (!book?.key || !book.title) {
    return NextResponse.json({ error: 'Missing book data' }, { status: 400 });
  }

  try {
    // Upsert user by email
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      create: { email: session.user.email, name: session.user.name ?? undefined },
      update: {},
    });

    await prisma.libraryEntry.upsert({
      where: {
        userId_key: {
          userId: user.id,
          key: book.key,
        },
      },
      create: {
        userId: user.id,
        key: book.key,
        title: book.title,
        authors: book.authors.join(', '),
        coverUrl: book.coverUrl,
        read,
      },
      update: {
        read,
        title: book.title,
        authors: book.authors.join(', '),
        coverUrl: book.coverUrl,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to add/update book:', error);
    return NextResponse.json({ error: 'Failed to add book' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: UpdateReadRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { key, read } = body;

  try {
    await prisma.libraryEntry.updateMany({
      where: {
        key,
        user: { email: session.user.email },
      },
      data: { read },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update read status:', error);
    return NextResponse.json({ error: 'Failed to update read status' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }

  try {
    await prisma.libraryEntry.deleteMany({
      where: {
        key,
        user: { email: session.user.email },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete entry:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}