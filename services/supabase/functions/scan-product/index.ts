const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apiKey, content-type',
};

const fragranceCategories = new Set(['Perfume', 'Body Splash', 'Cologne']);
const fragranceFields = [
  'longevity',
  'sillage',
  'scent_family',
  'base_notes',
  'middle_notes',
  'top_notes',
] as const;

function normalizeCategory(value: unknown) {
  const category = typeof value === 'string' ? value.trim().toLowerCase() : '';

  if (category.includes('lip') || category.includes('gloss')) return 'Lip Gloss';
  if (category.includes('body') || category.includes('splash')) return 'Body Splash';
  if (category.includes('cologne')) return 'Cologne';
  return 'Perfume';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null) as { image?: string } | null;
    const image = body?.image;

    if (!image) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analyze this product image and return product details as JSON.
Set is_recognized to false when the image does not clearly show a recognizable product.
Set it to true only when the product can be identified with reasonable confidence.
Use exactly one product_category: Perfume, Lip Gloss, Body Splash, or Cologne.
For Perfume, Body Splash, or Cologne, also return longevity, sillage, scent_family,
base_notes, middle_notes, and top_notes. For Lip Gloss, return those six fragrance
fields as empty strings. Do not guess fragrance fields when the product is not a fragrance.`,
              },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              name: { type: 'STRING' },
              brand: { type: 'STRING' },
              description: { type: 'STRING' },
              price: { type: 'NUMBER' },
              is_recognized: { type: 'BOOLEAN' },
              product_category: {
                type: 'STRING',
                enum: ['Perfume', 'Lip Gloss', 'Body Splash', 'Cologne'],
              },
              longevity: { type: 'STRING' },
              sillage: { type: 'STRING' },
              scent_family: { type: 'STRING' },
              base_notes: { type: 'STRING' },
              middle_notes: { type: 'STRING' },
              top_notes: { type: 'STRING' },
            },
            required: ['name', 'brand', 'description', 'product_category', 'is_recognized'],
          },
        },
      }),
    });

    const resultData = await apiResponse.json();

    if (!apiResponse.ok) {
      const message = resultData?.error?.message || 'Gemini request failed';
      throw new Error(message);
    }

    const rawText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const productData = JSON.parse(rawText) as Record<string, unknown>;
    const category = normalizeCategory(productData.product_category);
    productData.product_category = category;

    if (!fragranceCategories.has(category)) {
      fragranceFields.forEach((field) => delete productData[field]);
    }

    return new Response(JSON.stringify({ product: productData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
