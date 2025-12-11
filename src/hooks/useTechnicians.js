import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';

export const useTechnicians = () => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchTechnicians = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('technicians')
                .select('*')
                .order('name');

            if (error) throw error;

            // Mapear snake_case a camelCase
            const mappedTechs = data.map(t => ({
                id: t.id,
                name: t.name,
                defaultCommissionRate: parseFloat(t.default_commission_rate),
                active: t.active,
                createdAt: t.created_at
            }));

            setTechnicians(mappedTechs);
        } catch (error) {
            console.error('Error fetching technicians:', error);
            toast.error('Error al cargar técnicos.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTechnicians();
    }, [fetchTechnicians]);

    const activeTechnicians = technicians.filter(t => t.active !== false);

    const addTechnician = useCallback(async (name, rate) => {
        if (!name.trim()) {
            toast.error('Nombre requerido.');
            return false;
        }

        // Check duplicates locally
        const exists = technicians.find(t => t.name.toLowerCase() === name.trim().toLowerCase() && t.active);
        if (exists) {
            toast.error('Ya existe un técnico con ese nombre.');
            return false;
        }

        const newTech = {
            name: name.trim(),
            default_commission_rate: parseFloat(rate) / 100 || 0.10,
            active: true
        };

        try {
            const { error } = await supabase
                .from('technicians')
                .insert([newTech]);

            if (error) throw error;

            toast.success('Técnico agregado.');
            fetchTechnicians();
            return true;
        } catch (error) {
            console.error('Error adding technician:', error);
            toast.error('Error al guardar técnico.');
            return false;
        }
    }, [technicians, fetchTechnicians]);

    const deleteTechnician = useCallback(async (id) => {
        try {
            // Soft delete
            const { error } = await supabase
                .from('technicians')
                .update({ active: false })
                .eq('id', id);

            if (error) throw error;

            toast.success('Técnico desactivado.');
            fetchTechnicians();
        } catch (error) {
            console.error('Error deleting technician:', error);
            toast.error('Error al desactivar técnico.');
        }
    }, [fetchTechnicians]);

    const getTechnicianById = useCallback((id) => {
        return technicians.find(t => t.id === id);
    }, [technicians]);

    return {
        technicians,
        activeTechnicians,
        addTechnician,
        deleteTechnician,
        getTechnicianById,
        loading
    };
};
