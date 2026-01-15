import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, imageData } = await req.json();
    
    if (!description || !imageData) {
      return new Response(
        JSON.stringify({ error: 'Missing description or image data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating toy story...');

    // Generate creative toy name and story using AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
                text: `Based on this toy concept: "${description}", create a creative toy name and a short, magical story (2-3 paragraphs) about this toy's adventures. The story should be child-friendly, imaginative, and make the toy feel special and alive. Format your response as JSON with "name" and "story" fields.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_toy_story",
              description: "Generate a creative toy name and story",
              parameters: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "A creative, child-friendly name for the toy (2-4 words)"
                  },
                  story: {
                    type: "string",
                    description: "A short, magical story about the toy's adventures (2-3 paragraphs, child-friendly)"
                  }
                },
                required: ["name", "story"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_toy_story" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error('No story data in AI response');
    }

    const storyData = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        name: storyData.name,
        story: storyData.story
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-toy-story:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate story',
        name: 'Your Special Toy',
        story: 'This toy is waiting for its adventure to begin. Give it a name and story to make it truly yours!'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
