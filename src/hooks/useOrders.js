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
    const [editingOrder, setEditingOrder] = useState(null); // Orden en edición

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
    const addOrder = useCallback((e, technicians = []) => {
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

        // Obtener nombre del técnico para guardarlo en la orden
        const technician = technicians.find(t => t.id === newOrder.technicianId);
        const technicianName = technician?.name || 'Desconocido';

        const orderToSave = {
            id: uuidv4(),
            ...newOrder,
            workOrderNumber: orderNumber,
            technicianName, // Guardar nombre del técnico
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
        if (window.confirm(`¿Eliminar la orden "${order?.workOrderNumber}"?`)) {
            const updatedOrders = orders.filter(o => o.id !== id);
            setOrders(updatedOrders);
            saveToLocalStorage(STORAGE_KEYS.ORDERS, updatedOrders);
            toast.success(`Orden "${order?.workOrderNumber}" eliminada.`);
        }
    }, [orders]);

    // Iniciar edición de orden
    const startEditOrder = useCallback((order) => {
        setEditingOrder({ ...order });
    }, []);

    // Cancelar edición
    const cancelEditOrder = useCallback(() => {
        setEditingOrder(null);
    }, []);

    // Manejar cambios en orden en edición
    const handleEditOrderChange = useCallback((e) => {
        const { name, value } = e.target;
        
        if (name === 'rawCost' || name === 'materialsCost') {
            const numValue = parseFloat(value) || 0;
            setEditingOrder(prev => ({ ...prev, [name]: numValue }));
        } else if (name === 'commissionRate') {
            const numValue = parseFloat(value) || 0;
            setEditingOrder(prev => ({ ...prev, [name]: numValue / 100 }));
        } else {
            setEditingOrder(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    // Guardar orden editada
    const saveEditOrder = useCallback((technicians = []) => {
        if (!editingOrder) return false;

        // Recalcular comisión
        const { commissionValue } = calculateOrderValues(
            editingOrder.rawCost,
            editingOrder.materialsCost,
            editingOrder.commissionRate
        );

        // Obtener nombre del técnico actualizado
        const technician = technicians.find(t => t.id === editingOrder.technicianId);
        const technicianName = technician?.name || editingOrder.technicianName || 'Desconocido';

        const updatedOrder = {
            ...editingOrder,
            technicianName,
            commissionValue,
            updatedAt: new Date().toISOString(),
        };

        const updatedOrders = orders.map(o => 
            o.id === editingOrder.id ? updatedOrder : o
        );

        setOrders(updatedOrders);
        saveToLocalStorage(STORAGE_KEYS.ORDERS, updatedOrders);
        setEditingOrder(null);
        toast.success(`Orden "${updatedOrder.workOrderNumber}" actualizada.`);
        return true;
    }, [editingOrder, orders]);

    // Valores calculados para orden en edición
    const editingCalculatedValues = useMemo(() => {
        if (!editingOrder) return null;
        return calculateOrderValues(
            editingOrder.rawCost,
            editingOrder.materialsCost,
            editingOrder.commissionRate
        );
    }, [editingOrder]);

    // Resetear formulario
    const resetForm = useCallback(() => {
        setNewOrder(INITIAL_ORDER_STATE);
    }, []);

    return {
        orders,
        newOrder,
        calculatedValues,
        editingOrder,
        editingCalculatedValues,
        handleOrderChange,
        addOrder,
        deleteOrder,
        startEditOrder,
        cancelEditOrder,
        handleEditOrderChange,
        saveEditOrder,
        resetForm,
        setNewOrder,
    };
};
