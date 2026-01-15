import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting - 5 requests per hour per IP for public endpoint
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 'unknown';
    
    if (!checkRateLimit(clientIP, 5, 3600000)) {  // 5 per hour
      console.log('Rate limit exceeded for IP:', clientIP);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { imageData } = await req.json();
    
    // Input validation
    if (!imageData || typeof imageData !== 'string') {
      throw new Error('Invalid image data');
    }

    if (imageData.length > 10 * 1024 * 1024) {  // 10MB limit
      throw new Error('Image too large. Maximum size is 10MB.');
    }

    if (!imageData.startsWith('data:image/')) {
      throw new Error('Invalid image format. Please upload a valid image.');
    }

    // Log request for monitoring
    console.log('Image analysis request:', {
      ip: clientIP,
      timestamp: new Date().toISOString(),
      imageSize: imageData.length
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Step 1: Generate interpretation text
    console.log('Step 1: Generating interpretation...');
    const interpretationResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Describe this drawing in detail as if it were a 3D printed toy concept. Focus on colors, shapes, character features, and personality. Keep it under 100 words.'
              },
              {
                type: 'image_url',
                image_url: { url: imageData }
              }
            ]
          }
        ]
      })
    });

    if (!interpretationResponse.ok) {
      throw new Error(`Failed to generate interpretation: ${interpretationResponse.status}`);
    }

    const interpretationData = await interpretationResponse.json();
    const interpretation = interpretationData.choices?.[0]?.message?.content || "A creative toy design";
    console.log('Generated interpretation:', interpretation);

    // Step 2: Generate toy concept image
    console.log('Step 2: Generating 3D toy concept...');
    const conceptPrompt = `Create a photorealistic 3D render of a 3D printed toy based on this description: ${interpretation}. The toy should have smooth plastic surfaces with visible layer lines characteristic of 3D printing. Show it on a clean white background with professional studio lighting. The toy should look durable and professionally 3D printed with vibrant colors.`;
    
    const conceptResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: conceptPrompt
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!conceptResponse.ok) {
      throw new Error(`Failed to generate concept image: ${conceptResponse.status}`);
    }

    const conceptData = await conceptResponse.json();
    const generatedImageUrl = conceptData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      throw new Error('No image generated from AI model');
    }

    console.log('Successfully generated concept image');

    return new Response(
      JSON.stringify({
        interpretation,
        imageData: generatedImageUrl
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error details:', {
      requestId: crypto.randomUUID(),
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error instanceof Error ? error.toString() : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({
        error: 'An error occurred. Please try again or contact support.',
        requestId: crypto.randomUUID()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
