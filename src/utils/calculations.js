// Utilidades para cálculos de comisiones

import { IVA_PERCENTAGE } from '../constants';

/**
 * Calcula la comisión basándose en la lógica proporcionada.
 * Fórmula: ((Costo Bruto / (1 + IVA)) - Costo Repuestos) * % Comisión
 * @param {number} rawCost - Costo bruto
 * @param {number} materialsCost - Costo de materiales/repuestos
 * @param {number} commissionRate - Tasa de comisión (decimal, ej: 0.10 para 10%)
 * @returns {number} - Valor de la comisión redondeado
 */
export const calculateCommission = (rawCost, materialsCost, commissionRate) => {
    const netCost = rawCost / (1 + IVA_PERCENTAGE);
    const commissionableBase = Math.max(0, netCost - materialsCost);
    const commissionValue = commissionableBase * commissionRate;
    return Math.round(commissionValue);
};

/**
 * Calcula el costo neto (sin IVA)
 * @param {number} rawCost - Costo bruto
 * @returns {number} - Costo neto
 */
export const calculateNetCost = (rawCost) => {
    return rawCost / (1 + IVA_PERCENTAGE);
};

/**
 * Calcula el valor del IVA
 * @param {number} rawCost - Costo bruto
 * @returns {number} - Valor del IVA
 */
export const calculateIvaValue = (rawCost) => {
    const netCost = calculateNetCost(rawCost);
    return rawCost - netCost;
};

/**
 * Calcula la base comisionable
 * @param {number} rawCost - Costo bruto
 * @param {number} materialsCost - Costo de materiales
 * @returns {number} - Base comisionable
 */
export const calculateCommissionableBase = (rawCost, materialsCost) => {
    const netCost = calculateNetCost(rawCost);
    return Math.max(0, netCost - materialsCost);
};

/**
 * Calcula todos los valores derivados de una orden
 * @param {number} rawCost - Costo bruto
 * @param {number} materialsCost - Costo de materiales
 * @param {number} commissionRate - Tasa de comisión
 * @returns {Object} - Objeto con todos los valores calculados
 */
export const calculateOrderValues = (rawCost, materialsCost, commissionRate) => {
    const netCost = calculateNetCost(rawCost);
    const ivaValue = rawCost - netCost;
    const commissionableBase = Math.max(0, netCost - materialsCost);
    const commissionValue = calculateCommission(rawCost, materialsCost, commissionRate);

    return {
        netCost,
        ivaValue,
        commissionableBase,
        commissionValue,
    };
};
