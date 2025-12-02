// Formulario de nueva orden

import React from 'react';
import { PencilIcon, PlusIcon } from 'lucide-react';

export const OrderForm = ({ 
    newOrder, 
    technicians, 
    onOrderChange, 
    onSubmit 
}) => {
    const activeTechnicians = technicians.filter(t => t.active !== false);
    const isValid = newOrder.workOrderNumber && newOrder.technicianId && newOrder.rawCost > 0;

    return (
        <div className="lg:col-span-2 p-2 xs:p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-xs xs:text-sm sm:text-base font-semibold text-slate-800 mb-2 xs:mb-3 flex items-center gap-1.5 xs:gap-2">
                <PencilIcon className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-cyan-600 flex-shrink-0" />
                <span>Nueva Orden</span>
            </h2>
            
            <form onSubmit={onSubmit} className="space-y-2 xs:space-y-3">
                {/* Primera fila: Técnico y N° Orden */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-3">
                    <div>
                        <label className="block text-[10px] xs:text-xs font-medium text-gray-600 mb-1">
                            Técnico
                        </label>
                        <select
                            name="technicianId"
                            value={newOrder.technicianId}
                            onChange={onOrderChange}
                            required
                            className="w-full p-2 xs:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 bg-white min-h-[44px]"
                        >
                            <option value="" disabled>Seleccionar...</option>
                            {activeTechnicians.map(tech => (
                                <option key={tech.id} value={tech.id}>{tech.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] xs:text-xs font-medium text-gray-600 mb-1">
                            N° Orden
                        </label>
                        <input
                            type="text"
                            name="workOrderNumber"
                            value={newOrder.workOrderNumber}
                            onChange={onOrderChange}
                            required
                            className="w-full p-2 xs:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 min-h-[44px]"
                            placeholder="OT-001"
                        />
                    </div>
                </div>

                {/* Cliente */}
                <div>
                    <label className="block text-[10px] xs:text-xs font-medium text-gray-600 mb-1">
                        Cliente
                    </label>
                    <input
                        type="text"
                        name="clientName"
                        value={newOrder.clientName}
                        onChange={onOrderChange}
                        required
                        className="w-full p-2 xs:p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 min-h-[44px]"
                    />
                </div>

                {/* Valores: Bruto, Repuestos, Comisión */}
                <div className="grid grid-cols-3 gap-1.5 xs:gap-2">
                    <div>
                        <label className="block text-[10px] xs:text-xs font-medium text-gray-600 mb-1">
                            Bruto ($)
                        </label>
                        <input
                            type="number"
                            name="rawCost"
                            value={newOrder.rawCost || ''}
                            onChange={onOrderChange}
                            min="0"
                            required
                            className="w-full p-2 xs:p-2.5 text-xs xs:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 min-h-[44px]"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] xs:text-xs font-medium text-gray-600 mb-1">
                            Repuestos
                        </label>
                        <input
                            type="number"
                            name="materialsCost"
                            value={newOrder.materialsCost || ''}
                            onChange={onOrderChange}
                            min="0"
                            required
                            className="w-full p-2 xs:p-2.5 text-xs xs:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 min-h-[44px]"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] xs:text-xs font-medium text-gray-600 mb-1">
                            % Com.
                        </label>
                        <div className="flex">
                            <input
                                type="number"
                                name="commissionRate"
                                value={newOrder.commissionRate * 100 || ''}
                                onChange={onOrderChange}
                                min="0"
                                max="100"
                                step="0.1"
                                required
                                className="w-full p-2 xs:p-2.5 text-xs xs:text-sm border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 min-h-[44px]"
                            />
                            <span className="px-1.5 xs:px-2 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg text-[10px] xs:text-xs font-bold text-gray-600 flex items-center">
                                %
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-2.5 xs:py-3 px-3 rounded-lg text-sm transition-all flex items-center justify-center disabled:opacity-50 min-h-[48px] active:scale-[0.98]"
                    disabled={!isValid}
                >
                    <PlusIcon className="w-4 h-4 xs:w-5 xs:h-5 mr-1.5" />
                    Agregar Orden
                </button>
            </form>
        </div>
    );
};

export default OrderForm;
