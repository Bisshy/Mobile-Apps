import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

interface NotificationRequest {
  user_id: string;
  title: string;
  body: string;
}

export default {
  fetch: withSupabase(
    { auth: ["publishable", "secret"] },
    async (req, _ctx) => {
      try {
        const {
          user_id,
          title,
          body,
        }: NotificationRequest = await req.json();

        if (!user_id || !title || !body) {
          return Response.json(
            {
              error: "user_id, title and body are required.",
            },
            {
              status: 400,
            },
          );
        }

        const supabase = _ctx.supabaseAdmin;

        const {
          data: tokens,
          error: tokenError,
        } = await supabase
          .from("push_tokens")
          .select("token, platform")
          .eq("user_id", user_id);

        if (tokenError) {
          console.error(
            "Failed to retrieve push tokens:",
            tokenError,
          );

          return Response.json(
            {
              error: "Failed to retrieve push tokens.",
            },
            {
              status: 500,
            },
          );
        }

        if (!tokens || tokens.length === 0) {
          return Response.json(
            {
              error: "No push tokens found for this user.",
            },
            {
              status: 404,
            },
          );
        }

        const functionUrl = `${
          Deno.env.get("SUPABASE_URL")
        }/functions/v1/send-push-notification`;

        const serviceKey = Deno.env.get(
          "SUPABASE_SERVICE_ROLE_KEY",
        );

        if (!serviceKey) {
          return Response.json(
            {
              error: "Supabase service role key is not configured.",
            },
            {
              status: 500,
            },
          );
        }

        const results = [];

        for (const token of tokens) {
          const response = await fetch(
            functionUrl,
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json",

                "apikey": serviceKey,
              },

              body: JSON.stringify({
                token: token.token,
                title,
                body,
              }),
            },
          );

          const result = await response.json();

          results.push({
            platform: token.platform,

            success: response.ok,

            result,
          });
        }

        return Response.json({
          success: true,
          message: "Notification processing completed.",
          results,
        });
      } catch (error) {
        console.error(
          "Task notification error:",
          error,
        );

        return Response.json(
          {
            error: error instanceof Error ? error.message : "Unknown error",
          },
          {
            status: 500,
          },
        );
      }
    },
  ),
};
