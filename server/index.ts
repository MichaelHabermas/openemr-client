import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { loadConfig } from "./config";
import { accessTokenCookieName } from "./constants";
import { createFhirService } from "./services/fhir-service";
import { createOAuthService } from "./services/oauth-service";

const config = loadConfig();
const oauth = createOAuthService(config);
const fhir = createFhirService(config);

const app = express();
app.use(
  cors({
    origin: config.appOrigin,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

function firstQueryString(value: express.Request["query"][string]): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : undefined;
  }
  return undefined;
}

app.get("/login", (_req, res) => {
  const authUrl =
    `${config.openemrUrl}/oauth2/default/authorize?` +
    `response_type=code&` +
    `client_id=${encodeURIComponent(config.oauthClientId)}&` +
    `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
    `scope=${encodeURIComponent(config.oauthScope)}&` +
    `state=abc123`;
  res.redirect(authUrl);
});

app.get("/callback", async (req, res) => {
  const code = firstQueryString(req.query.code);
  if (!code) {
    res.status(400).send("No authorization code received");
    return;
  }
  try {
    const token = await oauth.exchangeCodeForToken(code);
    res.cookie(accessTokenCookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    res.redirect(`${config.appOrigin}/patients`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("OAuth callback error:", message);
    res.redirect(`${config.appOrigin}/?error=oauth`);
  }
});

app.post("/api/logout", (_req, res) => {
  res.clearCookie(accessTokenCookieName, { path: "/" });
  res.status(204).end();
});

app.get("/api/patients", async (req, res) => {
  const token = req.cookies?.[accessTokenCookieName];
  if (!token || typeof token !== "string") {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  try {
    const bundle = await fhir.fetchPatientBundle(token);
    res.json(bundle);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("FHIR error:", message);
    res.status(500).json({ error: message });
  }
});

app.listen(config.port, () => {
  console.log(`BFF listening on http://localhost:${config.port}`);
});
