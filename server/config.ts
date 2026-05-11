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
      'openid api:fhir api:oemr user/Patient.rs user/AllergyIntolerance.rs user/Condition.rs user/MedicationRequest.rs user/CareTeam.rs user/Encounter.rs user/Immunization.rs user/Observation.rs user/Practitioner.rs user/Procedure.rs user/DocumentReference.rs user/Coverage.rs user/DiagnosticReport.rs user/Goal.rs user/CarePlan.rs user/Organization.rs user/PractitionerRole.rs user/Provenance.rs user/Device.rs user/ServiceRequest.rs user/RelatedPerson.rs user/MedicationDispense.rs user/QuestionnaireResponse.rs user/Location.read user/Medication.read user/Appointment.read user/Binary.read user/Person.read user/Group.read',
  };
}

export type AppConfig = ReturnType<typeof loadConfig>;
