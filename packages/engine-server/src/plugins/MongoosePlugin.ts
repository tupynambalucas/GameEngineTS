import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyInstance } from 'fastify';
import mongoose, { Model } from 'mongoose';
import { IUserDocument, userSchema } from '../models/User';

// Estende a interface do Fastify para incluir as decorações que este plugin irá criar.

const MongoosePlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  try {
    server.log.info('Starting database connection...');
    
    // --- PASSO A: CONECTA AO BANCO DE DADOS ---
    mongoose.set('strictQuery', false);
    const connection = await mongoose.connect(server.config.MONGO_URI as string);
    server.log.info('Mongoose connected successfully.');
    
    // Decora com a instância do mongoose.
    server.decorate('mongoose', connection);

    // --- PASSO B: CRIA OS MODELOS (SÓ ACONTECE APÓS A CONEXÃO) ---
    const models = {
      User: connection.model<IUserDocument>('User', userSchema),
    };
    server.log.info('Mongoose models registered.');

    // Decora com os modelos.
    server.decorate('models', models);

    // --- PASSO C: EXECUTA LÓGICA DE INICIALIZAÇÃO (SÓ ACONTECE APÓS OS MODELOS ESTAREM PRONTOS) ---


    // --- PASSO D: CONFIGURA O HOOK DE ENCERRAMENTO ---
    server.addHook('onClose', async (instance) => {
      await instance.mongoose.disconnect();
      instance.log.info('Mongoose disconnected.');
    });

  } catch (err) {
    server.log.error(err, 'Database plugin initialization error');
    process.exit(1);
  }
};

export default fp(MongoosePlugin);