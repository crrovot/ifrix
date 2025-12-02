// Últimas órdenes (vista compacta para móvil)

import React from 'react';
import { BookOpenIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const RecentOrders = ({ orders, technicians }) => {
    const recentOrders = orders.slice(-6).reverse();

    const getTechnicianName = (techId) => {
        const tech = technicians.find(t => t.id === techId);
        return tech?.name || '-';
    };

    return (
        <div className="lg:hidden p-2 xs:p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xs xs:text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5 xs:gap-2">
                <BookOpenIcon className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-cyan-600 flex-shrink-0" />
                <span>Últimas Órdenes</span>
                <span className="text-[10px] xs:text-xs font-normal text-gray-500">({orders.length})</span>
            </h3>
            
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 xs:gap-2 max-h-40 xs:max-h-48 overflow-auto">
                {recentOrders.map((order) => (
                    <div 
                        key={order.id} 
                        className="flex justify-between items-center py-1.5 xs:py-2 px-2 xs:px-3 bg-white rounded-lg border text-[10px] xs:text-xs hover:bg-cyan-50 active:bg-cyan-100 transition-colors"
                    >
                        <div className="truncate min-w-0 flex-1 mr-2">
                            <span className="font-semibold text-gray-800 block truncate">
                                {order.workOrderNumber}
                            </span>
                            <span className="text-gray-500 text-[9px] xs:text-[10px]">
                                {getTechnicianName(order.technicianId)}
                            </span>
                        </div>
                        <span className="font-bold text-orange-600 whitespace-nowrap">
                            {formatCurrency(order.commissionValue)}
                        </span>
                    </div>
                ))}
                {orders.length === 0 && (
                    <p className="text-center text-gray-400 text-xs py-4 col-span-2">Sin órdenes</p>
                )}
            </div>
        </div>
    );
};

export default RecentOrders;
