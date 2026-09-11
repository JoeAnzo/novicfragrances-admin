const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apiKey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image } = await req.json()
    
    if (!image) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    console.log("Function triggered! Sending request to Gemini API...");

    // Pure fetch call directly to Google's API endpoint (no bundler imports needed!)
    const apiUrl = `https://googleapis.com{apiKey}`;
    
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Analyze this Product image. Extract all visible information and return it cleanly as a JSON object containing keys for name, brand, and description." },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: image
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    const resultData = await apiResponse.json();
    const rawText = resultData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const productData = JSON.parse(rawText);

    return new Response(
      JSON.stringify({ product: productData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: (error as Error).message || "An unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
