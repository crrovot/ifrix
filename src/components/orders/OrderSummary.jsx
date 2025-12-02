// Resumen de cálculos de la orden

import React from 'react';
import { CalculatorIcon } from 'lucide-react';
import { IVA_PERCENTAGE } from '../../constants';
import { formatCurrency, formatCurrencyNoDecimals } from '../../utils/formatters';

export const OrderSummary = ({ newOrder, calculatedValues }) => {
    return (
        <div className="lg:col-span-1 p-2 xs:p-3 sm:p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <h3 className="text-xs xs:text-sm font-semibold text-slate-800 mb-2 xs:mb-3 flex items-center gap-1.5 xs:gap-2">
                <CalculatorIcon className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-cyan-600 flex-shrink-0" />
                <span>Resumen</span>
            </h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5 xs:gap-2 text-[10px] xs:text-xs">
                <SummaryRow 
                    label="Bruto:" 
                    value={formatCurrency(newOrder.rawCost)} 
                    variant="default"
                />
                <SummaryRow 
                    label={`IVA (${IVA_PERCENTAGE * 100}%):`}
                    value={formatCurrencyNoDecimals(calculatedValues.ivaValue)} 
                    variant="muted"
                />
                <SummaryRow 
                    label="Neto:" 
                    value={formatCurrencyNoDecimals(calculatedValues.netCost)} 
                    variant="highlight"
                />
                <SummaryRow 
                    label="Repuestos:" 
                    value={formatCurrency(newOrder.materialsCost)} 
                    variant="muted"
                />
                <SummaryRow 
                    label="Base Com.:" 
                    value={formatCurrencyNoDecimals(calculatedValues.commissionableBase)} 
                    variant="highlight"
                    className="col-span-2 lg:col-span-1"
                />
                
                {/* Comisión total */}
                <div className="col-span-2 lg:col-span-1 border-t border-cyan-200 pt-2 mt-1">
                    <div className="flex justify-between items-center p-2 bg-orange-100 rounded-lg">
                        <span className="text-orange-700 font-bold text-xs xs:text-sm">COMISIÓN:</span>
                        <span className="font-bold text-orange-700 text-base xs:text-lg">
                            {formatCurrency(calculatedValues.commissionValue)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Fila de resumen reutilizable
const SummaryRow = ({ label, value, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-white/50',
        muted: 'bg-white/50 text-gray-500',
        highlight: 'bg-cyan-100/50',
    };

    const labelColors = {
        default: 'text-gray-600',
        muted: 'text-gray-500',
        highlight: 'text-cyan-700 font-medium',
    };

    const valueColors = {
        default: 'font-medium',
        muted: 'text-gray-500',
        highlight: 'font-semibold text-cyan-800',
    };

    return (
        <div className={`flex justify-between p-1.5 xs:p-2 rounded ${variants[variant]} ${className}`}>
            <span className={labelColors[variant]}>{label}</span>
            <span className={valueColors[variant]}>{value}</span>
        </div>
    );
};

export default OrderSummary;
