// Modal para editar órdenes

import React from 'react';
import { XIcon, SaveIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const EditOrderModal = ({
    order,
    technicians,
    calculatedValues,
    onChange,
    onSave,
    onCancel,
}) => {
    if (!order) return null;

    const activeTechnicians = technicians.filter(t => t.active !== false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                        Editar Orden: {order.workOrderNumber}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <XIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-3">
                    {/* Fecha */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Fecha
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={order.date}
                            onChange={onChange}
                            className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 min-h-[44px]"
                        />
                    </div>

                    {/* Técnico */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Técnico
                        </label>
                        <select
                            name="technicianId"
                            value={order.technicianId}
                            onChange={onChange}
                            className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 bg-white min-h-[44px]"
                        >
                            <option value="" disabled>Seleccionar...</option>
                            {activeTechnicians.map(tech => (
                                <option key={tech.id} value={tech.id}>{tech.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Cliente */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Cliente
                        </label>
                        <input
                            type="text"
                            name="clientName"
                            value={order.clientName}
                            onChange={onChange}
                            className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 min-h-[44px]"
                        />
                    </div>

                    {/* Valores */}
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Bruto ($)
                            </label>
                            <input
                                type="number"
                                name="rawCost"
                                value={order.rawCost || ''}
                                onChange={onChange}
                                min="0"
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 min-h-[44px]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Repuestos
                            </label>
                            <input
                                type="number"
                                name="materialsCost"
                                value={order.materialsCost || ''}
                                onChange={onChange}
                                min="0"
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 min-h-[44px]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                % Com.
                            </label>
                            <input
                                type="number"
                                name="commissionRate"
                                value={(order.commissionRate * 100) || ''}
                                onChange={onChange}
                                min="0"
                                max="100"
                                step="0.1"
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 min-h-[44px]"
                            />
                        </div>
                    </div>

                    {/* Preview de comisión */}
                    {calculatedValues && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Nueva comisión:</span>
                                <span className="font-bold text-orange-600 text-lg">
                                    {formatCurrency(calculatedValues.commissionValue)}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Base: {formatCurrency(calculatedValues.commissionableBase)} × {(order.commissionRate * 100).toFixed(0)}%
                            </div>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-2.5 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors min-h-[44px]"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                        >
                            <SaveIcon className="w-4 h-4" />
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditOrderModal;
