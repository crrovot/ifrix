// Página principal de reportes

import React from 'react';
import { BookOpenIcon, PrinterIcon } from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import { printTechnicianReport, printGeneralReport } from '../../utils/print';
import { ReportFilters } from './ReportFilters';
import { ReportSummary } from './ReportSummary';
import { TechnicianCard } from './TechnicianCard';

export const ReportsPage = ({ orders, technicians }) => {
    const {
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
    } = useReports(orders, technicians);

    const handlePrintTechnician = (techName, details) => {
        printTechnicianReport(techName, details, reportDateRange);
    };

    const handlePrintAll = () => {
        printGeneralReport(groupedReports, reportDateRange, totals.totalCommission);
    };

    const hasResults = Object.keys(groupedReports).length > 0;

    return (
        <div className="space-y-3 xs:space-y-4">
            <h2 className="text-xs xs:text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-1.5 xs:gap-2">
                <BookOpenIcon className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-cyan-600 flex-shrink-0" />
                <span>Reportes de Comisiones</span>
            </h2>

            {/* Filtros */}
            <ReportFilters 
                technicians={technicians}
                selectedTechnicianId={selectedTechnicianId}
                dateRange={reportDateRange}
                isFetching={isFetchingReport}
                onTechnicianChange={setSelectedTechnicianId}
                onDateChange={updateDateRange}
                onGenerate={fetchReport}
            />

            {/* Resumen */}
            <ReportSummary totals={totals} />

            {/* Botón Imprimir Todo */}
            {hasResults && (
                <div className="flex justify-end">
                    <button
                        onClick={handlePrintAll}
                        className="bg-gray-800 hover:bg-black active:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg text-xs sm:text-sm transition-all flex items-center min-h-[44px] active:scale-[0.98]"
                    >
                        <PrinterIcon className="w-4 h-4 mr-1.5" />
                        <span className="hidden sm:inline">Imprimir Reporte Completo</span>
                        <span className="sm:hidden">Imprimir Todo</span>
                    </button>
                </div>
            )}

            {/* Cards de técnicos */}
            <div className="space-y-3">
                {Object.entries(groupedReports).map(([techName, report]) => (
                    <TechnicianCard 
                        key={techName}
                        techName={techName}
                        report={report}
                        isExpanded={expandedTech === techName}
                        onToggle={() => toggleExpandedTech(techName)}
                        onPrint={() => handlePrintTechnician(techName, report.details)}
                    />
                ))}
            </div>

            {/* Estado vacío */}
            {!hasResults && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <BookOpenIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Sin resultados</p>
                    <p className="text-gray-400 text-xs mt-1">
                        Ajusta los filtros y presiona "Generar"
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
