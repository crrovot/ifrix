// Hook personalizado para gestión de técnicos

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';

export const useTechnicians = () => {
    const [technicians, setTechnicians] = useState(() => 
        loadFromLocalStorage(STORAGE_KEYS.TECHNICIANS)
    );

    // Cargar datos al montar
    useEffect(() => {
        setTechnicians(loadFromLocalStorage(STORAGE_KEYS.TECHNICIANS));
    }, []);

    // Obtener técnicos activos
    const activeTechnicians = technicians.filter(t => t.active !== false);

    // Agregar técnico
    const addTechnician = useCallback((name, rate) => {
        if (!name.trim()) {
            toast.error('El nombre del técnico es requerido.');
            return false;
        }
        
        // Verificar duplicados
        const existingTech = technicians.find(
            t => t.name.toLowerCase() === name.trim().toLowerCase() && t.active !== false
        );
        if (existingTech) {
            toast.error(`Ya existe un técnico con el nombre "${name}".`);
            return false;
        }

        const newTechnician = { 
            id: uuidv4(), 
            name: name.trim(), 
            defaultCommissionRate: parseFloat(rate) / 100 || 0.10,
            active: true,
            createdAt: new Date().toISOString()
        };
        
        const updatedTechnicians = [...technicians, newTechnician];
        setTechnicians(updatedTechnicians);
        saveToLocalStorage(STORAGE_KEYS.TECHNICIANS, updatedTechnicians);
        toast.success(`Técnico "${name}" agregado exitosamente.`);
        return true;
    }, [technicians]);

    // Desactivar técnico (soft delete)
    const deleteTechnician = useCallback((id) => {
        const tech = technicians.find(t => t.id === id);
        const updatedTechnicians = technicians.map(t => 
            t.id === id ? { ...t, active: false } : t
        );
        setTechnicians(updatedTechnicians);
        saveToLocalStorage(STORAGE_KEYS.TECHNICIANS, updatedTechnicians);
        toast.success(`Técnico "${tech?.name}" desactivado.`);
    }, [technicians]);

    // Buscar técnico por ID
    const getTechnicianById = useCallback((id) => {
        return technicians.find(t => t.id === id);
    }, [technicians]);

    return {
        technicians,
        activeTechnicians,
        addTechnician,
        deleteTechnician,
        getTechnicianById,
    };
};
