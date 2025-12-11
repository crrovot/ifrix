import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { calculateOrderValues } from '../utils/calculations';
import { INITIAL_ORDER_STATE } from '../constants';
import { supabase } from '../services/supabase';

export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [newOrder, setNewOrder] = useState(INITIAL_ORDER_STATE);
    const [editingOrder, setEditingOrder] = useState(null);
    const [loading, setLoading] = useState(false);

    // Cargar órdenes
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Mapear campos de snake_case (Supabase) a camelCase (App)
            const mappedOrders = data.map(o => ({
                id: o.id,
                workOrderNumber: o.work_order_number,
                technicianId: o.technician_id,
                technicianName: o.technician_name,
                clientName: o.client_name || '',
                rawCost: parseFloat(o.raw_cost) || 0,
                materialsCost: parseFloat(o.materials_cost) || 0,
                commissionRate: parseFloat(o.commission_rate) || 0,
                commissionValue: parseFloat(o.commission_value) || 0,
                date: o.date,
                timestamp: o.timestamp,
                createdAt: o.created_at,
                updatedAt: o.updated_at
            }));

            setOrders(mappedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Error al cargar las órdenes.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Valores calculados
    const calculatedValues = useMemo(() => {
        const { rawCost, materialsCost, commissionRate } = newOrder;
        return calculateOrderValues(rawCost, materialsCost, commissionRate);
    }, [newOrder.rawCost, newOrder.materialsCost, newOrder.commissionRate]);

    // Manejar cambios en formulario
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
    const addOrder = useCallback(async (e, technicians = []) => {
        e?.preventDefault();

        if (!newOrder.technicianId) {
            toast.error('Debe seleccionar un técnico.');
            return false;
        }

        const orderNumber = newOrder.workOrderNumber.trim().toUpperCase();
        // Verificar duplicados en local (optimista) o DB
        const existingOrder = orders.find(o => o.workOrderNumber.toUpperCase() === orderNumber);
        if (existingOrder) {
            toast.error(`La orden N° ${orderNumber} ya existe.`);
            return false;
        }

        const technician = technicians.find(t => t.id === newOrder.technicianId);
        const technicianName = technician?.name || 'Desconocido';

        const orderToSave = {
            work_order_number: orderNumber,
            technician_id: newOrder.technicianId,
            technician_name: technicianName,
            client_name: newOrder.clientName || '',
            raw_cost: newOrder.rawCost,
            materials_cost: newOrder.materialsCost,
            commission_rate: newOrder.commissionRate,
            commission_value: calculatedValues.commissionValue,
            date: newOrder.date || new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
        };

        try {
            const { data, error } = await supabase
                .from('orders')
                .insert([orderToSave])
                .select();

            if (error) throw error;

            toast.success(`Orden N° ${orderNumber} agregada.`);
            fetchOrders(); // Recargar lista

            setNewOrder({
                ...INITIAL_ORDER_STATE,
                technicianId: newOrder.technicianId,
                commissionRate: newOrder.commissionRate,
            });
            return true;
        } catch (error) {
            console.error('Error adding order:', error);
            toast.error('Error al guardar la orden.');
            return false;
        }
    }, [newOrder, orders, calculatedValues, fetchOrders]);

    // Eliminar orden
    const deleteOrder = useCallback(async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta orden?')) return;

        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Orden eliminada.');
            setOrders(prev => prev.filter(o => o.id !== id));
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('Error al eliminar la orden.');
        }
    }, []);

    // Edición
    const startEditOrder = useCallback((order) => setEditingOrder({ ...order }), []);
    const cancelEditOrder = useCallback(() => setEditingOrder(null), []);

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

    const saveEditOrder = useCallback(async (technicians = []) => {
        if (!editingOrder) return false;

        const { commissionValue } = calculateOrderValues(
            editingOrder.rawCost,
            editingOrder.materialsCost,
            editingOrder.commissionRate
        );

        const technician = technicians.find(t => t.id === editingOrder.technicianId);
        const technicianName = technician?.name || editingOrder.technicianName || 'Desconocido';

        const updates = {
            work_order_number: editingOrder.workOrderNumber,
            technician_id: editingOrder.technicianId,
            technician_name: technicianName,
            raw_cost: editingOrder.rawCost,
            materials_cost: editingOrder.materialsCost,
            commission_rate: editingOrder.commissionRate,
            commission_value: commissionValue,
            updated_at: new Date().toISOString(),
        };

        try {
            const { error } = await supabase
                .from('orders')
                .update(updates)
                .eq('id', editingOrder.id);

            if (error) throw error;

            toast.success('Orden actualizada.');
            setEditingOrder(null);
            fetchOrders();
            return true;
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Error al actualizar la orden.');
            return false;
        }
    }, [editingOrder, fetchOrders]);

    const editingCalculatedValues = useMemo(() => {
        if (!editingOrder) return null;
        return calculateOrderValues(
            editingOrder.rawCost,
            editingOrder.materialsCost,
            editingOrder.commissionRate
        );
    }, [editingOrder]);

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
        setNewOrder,
        loading
    };
};
