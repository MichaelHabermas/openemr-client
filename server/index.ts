import fs from 'node:fs';
import path from 'node:path';

import express from 'express';
import { createApp } from './app';
import { loadConfig } from './config';
import { createFhirService } from './services/fhir-service';
import { createOAuthService } from './services/oauth-service';

const config = loadConfig();
const oauth = createOAuthService(config);
const fhir = createFhirService(config);
const app = createApp({ config, services: { oauth, fhir } });

const distDir = path.join(import.meta.dir, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('/*splat', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(config.port, () => {
  console.log(`BFF listening on http://localhost:${config.port}`);
});
