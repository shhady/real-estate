import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { content, title, category, tags } = await request.json();

    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
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
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          {
            role: 'system',
            content: ' based on the text provided You are a professional real estate blog writer and content enhancer. Your task is to refine and enhance blog content while keeping them in the same language as the original content (Hebrew). Use clean HTML formatting, including only `<p>`, `<ul>`, `<ol>`, and `<li>` elements. Include relevant emojis and hashtags naturally within the content. Return **only the improved content** in the html format without additional metadata, headings, titles, or extra sections. no need for Key improvements and explanations and no need for the css !  , only use <h1/2/3/4> <p> <span> <strong> <ul> <ol><li> <section>'
          },
          {
            role: 'user',
            content: `Enhance the following blog content. Keep the language in Hebrew, add structure with HTML, include relevant emojis at the start of paragraphs, and integrate hashtags naturally:

Title: ${title || ''}
Category: ${category || ''}
Tags: ${tags || ''}

Content:
${content}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to enhance content');
    }

    const data = await response.json();
    if (data.choices && data.choices[0]?.message?.content) {
      const enhancedContent = data.choices[0].message.content.replace(/```html\n?|\n?```/g, '');
      return NextResponse.json({ content: enhancedContent });
    } else {
      throw new Error('Invalid response format from AI service');
    }
  } catch (error) {
    console.error('Error in refactor-blog:', error);
    return NextResponse.json(
      { error: 'Failed to enhance content' },
      { status: 500 }
    );
  }
} 