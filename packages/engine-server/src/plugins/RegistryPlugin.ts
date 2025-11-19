import cors from '@fastify/cors'
import envConfig from '../config/env'
import utils from '../config/utils'
import secureSession from './SessionPlugin'
import MongoosePlugin from './MongoosePlugin';
import fp from 'fastify-plugin'
import ApiPlugin from './ApiPlugin';
import AssetManagerPlugin from './AssetManagerPlugin';

import type { FastifyPluginAsync } from 'fastify'

const serverAutoRegistry: FastifyPluginAsync = async function (server) {
  await server.register(utils)
  await server.register(envConfig)
  await server.register(MongoosePlugin)
  // await server.register(AssetManagerPlugin)
  await server.register(secureSession)
  await server.register(ApiPlugin, { prefix: '/api' });

  await server.register(cors, {
    origin: "*",
    methods: ['GET', 'POST'],
    credentials: true,
  });
}

export default fp(serverAutoRegistry);