// Utilidades para manejo de localStorage

/**
 * Carga datos desde localStorage
 * @param {string} key - Clave del localStorage
 * @returns {Array} - Datos parseados o array vacío
 */
export const loadFromLocalStorage = (key) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error(`Error loading from localStorage (${key}):`, error);
        return [];
    }
};

/**
 * Guarda datos en localStorage
 * @param {string} key - Clave del localStorage
 * @param {any} data - Datos a guardar
 */
export const saveToLocalStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving to localStorage (${key}):`, error);
    }
};

/**
 * Elimina datos de localStorage
 * @param {string} key - Clave del localStorage
 */
export const removeFromLocalStorage = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing from localStorage (${key}):`, error);
    }
};
