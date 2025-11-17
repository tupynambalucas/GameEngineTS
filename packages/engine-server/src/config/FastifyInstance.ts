import Fastify from 'fastify';
import type { FastifyInstance } from "fastify"
const server: FastifyInstance = Fastify({
  logger: {
    // Enable one-line-logger and pass options
    level: 'info', // Set your desired log level
    transport: {
      target: '@fastify/one-line-logger',
      options: {
        // Customize colors for specific log levels
        customColors: {
          info: 'blue',     // Info messages in blue
          warn: 'yellow',   // Warning messages in yellow
          error: 'red',     // Error messages in red
          debug: 'green',   // Debug messages in green
        },
        colorize: true, // Ensure colorization is enabled
      },
    },
  },
});

export default server