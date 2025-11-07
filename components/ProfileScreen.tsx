import React, { useState, useEffect } from 'react';
// Fix: Import User type from types.ts and alias it to UserType to resolve type error.
// The original code was incorrectly importing User from lucide-react (an icon component) as a type.
import { User as UserType } from '../types';
import { User as UserIcon, Mail, Phone, LogOut, Save } from 'lucide-react';

interface ProfileScreenProps {
  user: UserType;
  onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout }) => {
  const [editableUser, setEditableUser] = useState<UserType>(user);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(JSON.stringify(user) !== JSON.stringify(editableUser));
  }, [user, editableUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    // Here you would typically make an API call to save the user data.
    // For this mock, we'll just log it and maybe show an alert.
    console.log("Saving changes:", editableUser);
    alert("Cambios guardados con éxito (simulación).");
    // To see the changes reflected, the parent component would need to update the user prop.
    // For now, we'll just reset the hasChanges state.
    setHasChanges(false); 
  };

  return (
    <div className="p-4">
      <header className="text-center mb-8">
        <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
            <UserIcon className="text-brand-purple" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Mi Perfil</h1>
        <p className="text-text-secondary">Gestiona tu información personal.</p>
      </header>
      
      <div className="space-y-4">
        <div>
            <label className="text-sm font-medium text-text-secondary">Nombre</label>
            <div className="relative mt-1">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" value={editableUser.firstName} className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed" disabled />
            </div>
        </div>
        <div>
            <label className="text-sm font-medium text-text-secondary">Apellido</label>
            <div className="relative mt-1">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" value={editableUser.lastName} className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed" disabled />
            </div>
        </div>
        <div>
            <label htmlFor="email" className="text-sm font-medium text-text-secondary">Correo Electrónico</label>
            <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input id="email" name="email" type="email" value={editableUser.email} onChange={handleChange} className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple" />
            </div>
        </div>
        <div>
            <label htmlFor="phone" className="text-sm font-medium text-text-secondary">Número de Teléfono</label>
            <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input id="phone" name="phone" type="tel" value={editableUser.phone || ''} onChange={handleChange} className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple" />
            </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <button 
          onClick={handleSaveChanges}
          className="w-full flex items-center justify-center gap-2 bg-brand-green text-white font-semibold py-3 px-4 rounded-xl hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green"
        >
          <Save size={20} />
          <span>Guardar Cambios</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 text-brand-red font-semibold py-3 px-4 rounded-xl hover:bg-red-100 transition-colors"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;