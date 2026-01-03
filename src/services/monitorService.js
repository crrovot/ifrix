// monitorService.js - Servicio para gestionar datos del monitor en Supabase
import { supabase } from './supabase';

// ============================================
// SUCURSALES (BRANCHES)
// ============================================

export const getBranches = async () => {
    const { data, error } = await supabase
        .from('monitor_branches')
        .select('*')
        .order('id', { ascending: true });
    
    if (error) {
        console.error('Error fetching branches:', error);
        return [];
    }
    return data || [];
};

export const addBranch = async (name) => {
    const { data, error } = await supabase
        .from('monitor_branches')
        .insert([{ name }])
        .select()
        .single();
    
    if (error) {
        console.error('Error adding branch:', error);
        return null;
    }
    return data;
};

export const deleteBranch = async (id) => {
    const { error } = await supabase
        .from('monitor_branches')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error('Error deleting branch:', error);
        return false;
    }
    return true;
};

// ============================================
// USUARIOS (USERS)
// ============================================

export const getMonitorUsers = async () => {
    const { data, error } = await supabase
        .from('monitor_users')
        .select('*')
        .order('name', { ascending: true });
    
    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }
    // Convertir de snake_case a camelCase
    return (data || []).map(user => ({
        id: user.id,
        name: user.name,
        pass: user.pass,
        role: user.role,
        branchId: user.branch_id
    }));
};

export const addMonitorUser = async (user) => {
    console.log('addMonitorUser - input:', user);
    
    const insertData = {
        name: user.name,
        pass: user.pass,
        role: user.role,
        branch_id: user.branchId
    };
    
    console.log('addMonitorUser - insertData:', insertData);
    
    const { data, error } = await supabase
        .from('monitor_users')
        .insert(insertData)
        .select()
        .single();
    
    if (error) {
        console.error('Error adding user - FULL ERROR:', error);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        return null;
    }
    
    console.log('User created successfully:', data);
    
    // Convertir de vuelta a camelCase
    return {
        id: data.id,
        name: data.name,
        pass: data.pass,
        role: data.role,
        branchId: data.branch_id
    };
};

export const updateMonitorUser = async (originalName, updatedUser) => {
    const { data, error } = await supabase
        .from('monitor_users')
        .update({
            name: updatedUser.name,
            pass: updatedUser.pass,
            role: updatedUser.role,
            branch_id: updatedUser.branchId
        })
        .eq('name', originalName)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating user:', error);
        return null;
    }
    // Convertir de vuelta a camelCase
    return {
        id: data.id,
        name: data.name,
        pass: data.pass,
        role: data.role,
        branchId: data.branch_id
    };
};

export const deleteMonitorUser = async (name) => {
    const { error } = await supabase
        .from('monitor_users')
        .delete()
        .eq('name', name);
    
    if (error) {
        console.error('Error deleting user:', error);
        return false;
    }
    return true;
};

export const findUserByPassword = async (password) => {
    const { data, error } = await supabase
        .from('monitor_users')
        .select('*')
        .eq('pass', password)
        .single();
    
    if (error) {
        return null;
    }
    // Convertir de snake_case a camelCase
    return {
        id: data.id,
        name: data.name,
        pass: data.pass,
        role: data.role,
        branchId: data.branch_id
    };
};

// ============================================
// CATEGORÍAS (CATEGORIES)
// ============================================

export const getCategories = async () => {
    const { data, error } = await supabase
        .from('monitor_categories')
        .select('*')
        .order('id', { ascending: true });
    
    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    // Convertir de snake_case a camelCase para el frontend
    return (data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        tOr: cat.t_or,
        tRe: cat.t_re,
        tCr: cat.t_cr
    }));
};

export const addCategory = async (category) => {
    const { data, error } = await supabase
        .from('monitor_categories')
        .insert([{
            name: category.name,
            t_or: category.tOr,
            t_re: category.tRe,
            t_cr: category.tCr
        }])
        .select()
        .single();
    
    if (error) {
        console.error('Error adding category:', error);
        return null;
    }
    // Convertir de vuelta a camelCase para el frontend
    return {
        id: data.id,
        name: data.name,
        tOr: data.t_or,
        tRe: data.t_re,
        tCr: data.t_cr
    };
};

export const deleteCategory = async (id) => {
    const { error } = await supabase
        .from('monitor_categories')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error('Error deleting category:', error);
        return false;
    }
    return true;
};

// ============================================
// TÉCNICOS (TECHNICIANS)
// ============================================

export const getTechnicians = async () => {
    const { data, error } = await supabase
        .from('monitor_technicians')
        .select('*')
        .order('id', { ascending: true });
    
    if (error) {
        console.error('Error fetching technicians:', error);
        return [];
    }
    return data || [];
};

export const addTechnician = async (name) => {
    const { data, error } = await supabase
        .from('monitor_technicians')
        .insert([{ name }])
        .select()
        .single();
    
    if (error) {
        console.error('Error adding technician:', error);
        return null;
    }
    return data;
};

export const deleteTechnician = async (id) => {
    const { error } = await supabase
        .from('monitor_technicians')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error('Error deleting technician:', error);
        return false;
    }
    return true;
};

// ============================================
// ÓRDENES (ORDERS)
// ============================================

