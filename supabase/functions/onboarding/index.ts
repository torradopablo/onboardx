import { serve } from "npm:hono@3.12.0/mod.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";
import { v4 as uuidv4 } from "npm:uuid@9.0.0";

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

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // GET /onboarding/:token
    if (method === "GET") {
      const match = path.match(/\/onboarding\/([^/]+)$/);
      if (!match) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const token = match[1];
      const { data: project, error } = await supabase
        .from("onboarding_projects")
        .select()
        .eq("public_token", token)
        .maybeSingle();

      if (error || !project) {
        return new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: accesses } = await supabase
        .from("platform_accesses")
        .select()
        .eq("project_id", project.id);

      const { data: files } = await supabase
        .from("file_uploads")
        .select()
        .eq("project_id", project.id);

      return new Response(
        JSON.stringify({
          project,
          accesses: accesses || [],
          files: files || [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // PUT /onboarding/:token/access/:accessId
    if (method === "PUT" && path.includes("/access/")) {
      const match = path.match(/\/onboarding\/([^/]+)\/access\/([^/]+)/);
      if (!match) {
        return new Response(JSON.stringify({ error: "Invalid request" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const accessId = match[2];
      const body = await req.json();

      const { data: access, error } = await supabase
        .from("platform_accesses")
        .update({
          status: body.status,
          completed_at: body.status === "completed" ? new Date() : null,
        })
        .eq("id", accessId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(access), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /onboarding/:token/complete
    if (method === "POST" && path.includes("/complete")) {
      const match = path.match(/\/onboarding\/([^/]+)\/complete/);
      if (!match) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const token = match[1];
      const { data: project, error } = await supabase
        .from("onboarding_projects")
        .update({
          status: "completed",
          completed_at: new Date(),
        })
        .eq("public_token", token)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(project), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

export default app;