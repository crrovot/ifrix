// Filtros de reporte

import React from 'react';
import { CalculatorIcon } from 'lucide-react';

export const ReportFilters = ({
    technicians,
    selectedTechnicianId,
    dateRange,
    isFetching,
    onTechnicianChange,
    onDateChange,
    onGenerate,
}) => {
    const activeTechnicians = technicians.filter(t => t.active !== false);

    return (
        <div className="p-2 xs:p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {/* Selector de técnico */}
                <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] xs:text-xs font-medium text-gray-600 mb-1">
                        Técnico
                    </label>
                    <select
                        value={selectedTechnicianId}
                        onChange={(e) => onTechnicianChange(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 bg-white min-h-[44px]"
                    >
                        <option value="all">Todos los técnicos</option>
                        {activeTechnicians.map(tech => (
                            <option key={tech.id} value={tech.id}>{tech.name}</option>
                        ))}
                    </select>
                </div>

                {/* Fecha inicio */}
                <div>
                    <label className="block text-[10px] xs:text-xs font-medium text-gray-600 mb-1">
                        Desde
                    </label>
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => onDateChange('start', e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 min-h-[44px]"
                    />
                </div>

                {/* Fecha fin */}
                <div>
                    <label className="block text-[10px] xs:text-xs font-medium text-gray-600 mb-1">
                        Hasta
                    </label>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => onDateChange('end', e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 min-h-[44px]"
                    />
                </div>

                {/* Botón generar */}
                <div className="col-span-2 sm:col-span-1 flex items-end">
                    <button
                        onClick={onGenerate}
                        disabled={isFetching}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all flex items-center justify-center disabled:opacity-50 min-h-[44px] active:scale-[0.98]"
                    >
                        <CalculatorIcon className="w-4 h-4 mr-1" />
                        {isFetching ? 'Cargando...' : 'Generar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportFilters;
