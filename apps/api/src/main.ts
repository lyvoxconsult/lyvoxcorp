import 'reflect-metadata';
import { createApp } from './create-app.js';
import { parseApiEnvironment } from './config/env.js';

async function bootstrap(): Promise<void> {
  const environment = parseApiEnvironment(process.env);
  const app = await createApp({ env: process.env });
  await app.listen(environment.PORT, environment.HOST);
  process.stdout.write(`LYVOX_DEV_READY workspace=api pid=${process.pid} mode=nest-fastify port=${environment.PORT}\n`);
}

void bootstrap();
