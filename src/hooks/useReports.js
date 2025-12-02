// Hook personalizado para reportes

import { useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getFirstDayOfMonthISO, getTodayISO } from '../utils/formatters';

export const useReports = (orders, technicians) => {
    const [reportResults, setReportResults] = useState([]);
    const [isFetchingReport, setIsFetchingReport] = useState(false);
    const [expandedTech, setExpandedTech] = useState(null);
    
    const [reportDateRange, setReportDateRange] = useState({
        start: getFirstDayOfMonthISO(),
        end: getTodayISO(),
    });
    const [selectedTechnicianId, setSelectedTechnicianId] = useState('all');

    // Generar reporte
    const fetchReport = useCallback(() => {
        setIsFetchingReport(true);
        try {
            let filteredOrders = [...orders];

            // Filtrar por técnico
            if (selectedTechnicianId !== 'all') {
                filteredOrders = filteredOrders.filter(
                    order => order.technicianId === selectedTechnicianId
                );
            }

            // Filtrar por rango de fechas
            filteredOrders = filteredOrders.filter(order => {
                const orderDate = new Date(order.date);
                const startDate = new Date(reportDateRange.start);
                const endDate = new Date(reportDateRange.end);
                return orderDate >= startDate && orderDate <= endDate;
            });

            setReportResults(filteredOrders);
            setExpandedTech(null);
        } catch (e) {
            console.error("Error fetching report:", e);
            toast.error('Error al generar el reporte.');
        } finally {
            setIsFetchingReport(false);
        }
    }, [orders, selectedTechnicianId, reportDateRange]);

    // Agrupar reportes por técnico
    const groupedReports = useMemo(() => {
        return reportResults.reduce((acc, order) => {
            // Primero intentar usar el nombre guardado en la orden, luego buscar en técnicos
            const tech = technicians.find(t => t.id === order.technicianId);
            const techName = order.technicianName || tech?.name || 'Desconocido';

            if (!acc[techName]) {
                acc[techName] = {
                    techId: order.technicianId,
                    totalCommission: 0,
                    totalOrders: 0,
                    totalBruto: 0,
                    details: [],
                };
            }

            acc[techName].totalCommission += order.commissionValue || 0;
            acc[techName].totalBruto += order.rawCost || 0;
            acc[techName].totalOrders += 1;
            acc[techName].details.push(order);

            return acc;
        }, {});
    }, [reportResults, technicians]);

    // Totales generales
    const totals = useMemo(() => {
        const reports = Object.values(groupedReports);
        return {
            totalCommission: reports.reduce((sum, r) => sum + r.totalCommission, 0),
            totalBruto: reports.reduce((sum, r) => sum + r.totalBruto, 0),
            totalOrders: reports.reduce((sum, r) => sum + r.totalOrders, 0),
            totalTechnicians: Object.keys(groupedReports).length,
        };
    }, [groupedReports]);

    // Toggle expandir técnico
    const toggleExpandedTech = useCallback((techName) => {
        setExpandedTech(prev => prev === techName ? null : techName);
    }, []);

    // Actualizar rango de fechas
    const updateDateRange = useCallback((field, value) => {
        setReportDateRange(prev => ({ ...prev, [field]: value }));
    }, []);

    return {
        reportResults,
        isFetchingReport,
        expandedTech,
        reportDateRange,
        selectedTechnicianId,
        groupedReports,
        totals,
        fetchReport,
        toggleExpandedTech,
        setSelectedTechnicianId,
        updateDateRange,
    };
};
