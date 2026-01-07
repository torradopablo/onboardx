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

    // Get JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabase.auth.getUser(token);
    const userId = data.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // GET /projects or /projects/:id
    if (method === "GET") {
      const match = path.match(/\/projects\/([^/]+)/);
      if (match) {
        const projectId = match[1];
        const { data: project, error } = await supabase
          .from("onboarding_projects")
          .select()
          .eq("id", projectId)
          .eq("user_id", userId)
          .maybeSingle();

        if (error || !project) {
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(project), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        const { data: projects, error } = await supabase
          .from("onboarding_projects")
          .select()
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify(projects), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // POST /projects
    if (method === "POST") {
      const body = await req.json();
      const { client_name, client_email, platforms, notes } = body;

      const { data: project, error } = await supabase
        .from("onboarding_projects")
        .insert([
          {
            id: uuidv4(),
            user_id: userId,
            client_name,
            client_email,
            public_token: uuidv4().toString(),
            platforms,
            notes,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Create platform accesses
      for (const platform of platforms) {
        await supabase.from("platform_accesses").insert([
          {
            id: uuidv4(),
            project_id: project.id,
            platform,
            status: "pending",
          },
        ]);
      }

      return new Response(JSON.stringify(project), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT /projects/:id
    if (method === "PUT") {
      const match = path.match(/\/projects\/([^/]+)/);
      if (!match) {
        return new Response(JSON.stringify({ error: "Invalid request" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const projectId = match[1];
      const body = await req.json();

      const { data: project, error } = await supabase
        .from("onboarding_projects")
        .update(body)
        .eq("id", projectId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(project), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE /projects/:id
    if (method === "DELETE") {
      const match = path.match(/\/projects\/([^/]+)/);
      if (!match) {
        return new Response(JSON.stringify({ error: "Invalid request" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const projectId = match[1];
      const { error } = await supabase
        .from("onboarding_projects")
        .delete()
        .eq("id", projectId)
        .eq("user_id", userId);

      if (error) throw error;

      return new Response(null, {
        status: 204,
        headers: corsHeaders,
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