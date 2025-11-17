import fastify from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import cors from '@fastify/cors';
import { GameSimulation } from './GameSimulation';
import type { PlayerInput, ServerToClientEvents, ClientToServerEvents } from './types';
import server from './config/FastifyInstance';
import RegistryPlugin from './plugins/RegistryPlugin';

async function startServer() {
  const app = server
  await server.register(RegistryPlugin);
  // Registra o CORS para o Fastify
  // Permite que seu app web (ex: localhost:5173) se conecte ao servidor

  // Anexa o Socket.IO ao servidor Fastify
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(app.server, {
    cors: {
      origin: '*', // Em produção, restrinja isso
    },
  });

  // ---- Inicializa a Simulação do Jogo ----
  const game = new GameSimulation(io);
  await game.init();

  // ---- Lógica de Conexão do Socket.IO ----
  io.on('connection', (socket) => {
    console.log(`[INFO] Novo cliente conectado: ${socket.id}`);

    // Adiciona o jogador à simulação
    game.addPlayer(socket.id);

    // Ouve por inputs do jogador
    socket.on('playerInput', (input: PlayerInput) => {
      game.handlePlayerInput(socket.id, input);
    });

    // Lida com a desconexão
    socket.on('disconnect', () => {
      console.log(`[INFO] Cliente desconectado: ${socket.id}`);
      game.removePlayer(socket.id);
    });
  });

  // Rota de "health check" para o Fastify
  app.get('/', async (request, reply) => {
    return { status: 'ok', players: game['players'].size }; // Mostra quantos players estão online
  });

  // Inicia o servidor
  try {
    await app.listen({ port: server.config.SERVER_PORT, host: server.config.SERVER_HOST });
    console.log(`🚀 Servidor rodando em http://${server.config.SERVER_HOST}:${server.config.SERVER_PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startServer();