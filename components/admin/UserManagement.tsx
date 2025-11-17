import React, { useState, useEffect, useMemo } from 'react';
import * as db from '../../db';
import { User, UserStatus, UserRole, Subscription } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Search, Lock, Unlock, Trash2, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        const [allUsers, allSubs] = await Promise.all([
            db.getAllUsers(),
            db.getAllSubscriptions()
        ]);
        setUsers(allUsers.filter(u => u.role !== UserRole.Admin));
        setSubscriptions(allSubs);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => {
                const searchMatch =
                    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase());
                const statusMatch = statusFilter === 'all' || user.status === statusFilter;
                return searchMatch && statusMatch;
            })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [users, searchTerm, statusFilter]);
    
    const handleToggleStatus = async (user: User) => {
        const newStatus = user.status === UserStatus.Active ? UserStatus.Blocked : UserStatus.Active;
        const updatedUser = { ...user, status: newStatus };
        await db.updateUser(updatedUser, user.email);
        setUsers(prev => prev.map(u => u.email === user.email ? updatedUser : u));
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        await db.deleteUser(userToDelete.email);
        setUserToDelete(null);
        fetchData();
    };

    const exportUsersToPDF = () => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        const margin = 14;
        let y = 20;

        doc.setFontSize(18);
        doc.text("Reporte de Usuarios y Suscripciones", margin, y);
        y += 15;

        filteredUsers.forEach(user => {
            if (y > pageHeight - 30) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${user.firstName} ${user.lastName} (${user.email})`, margin, y);
            y += 6;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Estado: ${user.status === UserStatus.Active ? 'Activo' : 'Bloqueado'}`, margin, y);
            y += 6;

            const userSubscriptions = subscriptions.filter(sub => sub.userEmail === user.email);

            if (userSubscriptions.length > 0) {
                doc.setFont('helvetica', 'bold');
                doc.text("Suscripciones:", margin, y);
                y += 5;

                doc.setFont('helvetica', 'normal');
                userSubscriptions.forEach(sub => {
                    if (y > pageHeight - 10) {
                        doc.addPage();
                        y = 20;
                    }
                    const subText = `- ${sub.platform}: ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: sub.currency, maximumFractionDigits: 0 }).format(sub.amount)}/${sub.period} - Renueva: ${format(sub.renewalDate, 'dd/MM/yyyy', { locale: es })}`;
                    doc.text(subText, margin + 5, y);
                    y += 5;
                });
            } else {
                doc.setFont('helvetica', 'italic');
                doc.text("Sin suscripciones registradas.", margin + 5, y);
                y += 5;
            }
            
            y += 8; // Space between users
        });

        doc.save("reporte_usuarios_suscripciones.pdf");
    };

    if (isLoading) return <div>Cargando usuarios...</div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <div className="relative flex-grow sm:flex-grow-0 sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <select 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value as any)}
                        className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green"
                    >
                        <option value="all">Todos los estados</option>
                        <option value={UserStatus.Active}>Activo</option>
                        <option value={UserStatus.Blocked}>Bloqueado</option>
                    </select>
                    <button onClick={exportUsersToPDF} className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">
                        <FileText size={16}/> Exportar PDF
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Correo</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            <th scope="col" className="px-6 py-3">Último Inicio Sesión</th>
                            <th scope="col" className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.email} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{user.firstName} {user.lastName}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        user.status === UserStatus.Active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {user.status === UserStatus.Active ? 'Activo' : 'Bloqueado'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{user.lastLoginAt ? format(user.lastLoginAt, 'dd MMM yyyy, HH:mm', { locale: es }) : 'Nunca'}</td>
                                <td className="px-6 py-4 flex items-center gap-2">
                                    <button onClick={() => handleToggleStatus(user)} title={user.status === UserStatus.Active ? 'Bloquear' : 'Desbloquear'} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full">
                                        {user.status === UserStatus.Active ? <Lock size={16} /> : <Unlock size={16} />}
                                    </button>
                                     <button onClick={() => setUserToDelete(user)} title="Eliminar" className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {userToDelete && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <h3 className="text-xl font-bold text-text-primary mb-2">Confirmar Eliminación</h3>
                        <p className="text-text-secondary mb-6">
                            ¿Estás seguro de que quieres eliminar al usuario <span className="font-bold">{userToDelete.email}</span>? Esta acción es irreversible.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => setUserToDelete(null)} 
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleDeleteUser}
                                className="px-6 py-2 bg-brand-red text-white rounded-md hover:bg-red-600 font-semibold"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;