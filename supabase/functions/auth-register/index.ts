import { serve } from "npm:hono@3.12.0/mod.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";
import * as bcrypt from "npm:bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const app = serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing environment variables" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { email, password, full_name, company_name } = body;

    if (!email || !password || !full_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user in database
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          password_hash,
          full_name,
          company_name,
        },
      ])
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message || "User already exists" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate JWT
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(
      JSON.stringify({
        sub: data.id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
      })
    );
    const secret = Deno.env.get("JWT_SECRET") || "secret";
    const hmac = await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
      new TextEncoder().encode(`${header}.${payload}`)
    );
    const signature = btoa(String.fromCharCode(...new Uint8Array(hmac)));
    const token = `${header}.${payload}.${signature}`;

    return new Response(
      JSON.stringify({
        user: {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          company_name: data.company_name,
          subscription_status: data.subscription_status,
          subscription_tier: data.subscription_tier,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
        token,
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

export default app;