// Hook personalizado para gestión de órdenes

import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storage';
import { calculateOrderValues } from '../utils/calculations';
import { STORAGE_KEYS, INITIAL_ORDER_STATE } from '../constants';

export const useOrders = () => {
    const [orders, setOrders] = useState(() => 
        loadFromLocalStorage(STORAGE_KEYS.ORDERS)
    );
    const [newOrder, setNewOrder] = useState(INITIAL_ORDER_STATE);

    // Cargar datos al montar
    useEffect(() => {
        setOrders(loadFromLocalStorage(STORAGE_KEYS.ORDERS));
    }, []);

    // Valores calculados para la nueva orden
    const calculatedValues = useMemo(() => {
        const { rawCost, materialsCost, commissionRate } = newOrder;
        return calculateOrderValues(rawCost, materialsCost, commissionRate);
    }, [newOrder.rawCost, newOrder.materialsCost, newOrder.commissionRate]);

    // Manejar cambios en el formulario
    const handleOrderChange = useCallback((e) => {
        const { name, value } = e.target;
        
        if (name === 'rawCost' || name === 'materialsCost') {
            const numValue = parseFloat(value) || 0;
            setNewOrder(prev => ({ ...prev, [name]: numValue }));
        } else if (name === 'commissionRate') {
            const numValue = parseFloat(value) || 0;
            setNewOrder(prev => ({ ...prev, [name]: numValue / 100 }));
        } else {
            setNewOrder(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    // Agregar orden
    const addOrder = useCallback((e) => {
        e?.preventDefault();
        
        if (!newOrder.technicianId) {
            toast.error('Debe seleccionar un técnico.');
            return false;
        }

        // Validar orden única
        const orderNumber = newOrder.workOrderNumber.trim().toUpperCase();
        const existingOrder = orders.find(o => o.workOrderNumber.toUpperCase() === orderNumber);
        if (existingOrder) {
            toast.error(`La orden N° ${orderNumber} ya existe. No se permiten órdenes duplicadas.`);
            return false;
        }

        const orderToSave = {
            id: uuidv4(),
            ...newOrder,
            workOrderNumber: orderNumber,
            commissionValue: calculatedValues.commissionValue,
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        };

        const updatedOrders = [...orders, orderToSave];
        setOrders(updatedOrders);
        saveToLocalStorage(STORAGE_KEYS.ORDERS, updatedOrders);

        toast.success(`¡Orden N° ${orderToSave.workOrderNumber} agregada exitosamente!`);
        
        // Resetear formulario manteniendo técnico y comisión
        setNewOrder({
            ...INITIAL_ORDER_STATE,
            technicianId: newOrder.technicianId,
            commissionRate: newOrder.commissionRate,
        });
        
        return true;
    }, [newOrder, orders, calculatedValues.commissionValue]);

    // Eliminar orden
    const deleteOrder = useCallback((id) => {
        const order = orders.find(o => o.id === id);
        const updatedOrders = orders.filter(o => o.id !== id);
        setOrders(updatedOrders);
        saveToLocalStorage(STORAGE_KEYS.ORDERS, updatedOrders);
        toast.success(`Orden "${order?.workOrderNumber}" eliminada.`);
    }, [orders]);

    // Resetear formulario
    const resetForm = useCallback(() => {
        setNewOrder(INITIAL_ORDER_STATE);
    }, []);

    return {
        orders,
        newOrder,
        calculatedValues,
        handleOrderChange,
        addOrder,
        deleteOrder,
        resetForm,
        setNewOrder,
    };
};
