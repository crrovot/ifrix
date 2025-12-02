// Utilidades para formateo de datos

/**
 * Formatea un número como moneda chilena
 * @param {number} value - Valor a formatear
 * @returns {string} - Valor formateado
 */
export const formatCurrency = (value) => {
    return `$${(value || 0).toLocaleString('es-CL')}`;
};

/**
 * Formatea un número como moneda chilena sin decimales
 * @param {number} value - Valor a formatear
 * @returns {string} - Valor formateado
 */
export const formatCurrencyNoDecimals = (value) => {
    return `$${Math.round(value || 0).toLocaleString('es-CL')}`;
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor decimal (ej: 0.10 para 10%)
 * @returns {string} - Porcentaje formateado
 */
export const formatPercentage = (value) => {
    return `${((value || 0) * 100).toFixed(0)}%`;
};

/**
 * Formatea una fecha
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CL');
};

/**
 * Formatea fecha y hora
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha y hora formateadas
 */
export const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('es-CL');
};

/**
 * Obtiene la fecha de hoy en formato ISO (YYYY-MM-DD)
 * @returns {string} - Fecha de hoy
 */
export const getTodayISO = () => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Obtiene el primer día del mes actual en formato ISO
 * @returns {string} - Primer día del mes
 */
export const getFirstDayOfMonthISO = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};
