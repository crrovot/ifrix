// Componente de gestión de técnicos

import React, { useState } from 'react';
import { UsersIcon, PlusIcon, TrashIcon } from 'lucide-react';

export const TechnicianManager = ({ 
    technicians, 
    onAddTechnician, 
    onDeleteTechnician 
}) => {
    const [techName, setTechName] = useState('');
    const [techRate, setTechRate] = useState(10);

    const activeTechnicians = technicians.filter(t => t.active !== false);

    const handleAdd = () => {
        const success = onAddTechnician(techName, techRate);
        if (success) {
            setTechName('');
        }
    };

    return (
        <div className="space-y-3 xs:space-y-4">
            <h2 className="text-xs xs:text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-1.5 xs:gap-2">
                <UsersIcon className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-cyan-600 flex-shrink-0" />
                <span>Gestión de Técnicos</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 xs:gap-3 sm:gap-4">
                {/* Formulario */}
                <div className="p-2 xs:p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-xs xs:text-sm font-medium text-slate-700 mb-2 xs:mb-3">
                        Nuevo Técnico
                    </h3>
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Nombre del técnico"
                            value={techName}
                            onChange={(e) => setTechName(e.target.value)}
                            className="w-full p-2 xs:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 min-h-[44px]"
                        />
                        <div className="flex gap-2">
                            <div className="flex flex-1">
                                <input
                                    type="number"
                                    placeholder="10"
                                    value={techRate}
                                    onChange={(e) => setTechRate(e.target.value)}
                                    min="0"
                                    max="100"
                                    className="w-full p-2 xs:p-2.5 text-sm border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-cyan-400 min-h-[44px]"
                                />
                                <span className="px-2 xs:px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg text-xs font-bold text-gray-600 flex items-center">
                                    %
                                </span>
                            </div>
                            <button
                                onClick={handleAdd}
                                className="bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white font-medium py-2 px-3 xs:px-4 rounded-lg text-sm transition-all flex items-center min-h-[44px] min-w-[44px] justify-center active:scale-95"
                                disabled={!techName.trim()}
                            >
                                <PlusIcon className="w-4 h-4 xs:w-5 xs:h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lista de Técnicos */}
                <TechnicianList 
                    technicians={activeTechnicians} 
                    onDelete={onDeleteTechnician} 
                />
            </div>
        </div>
    );
};

// Lista de técnicos responsive
const TechnicianList = ({ technicians, onDelete }) => (
    <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Vista Móvil XS */}
        <div className="xs:hidden divide-y divide-gray-100 max-h-64 overflow-auto">
            {technicians.map((tech) => (
                <TechnicianCardXS key={tech.id} tech={tech} onDelete={onDelete} />
            ))}
            {technicians.length === 0 && (
                <p className="p-4 text-center text-gray-400 text-xs">Sin técnicos activos</p>
            )}
        </div>

        {/* Vista Móvil SM */}
        <div className="hidden xs:block sm:hidden divide-y divide-gray-100 max-h-72 overflow-auto">
            {technicians.map((tech) => (
                <TechnicianCardSM key={tech.id} tech={tech} onDelete={onDelete} />
            ))}
            {technicians.length === 0 && (
                <p className="p-4 text-center text-gray-400 text-sm">Sin técnicos activos</p>
            )}
        </div>

        {/* Vista Desktop - Tabla */}
        <div className="hidden sm:block">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Nombre</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Comisión</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {technicians.map((tech) => (
                        <tr key={tech.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5 font-medium text-gray-800">{tech.name}</td>
                            <td className="px-4 py-2.5 font-semibold text-cyan-600">
                                {(tech.defaultCommissionRate * 100).toFixed(0)}%
                            </td>
                            <td className="px-4 py-2.5 text-right">
                                <button
                                    onClick={() => onDelete(tech.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                    title="Desactivar"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {technicians.length === 0 && (
                <p className="p-4 text-center text-gray-400 text-sm">Sin técnicos activos</p>
            )}
        </div>
    </div>
);

// Card para pantallas XS
const TechnicianCardXS = ({ tech, onDelete }) => (
    <div className="p-2 flex justify-between items-center hover:bg-gray-50 active:bg-gray-100">
        <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-800 text-[11px] truncate">{tech.name}</p>
            <p className="text-[10px] text-cyan-600 font-semibold">
                {(tech.defaultCommissionRate * 100).toFixed(0)}% comisión
            </p>
        </div>
        <button
            onClick={() => onDelete(tech.id)}
            className="text-red-500 hover:text-red-700 active:bg-red-100 p-2 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center ml-2"
            title="Desactivar"
        >
            <TrashIcon className="w-4 h-4" />
        </button>
    </div>
);

// Card para pantallas SM
const TechnicianCardSM = ({ tech, onDelete }) => (
    <div className="p-3 flex justify-between items-center hover:bg-gray-50 active:bg-gray-100">
        <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-800 text-sm truncate">{tech.name}</p>
            <p className="text-xs text-cyan-600 font-semibold">
                {(tech.defaultCommissionRate * 100).toFixed(0)}% comisión
            </p>
        </div>
        <button
            onClick={() => onDelete(tech.id)}
            className="text-red-500 hover:text-red-700 active:bg-red-100 p-2.5 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ml-2"
            title="Desactivar"
        >
            <TrashIcon className="w-4 h-4" />
        </button>
    </div>
);

export default TechnicianManager;
