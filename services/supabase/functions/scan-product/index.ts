import { serve } from "https://deno.land"
import { GoogleGenAI, Type } from "https://esm.sh"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apiKey, content-type',
}

serve(async (req: Request) => {
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

    console.log("Function triggered! Processing image extraction...");
    const ai = new GoogleGenAI({ apiKey: Deno.env.get("GEMINI_API_KEY") })

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Analyze this Product image. Extract all visible information." },
            { inlineData: { mimeType: "image/jpeg", data: image } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            brand: { type: Type.STRING },
            description: { type: Type.STRING },
            price: { type: Type.NUMBER },
            product_category: { type: Type.STRING }
          },
          required: ["name", "brand", "description", "product_category"],
        }
      }
    })

    return new Response(
      JSON.stringify({ product: JSON.parse(response.text || "{}") }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: (error as Error).message || "An unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