export const getOrders = async () => {
    const { data, error } = await supabase
        .from('monitor_orders')
        .select('*')
        .order('start', { ascending: true });
    
    if (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
    // Convertir de snake_case a camelCase
    return (data || []).map(order => ({
        id: order.id,
        tech: order.tech,
        catId: order.cat_id,
        creator: order.creator,
        branchId: order.branch_id,
        start: order.start
    }));
};

export const addOrder = async (order) => {
    const { data, error } = await supabase
        .from('monitor_orders')
        .insert([{
            id: order.id,
            tech: order.tech,
            cat_id: order.catId,
            creator: order.creator,
            branch_id: order.branchId,
            start: order.start
        }])
        .select()
        .single();
    
    if (error) {
        console.error('Error adding order:', error);
        return null;
    }
    // Convertir de vuelta a camelCase
    return {
        id: data.id,
        tech: data.tech,
        catId: data.cat_id,
        creator: data.creator,
        branchId: data.branch_id,
        start: data.start
    };
};

export const deleteOrder = async (id) => {
    const { error } = await supabase
        .from('monitor_orders')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error('Error deleting order:', error);
        return false;
    }
    return true;
};

export const deleteOrdersByBranch = async (branchId) => {
    const { error } = await supabase
        .from('monitor_orders')
        .delete()
        .eq('branch_id', branchId);
    
    if (error) {
        console.error('Error deleting orders by branch:', error);
        return false;
    }
    return true;
};

export const deleteAllOrders = async () => {
    const { error } = await supabase
        .from('monitor_orders')
        .delete()
        .neq('id', 0); // Eliminar todos
    
    if (error) {
        console.error('Error deleting all orders:', error);
        return false;
    }
    return true;
};

// ============================================
// HISTORIAL/AUDITORÍA (HISTORY)
// ============================================

export const getHistory = async (limit = 50) => {
    const { data, error } = await supabase
        .from('monitor_history')
        .select('*')
        .order('deleted_at', { ascending: false })
        .limit(limit);
    
    if (error) {
        console.error('Error fetching history:', error);
        return [];
    }
    // Convertir de snake_case a camelCase
    return (data || []).map(entry => ({
        id: entry.order_id,
        tech: entry.tech,
        catId: entry.cat_id,
        creator: entry.creator,
        branchId: entry.branch_id,
        start: entry.start,
        deletedBy: entry.deleted_by,
        deletedAt: entry.deleted_at
    }));
};

export const addHistoryEntry = async (entry) => {
    const { data, error } = await supabase
        .from('monitor_history')
        .insert([{
            order_id: entry.order_id,
            tech: entry.tech,
            cat_id: entry.catId,
            creator: entry.creator,
            branch_id: entry.branchId,
            start: entry.start,
            deleted_by: entry.deletedBy,
            deleted_at: entry.deletedAt
        }])
        .select()
        .single();
    
    if (error) {
        console.error('Error adding history entry:', error);
        return null;
    }
    // Convertir de vuelta a camelCase
    return {
        id: data.order_id,
        tech: data.tech,
        catId: data.cat_id,
        creator: data.creator,
        branchId: data.branch_id,
        start: data.start,
        deletedBy: data.deleted_by,
        deletedAt: data.deleted_at
    };
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Inicializar datos por defecto si no existen
export const initializeDefaultData = async () => {
    // Verificar si hay sucursales
    const branches = await getBranches();
    if (branches.length === 0) {
        await addBranch('Huérfanos');
        await addBranch('Mojitas');
        await addBranch('Apumanque');
    }

    // Verificar si hay categorías
    const categories = await getCategories();
    if (categories.length === 0) {
        await addCategory({
            name: 'General',
            tOr: 2,
            tRe: 5,
            tCr: 10
        });
    }

    // Verificar si hay técnicos
    const technicians = await getTechnicians();
    if (technicians.length === 0) {
        await addTechnician('fulanito');
    }

    // Verificar si hay usuario admin por defecto
    const users = await getMonitorUsers();
    if (users.length === 0) {
        await addMonitorUser({
            name: 'admin',
            pass: '1234',
            role: 'admin',
            branchId: 1
        });
    }
};

// Migrar datos desde localStorage a Supabase
export const migrateFromLocalStorage = async () => {
    const DB_KEY = 'monitor_v11_0_user_edit';
    const stored = localStorage.getItem(DB_KEY);
    
    if (!stored) {
        console.log('No hay datos en localStorage para migrar');
        return false;
    }

    try {
        const localData = JSON.parse(stored);
        
        // Migrar sucursales
        if (localData.branches && localData.branches.length > 0) {
            for (const branch of localData.branches) {
                await addBranch(branch.name);
            }
        }

        // Migrar usuarios
        if (localData.users && localData.users.length > 0) {
            for (const user of localData.users) {
                await addMonitorUser(user);
            }
        }

        // Migrar categorías
        if (localData.cats && localData.cats.length > 0) {
            for (const cat of localData.cats) {
                await addCategory({
                    name: cat.name,
                    tOr: cat.tOr,
                    tRe: cat.tRe,
                    tCr: cat.tCr
                });
            }
        }

        // Migrar técnicos
        if (localData.techs && localData.techs.length > 0) {
            for (const tech of localData.techs) {
                await addTechnician(tech.name);
            }
        }

        // Migrar órdenes activas
        if (localData.orders && localData.orders.length > 0) {
            for (const order of localData.orders) {
                await addOrder(order);
            }
        }

        // Migrar historial
        if (localData.history && localData.history.length > 0) {
            for (const entry of localData.history) {
                await addHistoryEntry(entry);
            }
        }

        console.log('Migración completada exitosamente');
        return true;
    } catch (error) {
        console.error('Error durante la migración:', error);
        return false;
    }
};
