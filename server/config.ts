function required(name: string): string {
  const v = process.env[name];
  if (!v?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v.trim();
}

export function loadConfig() {
  return {
    openemrUrl: required('OPENEMR_URL').replace(/\/$/, ''),
    oauthClientId: required('OAUTH_CLIENT_ID'),
    oauthClientSecret: required('OAUTH_CLIENT_SECRET'),
    redirectUri: required('REDIRECT_URI'),
    port: Number(process.env.PORT ?? '3000'),
    appOrigin: required('APP_ORIGIN').replace(/\/$/, ''),
    oauthScope:
      process.env.OAUTH_SCOPE ??
      'openid api:fhir api:oemr user/Patient.read user/AllergyIntolerance.read user/Condition.read user/MedicationRequest.read user/CareTeam.read user/Encounter.read',
  };
}

export type AppConfig = ReturnType<typeof loadConfig>;
