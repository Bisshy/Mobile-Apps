import "@supabase/functions-js/edge-runtime.d.ts";

import { withSupabase } from "@supabase/server";

const FIREBASE_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";

interface FirebaseServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

interface PushRequest {
  token: string;
  title: string;
  body: string;
}

function base64UrlEncode(
  input: string | Uint8Array,
): string {
  let bytes: Uint8Array;

  if (typeof input === "string") {
    bytes = new TextEncoder().encode(input);
  } else {
    bytes = input;
  }

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function pemToArrayBuffer(
  pem: string,
): ArrayBuffer {
  const base64 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binary = atob(base64);

  const bytes = new Uint8Array(
    binary.length,
  );

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

async function createFirebaseAccessToken(
  serviceAccount: FirebaseServiceAccount,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = base64UrlEncode(
    JSON.stringify({
      alg: "RS256",
      typ: "JWT",
    }),
  );

  const payload = base64UrlEncode(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: FIREBASE_SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );

  const unsignedToken = `${header}.${payload}`;

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(
      serviceAccount.private_key,
    ),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(
      unsignedToken,
    ),
  );

  const jwt = `${unsignedToken}.${
    base64UrlEncode(
      new Uint8Array(signature),
    )
  }`;

  const response = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },

      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",

        assertion: jwt,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Failed to obtain Firebase access token: ${error}`,
    );
  }

  const data = await response.json();

  return data.access_token;
}

export default {
  fetch: withSupabase(
    {
      auth: [
        "publishable",
        "secret",
      ],
    },
    async (req, _ctx) => {
      try {
        const body: PushRequest = await req.json();

        if (
          !body.token ||
          !body.title ||
          !body.body
        ) {
          return Response.json(
            {
              error: "token, title and body are required.",
            },
            {
              status: 400,
            },
          );
        }

        const encodedCredentials = Deno.env.get(
          "FIREBASE_SERVICE_ACCOUNT_BASE64",
        );

        if (!encodedCredentials) {
          return Response.json(
            {
              error: "Firebase service account secret is not configured.",
            },
            {
              status: 500,
            },
          );
        }

        const serviceAccount = JSON.parse(
          new TextDecoder().decode(
            Uint8Array.from(
              atob(encodedCredentials),
              (character) => character.charCodeAt(0),
            ),
          ),
        ) as FirebaseServiceAccount;

        const accessToken = await createFirebaseAccessToken(
          serviceAccount,
        );

        const response = await fetch(
          `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
          {
            method: "POST",

            headers: {
              "Authorization": `Bearer ${accessToken}`,

              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              message: {
                token: body.token,

                notification: {
                  title: body.title,
                  body: body.body,
                },
              },
            }),
          },
        );

        const result = await response.text();

        if (!response.ok) {
          console.error(
            "FCM request failed:",
            result,
          );

          return Response.json(
            {
              error: "FCM request failed.",
              details: result,
            },
            {
              status: response.status,
            },
          );
        }

        return Response.json({
          success: true,
          message: "Push notification sent successfully.",
          fcm: JSON.parse(result),
        });
      } catch (error) {
        console.error(
          "Push notification error:",
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
