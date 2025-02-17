import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { 
      description, 
      propertyType, 
      location, 
      features, 
      title, 
      status, 
      price, 
      bedrooms, 
      bathrooms, 
      area 
    } = await request.json();

    // Validate required fields
    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_API_URL,
        'X-Title': 'Real Estate Platform'
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-distill-llama-70b:free",
        messages: [
          {
            role: 'system',
            content: 'You are a professional real estate copywriter. Your task is to refine and enhance property descriptions while keeping them in the same language as the original content. Use clean HTML formatting, including only `<p>`, `<ul>`, `<ol>`, and `<li>` elements. Include relevant emojis and hashtags naturally within the description. Return **only the improved description** without additional metadata, headings, titles, or extra sections.'
          },
          {
            role: 'user',
            content: `Refine the following real estate property description into a clean HTML format using only '<p>', '<ul>', '<ol>', and '<li>' elements. Retain the original language, include relevant emojis and hashtags naturally, and ensure the content remains engaging and informative."



Property Details:
- Title: ${title || ''}
- Type: ${propertyType || ''}
- Status: ${status || ''}
- Price: ${price || ''}
- Location: ${location || ''}
- Bedrooms: ${bedrooms || ''}
- Bathrooms: ${bathrooms || ''}
- Area: ${area || ''}
- Features: ${features ? features.join(', ') : ''}


Property Description:: ${description}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to refactor description');
    }

    const data = await response.json();
    if (data.choices && data.choices[0]?.message?.content) {
      const cleanContent = data.choices[0].message.content.replace(/```html\n?|\n?```/g, '');
      return NextResponse.json({ description: cleanContent });
    } else {
      throw new Error('Invalid response format from AI service');
    }
  } catch (error) {
    console.error('Error in refactor-description:', error);
    return NextResponse.json(
      { error: 'Failed to refactor description' },
      { status: 500 }
    );
  }
} 