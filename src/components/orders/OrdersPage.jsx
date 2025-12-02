// Página/contenedor principal de órdenes

import React from 'react';
import { OrderForm } from './OrderForm';
import { OrderSummary } from './OrderSummary';
import { OrderList } from './OrderList';
import { RecentOrders } from './RecentOrders';
import { EditOrderModal } from './EditOrderModal';

export const OrdersPage = ({
    orders,
    technicians,
    newOrder,
    calculatedValues,
    onOrderChange,
    onSubmit,
    // Edición
    editingOrder,
    editingCalculatedValues,
    onEditOrder,
    onDeleteOrder,
    onEditChange,
    onSaveEdit,
    onCancelEdit,
}) => {
    return (
        <div className="space-y-3 xs:space-y-4">
            {/* Modal de edición */}
            {editingOrder && (
                <EditOrderModal
                    order={editingOrder}
                    technicians={technicians}
                    calculatedValues={editingCalculatedValues}
                    onChange={onEditChange}
                    onSave={() => onSaveEdit(technicians)}
                    onCancel={onCancelEdit}
                />
            )}

            {/* Sección Superior: Formulario + Resumen */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 xs:gap-3 sm:gap-4">
                <OrderForm 
                    newOrder={newOrder}
                    technicians={technicians}
                    onOrderChange={onOrderChange}
                    onSubmit={onSubmit}
                />
                <OrderSummary 
                    newOrder={newOrder}
                    calculatedValues={calculatedValues}
                />
            </div>

            {/* Últimas Órdenes - Solo móvil */}
            <RecentOrders 
                orders={orders}
                technicians={technicians}
            />

            {/* Lista completa de órdenes */}
            <OrderList 
                orders={orders}
                technicians={technicians}
                onEdit={onEditOrder}
                onDelete={onDeleteOrder}
            />
        </div>
    );
};

export default OrdersPage;
