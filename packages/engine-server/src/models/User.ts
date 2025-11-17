import { Schema, Document, model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser {
  _id: string;
  email: string;
  username: string;
  // O campo 'password' é omitido intencionalmente por segurança.
  // Ele nunca deve ser enviado para o cliente.
  createdAt?: string;
  updatedAt?: string;
}

// Use Omit para remover a propriedade '_id' conflitante da interface IUser
// antes de estendê-la com Document.
export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  password?: string;
}

export const userSchema = new Schema<IUserDocument>({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
}, { timestamps: true });

userSchema.pre<IUserDocument>('save', async function (next) {
  // ... (o restante do código permanece o mesmo) ...
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});