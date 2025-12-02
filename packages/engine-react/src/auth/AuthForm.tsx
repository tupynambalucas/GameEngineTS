import React, { useState } from 'react';
import { useAuthStore } from './AuthStore';
import AuthFormStyles from './auth-form.module.css';

export const AuthForm: React.FC = () => {
  const { 
    login, 
    register, 
    loginLoading, 
    loginError,
    registerLoading,
    registerError,
    registerSuccess,
    clearAuthMessages
  } = useAuthStore(state => state);

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleModeSwitch = () => {
    setIsRegisterMode(!isRegisterMode);
    clearAuthMessages();
    setIdentifier('');
    setEmail('');
    setUsername('');
    setPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegisterMode) {

      register(email, username, password);
    } else {
      login(identifier, password);
    }
  };

  return (
    <div className={AuthFormStyles.authContainer}>
      <form onSubmit={handleSubmit}>
        
        <h2>{isRegisterMode ? 'Registrar' : 'Login'}</h2>

        {isRegisterMode ? (
          <>
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="username">Usuário</label>
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
          </>
        ) : (
          <div>
            <label htmlFor="identifier">Email ou Usuário</label>
            <input id="identifier" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
          </div>
        )}

        <div>
          <label htmlFor="password">Senha</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        
        {loginError && <p className={AuthFormStyles.error}>{loginError}</p>}
        {registerError && <p className={AuthFormStyles.error}>{registerError}</p>}
        {registerSuccess && !isRegisterMode && (
          <p className={AuthFormStyles.success}>
            {registerSuccess}! Por favor, faça o login.
          </p>
        )}

        <button type="submit" disabled={isRegisterMode ? registerLoading : loginLoading}>
          {isRegisterMode 
            ? (registerLoading ? 'Registrando...' : 'Registrar') 
            : (loginLoading ? 'Carregando...' : 'Entrar')}
        </button>
        <button type="button" onClick={handleModeSwitch}>
          {isRegisterMode 
            ? 'Já tem uma conta? Faça o login' 
            : 'Não tem uma conta? Registre-se'}
        </button>
      </form>
    </div>
  );
};