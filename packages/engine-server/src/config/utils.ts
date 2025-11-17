import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { resolve } from 'node:path';
import { networkInterfaces } from 'node:os';

// Define the types for the new decorators.
// This uses module augmentation to add them to the FastifyInstance interface.

const utilsPlugin: FastifyPluginAsync = async (server) => {
  console.log('Registering utils plugin');
};

export default fp(utilsPlugin);