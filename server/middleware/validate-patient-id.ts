import type { RequestHandler } from 'express';
import { apiErrorCodes } from '../errors/api-errors';

const PATIENT_ID_PATTERN = /^[a-zA-Z0-9._-]{1,64}$/;

export function validatePatientId(): RequestHandler {
  return (req, res, next) => {
    const raw = req.params.patientId;
    const patientId = Array.isArray(raw) ? raw[0] : raw;
    if (patientId === undefined || PATIENT_ID_PATTERN.test(patientId)) {
      next();
      return;
    }
    res.status(400).json({ error: apiErrorCodes.badFhirRequest });
  };
}
