import type { FastifyPluginAsync, FastifyInstance, FastifyPluginOptions } from 'fastify';
import auth from '../api/auth';

const ApiPlugin: FastifyPluginAsync = async function (server: FastifyInstance, opts: FastifyPluginOptions) {
  // This part is correct, it passes the options down
  await server.register(auth, {prefix: 'auth'});
}

// CORRECTED: Export the plugin directly.
export default ApiPlugin;