import type { World, RigidBody } from '@dimforge/rapier3d-compat';
import type { Server as SocketIOServer } from 'socket.io';
import type { GameState, PlayerInput, ServerToClientEvents, ClientToServerEvents } from './types';

const TICK_RATE = 60;
const PLAYER_MOVE_SPEED = 5.0;
const PLAYER_JUMP_FORCE = 8.0;

export class GameSimulation {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
  private RAPIER!: typeof import('@dimforge/rapier3d-compat');
  private world!: World;
  
  private players: Map<string, RigidBody> = new Map();

  constructor(io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>) {
    this.io = io;
  }

  public async init() {
    this.RAPIER = await import('@dimforge/rapier3d-compat');
    
    await this.RAPIER.init();
    
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    this.world = new this.RAPIER.World(gravity);

    const groundColliderDesc = this.RAPIER.ColliderDesc.cuboid(100.0, 0.1, 100.0);
    this.world.createCollider(groundColliderDesc);

    console.log('🌍 Mundo da física inicializado. Iniciando o game loop...');
    setInterval(() => {
      this.tick();
    }, 1000 / TICK_RATE);
  }

  public addPlayer(socketId: string) {
    const startPos = { x: Math.random() * 5, y: 5.0, z: Math.random() * 5 };

    const bodyDesc = this.RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(startPos.x, startPos.y, startPos.z)
      .lockRotations();

    const body = this.world.createRigidBody(bodyDesc);
    
    const colliderDesc = this.RAPIER.ColliderDesc.capsule(0.5, 0.5);
    this.world.createCollider(colliderDesc, body);

    this.players.set(socketId, body);
    console.log(`[+] Jogador ${socketId} adicionado ao mundo.`);
  }

  public removePlayer(socketId: string) {
    const body = this.players.get(socketId);

    if (body) {
      this.world.removeCollider(body.collider(0), false);
      this.world.removeRigidBody(body);
      this.players.delete(socketId);
      console.log(`[-] Jogador ${socketId} removido.`);
    }
  }

  public handlePlayerInput(socketId: string, input: PlayerInput) {
    const body = this.players.get(socketId);
    if (!body) return;

    const impulse = { x: 0, y: 0, z: 0 };
    
    if (input.forward) impulse.z -= PLAYER_MOVE_SPEED;
    if (input.back) impulse.z += PLAYER_MOVE_SPEED;
    if (input.left) impulse.x -= PLAYER_MOVE_SPEED;
    if (input.right) impulse.x += PLAYER_MOVE_SPEED;

    if (input.jump) {
        impulse.y += PLAYER_JUMP_FORCE;
    }
    
    body.applyImpulse({x: impulse.x / TICK_RATE, y: 0, z: impulse.z / TICK_RATE}, true);
    
    if(input.jump) {
        body.applyImpulse({x: 0, y: impulse.y, z: 0}, true);
    }
  }

  private tick() {
    this.world.step();

    const gameState: GameState = { players: {} };

    for (const [socketId, body] of this.players.entries()) {
      const pos = body.translation();
      const rot = body.rotation();

      gameState.players[socketId] = {
        id: socketId,
        position: { x: pos.x, y: pos.y, z: pos.z },
        rotation: { w: rot.w, x: rot.x, y: rot.y, z: rot.z },
      };
    }

    if (Object.keys(gameState.players).length > 0) {
      this.io.emit('gameState', gameState);
    }
  }
}