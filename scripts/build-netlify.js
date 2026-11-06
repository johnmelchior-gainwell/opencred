/*!
 * Copyright 2023 - 2026 California Department of Motor Vehicles
 * Copyright 2023 - 2026 Digital Bazaar, Inc.
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */
// Assembles a static-only publish directory ("netlify-dist") from the
// bedrock-views/webpack production bundle, mirroring the URL layout that the
// bedrock Express server normally serves at runtime (index.html at "/",
// bundled assets at "/static/js/*", and project "static/" assets at "/").
//
// NOTE: this only reproduces the static frontend shell. OpenCred's backend
// (workflows, OIDC, exchanges, MongoDB) is a persistent Node server and is
// NOT included - API calls from the deployed shell will fail unless
// "app.server.baseUri" / API requests are pointed at a separately hosted
// backend.
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const rootPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const bundleOutput = path.join(
  rootPath, '.cache', 'bedrock-views', 'production', 'js');
const projectStatic = path.join(rootPath, 'static');
const outDir = path.join(rootPath, 'netlify-dist');

fs.rmSync(outDir, {recursive: true, force: true});
fs.mkdirSync(outDir, {recursive: true});

if(!fs.existsSync(bundleOutput)) {
  throw new Error(
    `Bundle output not found at ${bundleOutput}. ` +
    'Run the webpack bundle step before this script.');
}

// project-level static assets served at "/" (e.g. wallet button images)
fs.cpSync(projectStatic, outDir, {recursive: true});

// webpack/bedrock-views bundle assets served at "/static/js/*"
const staticJsDir = path.join(outDir, 'static', 'js');
fs.mkdirSync(staticJsDir, {recursive: true});
for(const entry of fs.readdirSync(bundleOutput)) {
  if(entry === 'index.html') {
    continue;
  }
  fs.cpSync(
    path.join(bundleOutput, entry), path.join(staticJsDir, entry),
    {recursive: true});
}

// main SPA shell served at "/" and as the SPA fallback
fs.cpSync(
  path.join(bundleOutput, 'index.html'), path.join(outDir, 'index.html'));

console.log(`Netlify static bundle written to ${outDir}`);
