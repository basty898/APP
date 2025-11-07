import React, { useState } from 'react';
import { User } from '../types';
import { Building, User as UserIcon, Lock, Mail, Phone } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'login' | 'register'>('login');

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
  
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      const mockUser: User = {
        firstName: 'Usuario',
        lastName: 'Prueba',
        email: email,
        phone: '987654321',
      };
      onLoginSuccess(mockUser);
    } else {
      setError('Por favor, introduce tu email y contraseña.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
    }
    if (firstName && lastName && registerEmail && registerPassword) {
        const newUser: User = {
            firstName,
            lastName,
            email: registerEmail,
            phone,
        };
        onLoginSuccess(newUser);
    } else {
        setError('Por favor, completa todos los campos requeridos.');
    }
  }

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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    placeholder="Correo Electrónico"
                    required
                />
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    placeholder="Contraseña"
                    required
                />
            </div>
            <a href="#" className="text-sm text-brand-purple hover:underline text-right block">Olvidé mi contraseña</a>
             <button
                type="submit"
                className="w-full bg-text-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-text-primary transition-all"
              >
                Iniciar Sesión
            </button>
        </form>
        <div className="text-center">
            <p className="text-sm text-text-secondary mb-2">¿No tienes cuenta?</p>
            <button 
                onClick={() => setView('register')}
                className="w-full bg-brand-green text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-all transform hover:scale-105"
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
                <input type="text" placeholder="Nombre" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" required/>
            </div>
            <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Apellido" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" required/>
            </div>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="email" placeholder="Correo Electrónico" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" required/>
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="password" placeholder="Contraseña" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" required/>
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="password" placeholder="Confirmar Contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" required/>
            </div>
             <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="tel" placeholder="Número de Teléfono (Opcional)" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
            </div>
             <button
                type="submit"
                className="w-full bg-text-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-text-primary transition-all mt-2"
              >
                Crear Cuenta
            </button>
        </form>
         <div className="text-center">
            <p className="text-sm text-text-secondary">¿Ya tienes cuenta? <button onClick={() => setView('login')} className="font-semibold text-brand-purple hover:underline">Iniciar Sesión</button></p>
        </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {error && <p className="text-brand-red text-sm text-center mb-4">{error}</p>}
      {view === 'login' ? renderLogin() : renderRegister()}
    </div>
  );
};

export default AuthScreen;
