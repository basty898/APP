import React, { useState, useEffect } from 'react';
import { User as UserType } from '../types';
import { User as UserIcon, Mail, Phone, LogOut, Save, Lock, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

interface ProfileScreenProps {
  user: UserType;
  onLogout: () => void;
  onUpdateUser: (user: UserType) => Promise<void>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout, onUpdateUser }) => {
  const [editableUser, setEditableUser] = useState<UserType>(user);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLogoutConfirmVisible, setIsLogoutConfirmVisible] = useState(false);
  
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setHasChanges(JSON.stringify(user) !== JSON.stringify(editableUser));
  }, [user, editableUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
        await onUpdateUser(editableUser);
        setSaveSuccess(true);
        setHasChanges(false); 
        setTimeout(() => setSaveSuccess(false), 3000);
    } catch(error) {
        setSaveError(error instanceof Error ? error.message : 'Ocurrió un error al guardar.');
    } finally {
        setIsSaving(false);
    }
  };
  
  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Las nuevas contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    // Simulation
    console.log("Changing password...");
    alert("Contraseña cambiada con éxito (simulación).");
    setShowPasswordFields(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  }

  const inputWithIconStyle = "w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green";

  return (
    <>
      <div className="p-4">
        <header className="text-center mb-8">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <UserIcon className="text-brand-green" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Mi Perfil</h1>
          <p className="text-text-secondary">Gestiona tu información personal.</p>
        </header>

        {saveError && (
            <div className="flex items-center gap-2 bg-red-100 text-brand-red p-3 rounded-lg mb-4">
                <AlertCircle size={20} />
                <span className="text-sm">{saveError}</span>
            </div>
        )}
        {saveSuccess && (
            <div className="flex items-center gap-2 bg-green-100 text-green-700 p-3 rounded-lg mb-4">
                <CheckCircle size={20} />
                <span className="text-sm">¡Perfil actualizado con éxito!</span>
            </div>
        )}
        
        <div className="space-y-4">
          <div>
              <label htmlFor="firstName" className="text-sm font-medium text-text-secondary">Nombre</label>
              <div className="relative mt-1">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input id="firstName" name="firstName" type="text" value={editableUser.firstName} onChange={handleChange} className={inputWithIconStyle} />
              </div>
          </div>
          <div>
              <label htmlFor="lastName" className="text-sm font-medium text-text-secondary">Apellido</label>
              <div className="relative mt-1">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input id="lastName" name="lastName" type="text" value={editableUser.lastName} onChange={handleChange} className={inputWithIconStyle} />
              </div>
          </div>
          <div>
              <label htmlFor="email" className="text-sm font-medium text-text-secondary">Correo Electrónico</label>
              <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input id="email" name="email" type="email" value={editableUser.email} onChange={handleChange} className={inputWithIconStyle} />
              </div>
          </div>
          <div>
              <label htmlFor="phone" className="text-sm font-medium text-text-secondary">Número de Teléfono</label>
              <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input id="phone" name="phone" type="tel" value={editableUser.phone || ''} onChange={handleChange} className={inputWithIconStyle} />
              </div>
          </div>
        </div>
        
        {showPasswordFields && (
          <form onSubmit={handlePasswordChangeSubmit} className="mt-6 p-4 border rounded-xl space-y-4 bg-gray-50">
            <h2 className="text-lg font-semibold text-text-primary text-center">Cambiar Contraseña</h2>
            {passwordError && <p className="text-sm text-brand-red text-center">{passwordError}</p>}
            <div>
              <label htmlFor="currentPassword" className="text-sm font-medium text-text-secondary">Contraseña Actual</label>
              <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input id="currentPassword" name="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputWithIconStyle} required />
              </div>
            </div>
            <div>
              <label htmlFor="newPassword" className="text-sm font-medium text-text-secondary">Nueva Contraseña</label>
              <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input id="newPassword" name="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputWithIconStyle} required />
              </div>
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="text-sm font-medium text-text-secondary">Confirmar Nueva Contraseña</label>
              <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input id="confirmNewPassword" name="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={inputWithIconStyle} required />
              </div>
            </div>
            <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-text-primary text-white font-semibold py-3 px-4 rounded-xl hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-text-primary"
              >
                Confirmar Cambio
              </button>
          </form>
        )}

        <div className="mt-8 space-y-3">
          <button 
            onClick={handleSaveChanges}
            disabled={!hasChanges || isSaving}
            className="w-full flex items-center justify-center gap-2 bg-brand-green text-white font-semibold py-3 px-4 rounded-xl hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>

          <button 
            onClick={() => { setShowPasswordFields(!showPasswordFields); setPasswordError(''); }}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-text-secondary font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <KeyRound size={20} />
            <span>{showPasswordFields ? 'Cancelar' : 'Cambiar Contraseña'}</span>
          </button>

          <button 
            onClick={() => setIsLogoutConfirmVisible(true)}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-brand-red font-semibold py-3 px-4 rounded-xl hover:bg-red-100 transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
      
      {isLogoutConfirmVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                  <h3 className="text-xl font-bold text-text-primary mb-2">Confirmar Cierre de Sesión</h3>
                  <p className="text-text-secondary mb-6">
                      ¿Estás seguro de que quieres cerrar sesión?
                  </p>
                  <div className="flex justify-center gap-4">
                      <button 
                          onClick={() => setIsLogoutConfirmVisible(false)} 
                          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
                      >
                          Cancelar
                      </button>
                      <button 
                          onClick={onLogout}
                          className="px-6 py-2 bg-brand-red text-white rounded-md hover:bg-red-600 font-semibold"
                      >
                          Confirmar
                      </button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default ProfileScreen;