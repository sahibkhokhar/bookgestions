import { NextResponse } from 'next/server';
import { AIRecommendation } from '@/types';
import OpenAI from 'openai';

interface BookInput {
  title: string;
  authors: string[];
  publishYear?: number;
}

interface RequestBody {
  books: BookInput[];
}

// Initialize OpenAI client once per runtime
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();

    if (!body.books || !Array.isArray(body.books) || body.books.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing books array' },
        { status: 400 }
      );
    }

    // Create a detailed prompt for the AI
    const bookDescriptions = body.books.map((book, index) =>
      `${index + 1}. "${book.title}" by ${book.authors.join(', ')}${book.publishYear ? ` (${book.publishYear})` : ''}`
    ).join('\n');

    const prompt = `You are an expert book recommendation engine with access to current web information about books, literary trends, and reader preferences.

Based on the following books that a user has selected as their preferences:

${bookDescriptions}

Please analyze these books and recommend 5 similar books that this reader would likely enjoy. Consider:
- Similar genres, themes, and writing styles
- Books frequently recommended together with these titles
- Current popular books in related categories
- Literary quality and reader satisfaction

IMPORTANT: You must respond with ONLY a valid JSON array containing exactly 5 objects, each with "title", "author", and "reason" fields (reason should be 1 short sentence). Do not include any other text, explanations, or formatting.

Example format:
[
  {"title": "Book Title", "author": "Author Name", "reason": "Because ..."},
  {"title": "Another Book", "author": "Another Author", "reason": "Because ..."}
]`;

    // Call OpenAI Chat Completions API
    let recommendations: AIRecommendation[] = [];

    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY is not set. Falling back to mock data.');
    }

    try {
      if (process.env.OPENAI_API_KEY) {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are a book recommendation expert with web search capabilities.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 400,
        });

        const content = completion.choices[0].message?.content ?? '[]';
        recommendations = JSON.parse(content);
      }
    } catch (err) {
      console.error('OpenAI request failed, using fallback:', err);
    }

    if (!recommendations || recommendations.length === 0) {
      console.error('OpenAI returned no recommendations');
      return NextResponse.json(
        { error: 'Failed to generate recommendations from AI' },
        { status: 502 }
      );
    }

    return NextResponse.json({ recommendations });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}