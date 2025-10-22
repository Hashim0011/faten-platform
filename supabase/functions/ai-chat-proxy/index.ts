import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const N8N_WEBHOOK_URL = "https://your-n8n-instance.app.n8n.cloud/webhook/REDACTED";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();

    console.log("Forwarding to n8n:", body);

    // Forward the request to n8n webhook
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseText = await n8nResponse.text();
    console.log("N8N raw response:", responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { text: responseText };
    }

    console.log("Parsed response:", responseData);

    return new Response(
      JSON.stringify(responseData),
      {
        status: n8nResponse.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error proxying to n8n:", error);

    return new Response(
      JSON.stringify({
        error: "فشل في الاتصال بالخادم",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});