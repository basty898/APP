import React, { useState, useEffect, useMemo } from 'react';
import { User, Subscription, UserStatus, UserRole } from '../../types';
import * as db from '../../db';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Search, Download, Edit, Trash2, UserX, UserCheck, X, Save } from 'lucide-react';

const UserEditModal: React.FC<{ user: User; onClose: () => void; onSave: (user: User) => void; }> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState(user);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setError('El nombre y el apellido son obligatorios.');
            return;
        }
        
        // Prevent email change to one that already exists
        if (formData.email !== user.email) {
            const existingUser = await db.getUser(formData.email);
            if(existingUser) {
                setError('El correo electrónico ya está en uso por otro usuario.');
                return;
            }
        }
        
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-text-primary">Editar Usuario</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-text-secondary"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
                        </div>
                        {error && <p className="text-sm text-brand-red">{error}</p>}
                    </div>
                    <div className="p-4 bg-gray-50 border-t rounded-b-2xl flex justify-end gap-3">
                         <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-lg hover:bg-gray-300 font-semibold">Cancelar</button>
                         <button type="submit" className="px-4 py-2 bg-brand-green text-white rounded-lg flex items-center gap-2 hover:opacity-90 font-semibold"><Save size={18}/> Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    
    const fetchAllData = async () => {
        setIsLoading(true);
        const [allUsers, allSubs] = await Promise.all([
            db.getAllUsers(),
            db.getAllSubscriptions(),
        ]);
        setUsers(allUsers.filter(u => u.role !== UserRole.Admin)); // Don't show admin
        setSubscriptions(allSubs);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => {
                const searchMatch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   user.email.toLowerCase().includes(searchTerm.toLowerCase());
                const statusMatch = statusFilter === 'all' || user.status === statusFilter;
                return searchMatch && statusMatch;
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [users, searchTerm, statusFilter]);

    const getUserSubscriptionCount = (email: string) => {
        return subscriptions.filter(sub => sub.userEmail === email).length;
    };

    const handleOpenEditModal = (user: User) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };
    
    const handleUpdateUser = async (updatedUser: User) => {
        await db.updateUser(updatedUser);
        fetchAllData(); // Refresh data
    };
    
    const handleToggleBlock = async (user: User) => {
        const updatedUser = {
            ...user,
            status: user.status === UserStatus.Active ? UserStatus.Blocked : UserStatus.Active,
        };
        await db.updateUser(updatedUser);
        fetchAllData(); // Refresh data
    };
    
    const handleDeleteUser = async (email: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario y todas sus suscripciones? Esta acción es irreversible.')) {
            await db.deleteUser(email);
            fetchAllData();
        }
    };
    
    const exportToCSV = () => {
        const headers = ['Nombre', 'Apellido', 'Email', 'Estado', 'Fecha de Registro', '# Suscripciones'];
        const rows = filteredUsers.map(user => [
            user.firstName,
            user.lastName,
            user.email,
            user.status,
            format(new Date(user.createdAt), 'dd/MM/yyyy'),
            getUserSubscriptionCount(user.email)
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "usuarios_zensub.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const TableSkeleton = () => (
        <tbody className="animate-pulse">
            {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-200 last:border-b-0">
                    <td className="p-4">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </td>
                    <td className="p-4"><div className="h-5 bg-gray-300 rounded-full w-16"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-300 rounded w-4"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-300 rounded w-24"></div></td>
                    <td className="p-4 text-right"><div className="flex justify-end gap-2"><div className="h-6 w-6 bg-gray-300 rounded"></div><div className="h-6 w-6 bg-gray-300 rounded"></div></div></td>
                </tr>
            ))}
        </tbody>
    );


    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary">Gestión de Usuarios</h1>
                <p className="text-text-secondary">Administra los usuarios de la plataforma.</p>
            </header>

            <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                     <select 
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as any)}
                        className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                    >
                        <option value="all">Todos los estados</option>
                        <option value={UserStatus.Active}>Activo</option>
                        <option value={UserStatus.Blocked}>Bloqueado</option>
                    </select>
                    <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                        <Download size={18} />
                        Exportar
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-text-secondary">Usuario</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary">Estado</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary">Suscripciones</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary">Registrado</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary text-right">Acciones</th>
                        </tr>
                    </thead>
                    {isLoading ? <TableSkeleton /> : (
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan={5} className="text-center p-8 text-text-secondary">No se encontraron usuarios.</td></tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.email} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                                        <td className="p-4">
                                            <p className="font-semibold text-text-primary">{user.firstName} {user.lastName}</p>
                                            <p className="text-sm text-text-secondary">{user.email}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === UserStatus.Active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.status === UserStatus.Active ? 'Activo' : 'Bloqueado'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-text-primary">{getUserSubscriptionCount(user.email)}</td>
                                        <td className="p-4 text-text-secondary text-sm">{format(new Date(user.createdAt), 'dd MMM, yyyy', { locale: es })}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleOpenEditModal(user)} title="Editar" className="p-2 text-text-secondary hover:text-brand-green transition-colors">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleToggleBlock(user)} title={user.status === UserStatus.Active ? 'Bloquear' : 'Desbloquear'} className="p-2 text-text-secondary hover:text-text-primary transition-colors">
                                                {user.status === UserStatus.Active ? <UserX size={18} /> : <UserCheck size={18} />}
                                            </button>
                                            <button onClick={() => handleDeleteUser(user.email)} title="Eliminar" className="p-2 text-text-secondary hover:text-brand-red transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    )}
                </table>
            </div>

            {isEditModalOpen && editingUser && (
                <UserEditModal 
                    user={editingUser}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleUpdateUser}
                />
            )}
        </div>
    );
};

export default UserManagement;