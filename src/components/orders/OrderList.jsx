// Lista de órdenes responsive con edición y eliminación

import React from 'react';
import { BookOpenIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const OrderList = ({ 
    orders, 
    technicians, 
    title = "Todas las Órdenes",
    onEdit,
    onDelete,
}) => {
    const getTechnicianName = (order) => {
        // Primero usar nombre guardado, luego buscar
        if (order.technicianName) return order.technicianName;
        const tech = technicians.find(t => String(t.id) === String(order.technicianId));
        return tech?.name || '-';
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-2 xs:p-3 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="text-xs xs:text-sm font-semibold text-gray-800 flex items-center gap-1.5 xs:gap-2">
                    <BookOpenIcon className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-cyan-600 flex-shrink-0" />
                    <span className="hidden xs:inline">{title}</span>
                    <span className="xs:hidden">Órdenes</span>
                    <span className="text-[10px] xs:text-xs font-normal text-gray-500">
                        ({orders.length})
                    </span>
                </h3>
            </div>

            {/* Vista Móvil XS */}
            <div className="xs:hidden max-h-80 overflow-auto">
                {orders.slice().reverse().map((order) => (
                    <OrderCardXS 
                        key={order.id} 
                        order={order} 
                        techName={getTechnicianName(order)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
                {orders.length === 0 && (
                    <p className="text-center text-gray-400 py-6 text-xs">No hay órdenes</p>
                )}
            </div>

            {/* Vista Móvil SM */}
            <div className="hidden xs:block sm:hidden max-h-96 overflow-auto">
                {orders.slice().reverse().map((order) => (
                    <OrderCardSM 
                        key={order.id} 
                        order={order} 
                        techName={getTechnicianName(order)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
                {orders.length === 0 && (
                    <p className="text-center text-gray-400 py-8 text-sm">No hay órdenes registradas</p>
                )}
            </div>

            {/* Vista Desktop - Tabla */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full text-xs">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-600 uppercase">Fecha</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600 uppercase">Orden</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600 uppercase">Cliente</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600 uppercase">Técnico</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-600 uppercase">Bruto</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-600 uppercase">Comisión</th>
                            <th className="px-3 py-2 text-center font-medium text-gray-600 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.slice().reverse().map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-600">{order.date}</td>
                                <td className="px-3 py-2 font-semibold text-gray-800">{order.workOrderNumber}</td>
                                <td className="px-3 py-2 text-gray-700 max-w-[200px] truncate">{order.clientName}</td>
                                <td className="px-3 py-2 text-cyan-700 font-medium">{getTechnicianName(order)}</td>
                                <td className="px-3 py-2 text-right font-medium">{formatCurrency(order.rawCost)}</td>
                                <td className="px-3 py-2 text-right font-bold text-orange-600">{formatCurrency(order.commissionValue)}</td>
                                <td className="px-3 py-2">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => onEdit?.(order)}
                                            className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete?.(order.id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <p className="text-center text-gray-400 py-6 text-sm">No hay órdenes registradas</p>
                )}
            </div>
        </div>
    );
};

// Card para XS con acciones
const OrderCardXS = ({ order, techName, onEdit, onDelete }) => (
    <div className="p-2 border-b border-gray-100 hover:bg-gray-50">
        <div className="flex justify-between items-start mb-0.5">
            <span className="font-semibold text-gray-800 text-[11px]">{order.workOrderNumber}</span>
            <div className="flex items-center gap-1">
                <span className="font-bold text-orange-600 text-[11px]">{formatCurrency(order.commissionValue)}</span>
                <button
                    onClick={() => onEdit?.(order)}
                    className="p-1 text-cyan-600 hover:bg-cyan-50 rounded"
                >
                    <PencilIcon className="w-3 h-3" />
                </button>
                <button
                    onClick={() => onDelete?.(order.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                    <TrashIcon className="w-3 h-3" />
                </button>
            </div>
        </div>
        <p className="text-[10px] text-gray-600 truncate">{order.clientName}</p>
        <div className="flex justify-between mt-0.5 text-[9px] text-gray-500">
            <span>{order.date}</span>
            <span className="text-cyan-600 font-medium">{techName}</span>
        </div>
    </div>
);

// Card para SM con acciones
const OrderCardSM = ({ order, techName, onEdit, onDelete }) => (
    <div className="p-3 border-b border-gray-100 hover:bg-gray-50">
        <div className="flex justify-between items-start mb-1">
            <span className="font-semibold text-gray-800 text-xs">{order.workOrderNumber}</span>
            <div className="flex items-center gap-1.5">
                <span className="font-bold text-orange-600 text-xs">{formatCurrency(order.commissionValue)}</span>
                <button
                    onClick={() => onEdit?.(order)}
                    className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg"
                >
                    <PencilIcon className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => onDelete?.(order.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                >
                    <TrashIcon className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
        <p className="text-[11px] text-gray-600 truncate">{order.clientName}</p>
        <div className="flex justify-between mt-1 text-[10px] text-gray-500">
            <span>{order.date}</span>
            <span className="text-cyan-600 font-medium">{techName}</span>
        </div>
    </div>
);

export default OrderList;
