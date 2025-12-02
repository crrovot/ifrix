// Card de técnico con detalles expandibles

import React from 'react';
import { UsersIcon, PrinterIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { IVA_PERCENTAGE } from '../../constants';

export const TechnicianCard = ({ 
    techName, 
    report, 
    isExpanded, 
    onToggle, 
    onPrint 
}) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div 
                className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                        <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
                    </div>
                    <div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-800">{techName}</h3>
                        <p className="text-xs text-gray-500">
                            {report.totalOrders} órdenes | Facturado: {formatCurrency(report.totalBruto)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-lg sm:text-xl font-bold text-orange-600">
                        {formatCurrency(report.totalCommission)}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onPrint(); }}
                        className="p-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                        title="Imprimir"
                    >
                        <PrinterIcon className="w-4 h-4 text-gray-600" />
                    </button>
                    <ChevronIcon isExpanded={isExpanded} />
                </div>
            </div>

            {/* Detalle expandible */}
            {isExpanded && (
                <TechnicianDetails details={report.details} />
            )}
        </div>
    );
};

// Icono de chevron animado
const ChevronIcon = ({ isExpanded }) => (
    <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    </div>
);

// Detalles del técnico
const TechnicianDetails = ({ details }) => {
    const sortedDetails = [...details].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="border-t border-gray-200">
            {/* Vista Móvil */}
            <div className="sm:hidden p-3 space-y-2 max-h-64 overflow-auto">
                {sortedDetails.map((order) => (
                    <OrderDetailCardMobile key={order.id} order={order} />
                ))}
            </div>

            {/* Vista Desktop - Tabla */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full text-xs">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Fecha</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Orden</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Cliente</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-600">Bruto</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-600">Neto</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-600">Repuestos</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-600">%</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-600">Comisión</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedDetails.map((order) => {
                            const netCost = order.rawCost / (1 + IVA_PERCENTAGE);
                            return (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-gray-600">{order.date}</td>
                                    <td className="px-3 py-2 font-medium text-gray-800">{order.workOrderNumber}</td>
                                    <td className="px-3 py-2 text-gray-700 max-w-[150px] truncate">{order.clientName}</td>
                                    <td className="px-3 py-2 text-right">{formatCurrency(order.rawCost)}</td>
                                    <td className="px-3 py-2 text-right text-gray-500">${Math.round(netCost).toLocaleString('es-CL')}</td>
                                    <td className="px-3 py-2 text-right text-gray-500">{formatCurrency(order.materialsCost)}</td>
                                    <td className="px-3 py-2 text-right text-cyan-600">{(order.commissionRate * 100).toFixed(0)}%</td>
                                    <td className="px-3 py-2 text-right font-bold text-orange-600">{formatCurrency(order.commissionValue)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Card de detalle para móvil
const OrderDetailCardMobile = ({ order }) => (
    <div className="p-2 bg-gray-50 rounded-lg border text-xs">
        <div className="flex justify-between items-start mb-1">
            <span className="font-semibold text-gray-800">{order.workOrderNumber}</span>
            <span className="font-bold text-orange-600">{formatCurrency(order.commissionValue)}</span>
        </div>
        <p className="text-gray-600 truncate">{order.clientName}</p>
        <div className="flex justify-between mt-1 text-gray-500">
            <span>{order.date}</span>
            <span>Bruto: {formatCurrency(order.rawCost)}</span>
        </div>
    </div>
);

export default TechnicianCard;
