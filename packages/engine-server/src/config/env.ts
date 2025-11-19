import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin';
import fastifyEnv from '@fastify/env';
import type { FastifyEnvOptions } from '@fastify/env';
import { resolve } from 'node:path';

// IMPORTANT: This plugin uses a custom `getProjectRoot` method.
// You must add it to your type declaration file (e.g., fastify-vite.d.ts)
// for TypeScript to recognize it.
/*
  declare module 'fastify' {
    interface FastifyInstance {
      getProjectRoot(): Promise<string> | string;
    }
  }
*/

const envPlugin: FastifyPluginAsync = async (server) => { 

  // The JSON schema defines the required environment variables.
  // Using 'as const' provides stricter type inference.
  const schema = {
    type: 'object',
    required: [
      'SERVER_HOST',
      'SERVER_PORT',
      'JWT_SECRET',
      'SESSION_SECRET',
      'MONGO_URI',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ],
    properties: {
      SERVER_HOST: { type: 'string' },
      SERVER_PORT: { type: 'number' },
      JWT_SECRET: { type: 'string' },
      SESSION_SECRET: { type: 'string' },
      MONGO_URI: { type: 'string' },
      CLOUDINARY_CLOUD_NAME: { type: 'string' },
      CLOUDINARY_API_KEY: { type: 'string' },
      CLOUDINARY_API_SECRET: { type: 'string' }
    },
  } as const;

  // Configuration for the @fastify/env plugin.
  const envOptions: FastifyEnvOptions = {
    confKey: 'config', // Attaches config to `server.config`
    schema: schema,
    dotenv: {
      path: resolve(__dirname, '.env'), // Load .env file from the project root
    },
  };

  // Register the plugin with the defined options.
  await server.register(fastifyEnv, envOptions);
};

// Wrap with `fp` (fastify-plugin) to prevent encapsulation.
// This makes `server.config` available to all other plugins.
export default fp(envPlugin);
