import React, { useState, useEffect, useMemo } from 'react';
import * as db from '../../db';
import { SignupRecord } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { ArrowUpDown } from 'lucide-react';

const NewUserSignups: React.FC = () => {
    const [signups, setSignups] = useState<SignupRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        const fetchSignups = async () => {
            setIsLoading(true);
            const data = await db.getNewSignups();
            setSignups(data);
            setIsLoading(false);
        };
        fetchSignups();
    }, []);

    const sortedSignups = useMemo(() => {
        return [...signups].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.signup_date.getTime() - b.signup_date.getTime();
            }
            return b.signup_date.getTime() - a.signup_date.getTime();
        });
    }, [signups, sortOrder]);

    const toggleSortOrder = () => {
        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    };

    if (isLoading) return <div>Cargando nuevos registros...</div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Correo</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={toggleSortOrder}>
                                <div className="flex items-center gap-2">
                                    Fecha de Registro
                                    <ArrowUpDown size={14} />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedSignups.map((record, index) => (
                            <tr key={`${record.users.email}-${index}`} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{record.users.firstName} {record.users.lastName}</td>
                                <td className="px-6 py-4">{record.users.email}</td>
                                <td className="px-6 py-4">{format(record.signup_date, 'dd MMM yyyy, HH:mm', { locale: es })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {sortedSignups.length === 0 && <p className="text-center p-8 text-gray-500">No hay nuevos registros.</p>}
        </div>
    );
};

export default NewUserSignups;
