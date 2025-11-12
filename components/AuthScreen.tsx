import React, { useState } from 'react';
import { User, UserRole, UserStatus } from '../types';
import { Building, User as UserIcon, Lock, Mail, Phone, KeyRound, ArrowLeft } from 'lucide-react';
import * as db from '../db';

interface AuthScreenProps {
  onAuthSuccess: (user: User, isNew: boolean) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [view, setView] = useState<'login' | 'register' | 'forgotPassword'>('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Forgot Password state
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const switchView = (newView: 'login' | 'register' | 'forgotPassword') => {
    setError('');
    setRecoveryMessage('');
    setRecoveryEmail('');
    setView(newView);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (email && password) {
      try {
        const foundUser = await db.getUser(email);
        
        if (foundUser?.status === UserStatus.Blocked) {
          setError('Tu cuenta ha sido bloqueada. Contacta al administrador.');
          setIsLoading(false);
          return;
        }
        
        if (foundUser && foundUser.password === password) {
          const { password: _, ...userToReturn } = foundUser;
          onAuthSuccess(userToReturn, false);
        } else {
          setError('Correo electrónico o contraseña incorrectos.');
        }
      } catch (err) {
        console.error("Login error:", err);
        setError('Ocurrió un error al iniciar sesión.');
      }
    } else {
      setError('Por favor, introduce tu email y contraseña.');
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (registerPassword !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setIsLoading(false);
        return;
    }
    
    try {
        const existingUser = await db.getUser(registerEmail);
        if (existingUser) {
            setError('Este correo electrónico ya está registrado.');
            setIsLoading(false);
            return;
        }

        if (firstName && lastName && registerEmail && registerPassword) {
            const newUser = {
                firstName,
                lastName,
                email: registerEmail.toLowerCase(),
                phone,
                password: registerPassword,
                role: UserRole.User,
                status: UserStatus.Active,
                createdAt: new Date(),
            };
            await db.addUser(newUser);
            
            const { password: _, ...userToReturn } = newUser;
            onAuthSuccess(userToReturn, true);
        } else {
            setError('Por favor, completa todos los campos requeridos.');
        }
    } catch (err) {
        console.error("Registration error:", err);
        setError('Ocurrió un error durante el registro.');
    }
    setIsLoading(false);
  }
  
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryEmail) {
      setRecoveryMessage(`Si una cuenta asociada a ${recoveryEmail} existe, se ha enviado un enlace para restablecer la contraseña.`);
      setError('');
    } else {
      setError('Por favor, introduce tu correo electrónico.');
    }
  };


  const renderLogin = () => (
    <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
            <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
                <Building className="text-text-secondary" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Iniciar Sesión</h2>
            <p className="text-text-secondary mt-1">Bienvenido a tu gestor de suscripciones.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="Correo Electrónico"
                    required
                    disabled={isLoading}
                />
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="Contraseña"
                    required
                    disabled={isLoading}
                />
            </div>
            <button type="button" onClick={() => switchView('forgotPassword')} className="text-sm text-brand-green hover:underline text-right block w-full">Olvidé mi contraseña</button>
             <button
                type="submit"
                className="w-full bg-text-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-text-primary transition-all disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
        </form>
        <div className="text-center">
            <p className="text-sm text-text-secondary mb-2">¿No tienes cuenta?</p>
            <button 
                onClick={() => switchView('register')}
                className="w-full bg-brand-green text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-all"
            >
                Regístrate
            </button>
        </div>
    </div>
  );

  const renderRegister = () => (
    <div className="w-full max-w-sm p-8 space-y-4 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
            <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
                <Building className="text-text-secondary" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Crear Cuenta</h2>
            <p className="text-text-secondary mt-1">Bienvenido a tu gestor de suscripciones.</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-3">
            <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Nombre" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green" required disabled={isLoading}/>
            </div>
            <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Apellido" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green" required disabled={isLoading}/>
            </div>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="email" placeholder="Correo Electrónico" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green" required disabled={isLoading}/>
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="password" placeholder="Contraseña" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green" required disabled={isLoading}/>
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="password" placeholder="Confirmar Contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green" required disabled={isLoading}/>
            </div>
             <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="tel" placeholder="Número de Teléfono (Opcional)" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green" disabled={isLoading}/>
            </div>
             <button
                type="submit"
                className="w-full bg-text-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-text-primary transition-all mt-2 disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
        </form>
         <div className="text-center">
            <p className="text-sm text-text-secondary">¿Ya tienes cuenta? <button onClick={() => switchView('login')} className="font-semibold text-brand-green hover:underline">Iniciar Sesión</button></p>
        </div>
    </div>
  );

  const renderForgotPassword = () => (
    <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-2xl shadow-lg">
      <div className="text-center">
          <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
              <KeyRound className="text-text-secondary" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Recuperar Contraseña</h2>
      </div>

      {recoveryMessage ? (
        <div className="text-center space-y-6">
          <p className="text-text-secondary mt-1 px-4">{recoveryMessage}</p>
          <button 
                onClick={() => switchView('login')}
                className="w-full bg-text-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-text-primary transition-all"
            >
                Volver a Iniciar Sesión
          </button>
        </div>
      ) : (
        <>
          <p className="text-text-secondary text-center mt-1">Introduce tu correo para recibir instrucciones.</p>
          <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                      placeholder="Correo Electrónico"
                      required
                  />
              </div>
              <button
                  type="submit"
                  className="w-full bg-text-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-text-primary transition-all"
                >
                  Enviar Instrucciones
              </button>
          </form>
          <div className="text-center">
              <button onClick={() => switchView('login')} className="font-semibold text-brand-green hover:underline text-sm flex items-center justify-center gap-2 w-full">
                <ArrowLeft size={16} />
                Volver a Iniciar Sesión
              </button>
          </div>
        </>
      )}
    </div>
  );
  
  const renderCurrentView = () => {
    switch(view) {
        case 'login':
            return renderLogin();
        case 'register':
            return renderRegister();
        case 'forgotPassword':
            return renderForgotPassword();
        default:
            return renderLogin();
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-app-background p-4">
      {error && <div className="w-full max-w-sm bg-red-100 border border-red-400 text-brand-red px-4 py-3 rounded-lg text-center mb-4 transition-opacity duration-300">
          <p>{error}</p>
        </div>
      }
      {renderCurrentView()}
    </div>
  );
};

export default AuthScreen;