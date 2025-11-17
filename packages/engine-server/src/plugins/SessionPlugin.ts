import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import fastifyCookie from '@fastify/cookie'
import fastifySession from '@fastify/session'
import fastifyJwt from '@fastify/jwt'
import bcrypt from 'bcrypt';

const SessionPlugin: FastifyPluginAsync = async (server) => {

  server.decorate('genHash', async (password: string) => {
    try {
      return await bcrypt.hash(password, 10);
    } catch (error) {
      server.log.error(error, 'Bcrypt hash generation failed');
      return error as Error;
    }
  });

  server.decorate('compareHash', async (password: string, hashedPass: string) => {
    try {
      return await bcrypt.compare(password, hashedPass);
    } catch (error) {
      server.log.error(error, 'Bcrypt hash comparison failed');
      return error as Error;
    }
  });

  await server.register(fastifyCookie);
  await server.register(fastifySession, {
    secret: server.config.SESSION_SECRET as string,
    cookie: { 
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10
    },
    saveUninitialized: false,
  });

  await server.register(fastifyJwt, {
    secret: server.config.JWT_SECRET as string,
  });

  server.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
};

export default fp(SessionPlugin);