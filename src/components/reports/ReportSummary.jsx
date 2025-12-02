// Resumen de totales del reporte

import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export const ReportSummary = ({ totals }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <SummaryCard 
                label="Órdenes" 
                value={totals.totalOrders}
                colorClass="bg-cyan-50 border-cyan-200 text-cyan-600"
                valueColorClass="text-cyan-800"
            />
            <SummaryCard 
                label="Facturado" 
                value={formatCurrency(totals.totalBruto)}
                colorClass="bg-blue-50 border-blue-200 text-blue-600"
                valueColorClass="text-blue-800"
                smallValue
            />
            <SummaryCard 
                label="Comisiones" 
                value={formatCurrency(totals.totalCommission)}
                colorClass="bg-orange-50 border-orange-200 text-orange-600"
                valueColorClass="text-orange-700"
            />
            <SummaryCard 
                label="Técnicos" 
                value={totals.totalTechnicians}
                colorClass="bg-gray-50 border-gray-200 text-gray-600"
                valueColorClass="text-gray-800"
            />
        </div>
    );
};

const SummaryCard = ({ label, value, colorClass, valueColorClass, smallValue = false }) => (
    <div className={`p-3 rounded-lg border text-center ${colorClass}`}>
        <p className="text-[10px] sm:text-xs uppercase font-medium">{label}</p>
        <p className={`${smallValue ? 'text-sm sm:text-lg' : 'text-lg sm:text-xl'} font-bold ${valueColorClass}`}>
            {value}
        </p>
    </div>
);

export default ReportSummary;
