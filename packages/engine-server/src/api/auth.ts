import type { FastifyPluginAsync, FastifyInstance, FastifyPluginOptions } from 'fastify';

const AuthRoute: FastifyPluginAsync = async (server: FastifyInstance, opts: FastifyPluginOptions) => {
   const { User } = server.models;
  
  server.post('/register', async (request, reply) => {
    const { email, username, password } = request.body as any;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      const message = existingUser.email === email 
        ? 'User with this email already exists' 
        : 'User with this username already exists';
      return reply.status(409).send({ message });
    }
    const newUser = new User({ email, username, password});
    await newUser.save();
    reply.status(201).send({ message: 'User created successfully' });
  });

  server.post('/login', async (request, reply) => {
    const { identifier, password } = request.body as any;
    
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { username: identifier }] 
    }).select('+password');

    if (!user || !(await server.compareHash(password, user.password!))) {
      return reply.status(401).send({ authenticated: false, message: 'Invalid credentials' });
    }

    const token = server.jwt.sign({ _id: user.id, email: user.email, username: user.username });
    request.session.token = token;
    
    reply.send({ 
      authenticated: true, 
      token,
      user: {
        email: user.email,
        username: user.username
      },
    });
    
  });

  server.post('/logout', async (request, reply) => {
    if (request.session) {
      await request.session.destroy();
    }
    reply.send({ message: 'Logged out' });
  });

  server.get('/verify', async (request, reply) => {
    if (!request.session.token) {
      return reply.status(401).send({ message: "No session token found." });
    }

    try {
      const payload = server.jwt.verify(request.session.token) as { _id: string, email: string };
      
      const user = await User.findById(payload._id);
      
      if (!user) {
        return reply.status(404).send({ message: "User not found." });
      }
      
      reply.send({ 
        authenticated: true, 
        token: request.session.token,
        user: {
          email: user.email,
          username: user.username
        },
      });

    } catch (err) {
      return reply.status(401).send({ message: "Invalid or expired token." });
    }
  });
};

export default AuthRoute;