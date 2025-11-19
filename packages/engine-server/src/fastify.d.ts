import { Model, Mongoose } from 'mongoose';
import 'fastify';
import { type IUser, userSchema } from '../models/User';

declare module 'fastify' {
    interface FastifyInstance {
        
        // ADICIONADO: 'models' irá conter todos os modelos da aplicação
        models: {
            User: Model<IUser>;
        };
        mongoose: Mongoose;
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
        genHash(password: string): Promise<string | Error>;
        compareHash(password: string, hashedPass: string): Promise<boolean | Error>;
        config: {
            SERVER_HOST: string;
            SERVER_PORT: number;
            JWT_SECRET: string;
            SESSION_SECRET: string;
            MONGO_URI: string;
            CLOUDINARY_CLOUD_NAME: string;
            CLOUDINARY_API_KEY: string;
            CLOUDINARY_API_SECRET: string;
        };
        vite: {
            ready(): Promise<void>;
        };
    }
    interface FastifyRequest {
        user: { 
            _id: string;
            username: string;
            email: string;
        }
    }
    interface Session {
        token?: string;
    }
}