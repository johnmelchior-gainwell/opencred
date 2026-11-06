/*!
 * Copyright 2023 - 2026 California Department of Motor Vehicles
 * Copyright 2023 - 2026 Digital Bazaar, Inc.
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {config} from '@bedrock/core';
import '@bedrock/mongodb';

// mongodb config
config.mongodb.name = 'opencred_localhost';

// allow overriding the connection target (e.g. MongoDB Atlas) via env var,
// keeping the credential-bearing URL out of any committed config file
if(process.env.MONGO_URL) {
  const base = process.env.MONGO_URL.endsWith('/') ?
    process.env.MONGO_URL : `${process.env.MONGO_URL}/`;
  config.mongodb.url = `${base}${config.mongodb.name}`;
}
