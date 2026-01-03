// useMonitorData.js - Hook personalizado para gestionar datos del monitor con Supabase
import { useState, useEffect } from 'react';
import * as monitorService from '../services/monitorService';
import { supabase } from '../services/supabase';

export const useMonitorData = (currentUser) => {
    const [data, setData] = useState({
        branches: [],
        users: [],
        cats: [],
        techs: [],
        orders: [],
        history: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar datos iniciales
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [branches, users, categories, technicians, orders, history] = await Promise.all([
                monitorService.getBranches(),
                monitorService.getMonitorUsers(),
                monitorService.getCategories(),
                monitorService.getTechnicians(),
                monitorService.getOrders(),
                monitorService.getHistory()
            ]);

            console.log('Monitor data loaded:', {
                branches: branches.length,
                users: users.length,
                categories: categories.length,
                technicians: technicians.length,
                orders: orders.length,
                history: history.length
            });
            
            console.log('Orders:', orders);

            setData({
                branches,
                users,
                cats: categories,
                techs: technicians,
                orders,
                history
            });

            // Inicializar datos por defecto si no existen
            if (branches.length === 0) {
                await monitorService.initializeDefaultData();
                // Recargar después de inicializar
                loadData();
            }
        } catch (err) {
            console.error('Error loading monitor data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Cargar datos al montar
    useEffect(() => {
        loadData();
        
        // Polling cada 15 segundos para sincronizar datos entre sedes
        const intervalId = setInterval(() => {
            console.log('Refrescando datos del monitor...');
            loadData();
        }, 15000); // 15 segundos
        
        return () => clearInterval(intervalId);
    }, []);

    // Suscribirse a cambios en tiempo real
    useEffect(() => {
        // Suscripción a órdenes
        const ordersSubscription = supabase
            .channel('monitor-orders-changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'monitor_orders' },
                async (payload) => {
                    console.log('🔔 Cambio detectado en monitor_orders:', payload);
                    const orders = await monitorService.getOrders();
                    setData(prev => ({ ...prev, orders }));
                }
            )
            .subscribe();

        // Suscripción a historial
        const historySubscription = supabase
            .channel('monitor-history-changes')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'monitor_history' },
                async (payload) => {
                    console.log('🔔 Cambio detectado en monitor_history:', payload);
                    const history = await monitorService.getHistory();
                    setData(prev => ({ ...prev, history }));
                }
            )
            .subscribe();

        // Suscripción a usuarios
        const usersSubscription = supabase
            .channel('monitor-users-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'monitor_users' },
                async (payload) => {
                    console.log('🔔 Cambio detectado en monitor_users:', payload);
                    const users = await monitorService.getMonitorUsers();
                    setData(prev => ({ ...prev, users }));
                }
            )
            .subscribe();

        // Suscripción a sucursales
        const branchesSubscription = supabase
            .channel('monitor-branches-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'monitor_branches' },
                async (payload) => {
                    console.log('🔔 Cambio detectado en monitor_branches:', payload);
                    const branches = await monitorService.getBranches();
                    setData(prev => ({ ...prev, branches }));
                }
            )
            .subscribe();

        // Suscripción a técnicos
        const techniciansSubscription = supabase
            .channel('monitor-technicians-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'monitor_technicians' },
                async (payload) => {
                    console.log('🔔 Cambio detectado en monitor_technicians:', payload);
                    const technicians = await monitorService.getTechnicians();
                    setData(prev => ({ ...prev, techs: technicians }));
                }
            )
            .subscribe();

        // Suscripción a categorías
        const categoriesSubscription = supabase
            .channel('monitor-categories-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'monitor_categories' },
                async (payload) => {
                    console.log('🔔 Cambio detectado en monitor_categories:', payload);
                    const categories = await monitorService.getCategories();
                    setData(prev => ({ ...prev, cats: categories }));
                }
            )
            .subscribe();

        // Cleanup
        return () => {
            ordersSubscription.unsubscribe();
            historySubscription.unsubscribe();
            usersSubscription.unsubscribe();
            branchesSubscription.unsubscribe();
            techniciansSubscription.unsubscribe();
            categoriesSubscription.unsubscribe();
        };
    }, []);

    // ============================================
    // ÓRDENES
    // ============================================

    const addOrder = async (orderData) => {
        try {
            const created = await monitorService.addOrder(orderData);
            if (created) {
                setData(prev => ({
                    ...prev,
                    orders: [...prev.orders, created]
                }));
                return created;
            }
            return null;
        } catch (err) {
            console.error('Error adding order:', err);
            return null;
        }
    };

    const deleteOrder = async (id, deletedBy) => {
        try {
            const order = data.orders.find(o => o.id === id);
            if (!order) return false;

            // Agregar al historial
            await monitorService.addHistoryEntry({
                order_id: order.id,
                tech: order.tech,
                catId: order.catId,
                creator: order.creator,
                branchId: order.branchId,
                start: order.start,
                deletedBy: deletedBy,
                deletedAt: Date.now()
            });

            // Eliminar orden
            const deleted = await monitorService.deleteOrder(id);
            if (deleted) {
                setData(prev => ({
                    ...prev,
                    orders: prev.orders.filter(o => o.id !== id)
                }));
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error deleting order:', err);
            return false;
        }
    };

    const clearOrders = async (branchId, deletedBy) => {
        try {
            const ordersToClear = branchId 
                ? data.orders.filter(o => o.branchId === branchId)
                : data.orders;

            // Agregar todas al historial
            for (const order of ordersToClear) {
                await monitorService.addHistoryEntry({
                    order_id: order.id,
                    tech: order.tech,
                    catId: order.catId,
                    creator: order.creator,
                    branchId: order.branchId,
                    start: order.start,
                    deletedBy: deletedBy,
                    deletedAt: Date.now()
                });
            }

            // Eliminar órdenes
            if (branchId) {
                await monitorService.deleteOrdersByBranch(branchId);
            } else {
                await monitorService.deleteAllOrders();
            }

            setData(prev => ({
                ...prev,
                orders: branchId 
                    ? prev.orders.filter(o => o.branchId !== branchId)
                    : []
            }));

            return true;
        } catch (err) {
            console.error('Error clearing orders:', err);
            return false;
        }
    };

    // ============================================
    // SUCURSALES
    // ============================================

    const addBranch = async (name) => {
        try {
            const created = await monitorService.addBranch(name);
            if (created) {
                setData(prev => ({
                    ...prev,
                    branches: [...prev.branches, created]
                }));
                return created;
            }
            return null;
        } catch (err) {
            console.error('Error adding branch:', err);
            return null;
        }
    };

    const deleteBranch = async (id) => {
        try {
            const deleted = await monitorService.deleteBranch(id);
            if (deleted) {
                setData(prev => ({
                    ...prev,
                    branches: prev.branches.filter(b => b.id !== id)
                }));
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error deleting branch:', err);
            return false;
        }
    };

    // ============================================
    // TÉCNICOS
    // ============================================

    const addTechnician = async (name) => {
        try {
            const created = await monitorService.addTechnician(name);
            if (created) {
                setData(prev => ({
                    ...prev,
                    techs: [...prev.techs, created]
                }));
                return created;
            }
            return null;
        } catch (err) {
            console.error('Error adding technician:', err);
            return null;
        }
    };

    const deleteTechnician = async (id) => {
        try {
            const deleted = await monitorService.deleteTechnician(id);
            if (deleted) {
                setData(prev => ({
                    ...prev,
                    techs: prev.techs.filter(t => t.id !== id)
                }));
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error deleting technician:', err);
            return false;
        }
    };

    // ============================================
    // CATEGORÍAS
    // ============================================

    const addCategory = async (category) => {
        try {
            const created = await monitorService.addCategory(category);
            if (created) {
                setData(prev => ({
                    ...prev,
                    cats: [...prev.cats, created]
                }));
                return created;
            }
            return null;
        } catch (err) {
            console.error('Error adding category:', err);
            return null;
        }
    };

    const deleteCategory = async (id) => {
        try {
            const deleted = await monitorService.deleteCategory(id);
            if (deleted) {
                setData(prev => ({
                    ...prev,
                    cats: prev.cats.filter(c => c.id !== id)
                }));
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error deleting category:', err);
            return false;
        }
    };

    // ============================================
    // USUARIOS
    // ============================================

    const addUser = async (user) => {
        try {
            const created = await monitorService.addMonitorUser(user);
            if (created) {
                setData(prev => ({
                    ...prev,
                    users: [...prev.users, created]
                }));
                return created;
            }
            return null;
        } catch (err) {
            console.error('Error adding user:', err);
            return null;
        }
    };

    const updateUser = async (originalName, updatedUser) => {
        try {
            const updated = await monitorService.updateMonitorUser(originalName, updatedUser);
            if (updated) {
                setData(prev => ({
                    ...prev,
                    users: prev.users.map(u => u.name === originalName ? updated : u)
                }));
                return updated;
            }
            return null;
        } catch (err) {
            console.error('Error updating user:', err);
            return null;
        }
    };

    const deleteUser = async (name) => {
        try {
            const deleted = await monitorService.deleteMonitorUser(name);
            if (deleted) {
                setData(prev => ({
                    ...prev,
                    users: prev.users.filter(u => u.name !== name)
                }));
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error deleting user:', err);
            return false;
        }
    };

    return {
        data,
        loading,
        error,
        refresh: loadData,
        // Órdenes
        addOrder,
        deleteOrder,
        clearOrders,
        // Sucursales
        addBranch,
        deleteBranch,
        // Técnicos
        addTechnician,
        deleteTechnician,
        // Categorías
        addCategory,
        deleteCategory,
        // Usuarios
        addUser,
        updateUser,
        deleteUser
    };
};
