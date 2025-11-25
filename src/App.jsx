import React, { useState, useEffect, useMemo } from 'react';
import { PrinterIcon, PlusIcon, XIcon, PencilIcon, TrashIcon, CalculatorIcon, UsersIcon, BookOpenIcon, MegaphoneIcon } from 'lucide-react';

// Simulación de almacenamiento local
const loadFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Constantes
const IVA_PERCENTAGE = 0.19; // 19% de IVA

// --- FUNCIONES DE UTILIDAD ---

/**
 * Calcula la comisión basándose en la lógica proporcionada.
 * Fórmula: ((Costo Bruto / (1 + IVA)) - Costo Repuestos) * % Comisión
 */
const calculateCommission = (rawCost, materialsCost, commissionRate) => {
    const netCost = rawCost / (1 + IVA_PERCENTAGE);
    const commissionableBase = Math.max(0, netCost - materialsCost);
    const commissionValue = commissionableBase * commissionRate;
    return Math.round(commissionValue);
};

// --- COMPONENTE PRINCIPAL ---

const App = () => {
    // Estado de Datos de la Aplicación
    const [technicians, setTechnicians] = useState(() => loadFromLocalStorage('technicians'));
    const [orders, setOrders] = useState(() => loadFromLocalStorage('orders'));
    const [activeTab, setActiveTab] = useState('orders');
    const [message, setMessage] = useState('');

    // Estado del Formulario
    const initialOrderState = {
        workOrderNumber: '',
        clientName: '',
        rawCost: 0,
        materialsCost: 0,
        commissionRate: 0.10,
        technicianId: '',
        date: new Date().toISOString().split('T')[0],
    };
    const [newOrder, setNewOrder] = useState(initialOrderState);

    // Estado de Reportes
    const [reportDateRange, setReportDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });
    const [selectedTechnicianId, setSelectedTechnicianId] = useState('all');

    // --- CARGA DE DATOS DEL ALMACENAMIENTO LOCAL ---

    useEffect(() => {
        setTechnicians(loadFromLocalStorage('technicians'));
        setOrders(loadFromLocalStorage('orders'));
    }, []);

    // --- MANEJO DE ESTADO DE FORMULARIO ---

    const handleOrderChange = (e) => {
        const { name, value } = e.target;
        if (name === 'rawCost' || name === 'materialsCost') {
            const numValue = parseFloat(value) || 0;
            setNewOrder(prev => ({ ...prev, [name]: numValue }));
        } else if (name === 'commissionRate') {
            const numValue = parseFloat(value) || 0;
            setNewOrder(prev => ({ ...prev, [name]: numValue / 100 }));
        }
        else {
            setNewOrder(prev => ({ ...prev, [name]: value }));
        }
    };

    // Calcular valores derivados automáticamente
    const calculatedValues = useMemo(() => {
        const { rawCost, materialsCost, commissionRate } = newOrder;
        const netCost = rawCost / (1 + IVA_PERCENTAGE);
        const ivaValue = rawCost - netCost;
        const commissionableBase = Math.max(0, netCost - materialsCost);
        const commissionValue = calculateCommission(rawCost, materialsCost, commissionRate);

        return {
            netCost: netCost,
            ivaValue: ivaValue,
            commissionableBase: commissionableBase,
            commissionValue: commissionValue,
        };
    }, [newOrder.rawCost, newOrder.materialsCost, newOrder.commissionRate]);

    // --- MANEJO DE ENVÍO DE ORDEN ---

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        if (!newOrder.technicianId) {
             setMessage({ type: 'error', text: 'Debe seleccionar un técnico.' });
            return;
        }

        const orderToSave = {
            ...newOrder,
            workOrderNumber: newOrder.workOrderNumber.trim(),
            rawCost: newOrder.rawCost,
            materialsCost: newOrder.materialsCost,
            commissionRate: newOrder.commissionRate,
            commissionValue: calculatedValues.commissionValue,
            timestamp: new Date(),
        };

        const updatedOrders = [...orders, orderToSave];
        setOrders(updatedOrders);
        saveToLocalStorage('orders', updatedOrders);

        setMessage({ type: 'success', text: `¡Orden N° ${orderToSave.workOrderNumber} agregada exitosamente!` });
        setNewOrder(initialOrderState);
        setNewOrder(prev => ({
            ...prev,
            technicianId: newOrder.technicianId,
            commissionRate: newOrder.commissionRate,
        }));
    };

    // --- MANEJO DE TÉCNICOS ---

    const handleAddTechnician = (name, rate) => {
        const newTechnician = { id: Date.now(), name, rate };
        const updatedTechnicians = [...technicians, newTechnician];
        setTechnicians(updatedTechnicians);
        saveToLocalStorage('technicians', updatedTechnicians);
      };

    const handleDeleteTechnician = (id) => {
        const updatedTechnicians = technicians.filter((tech) => tech.id !== id);
        setTechnicians(updatedTechnicians);
        saveToLocalStorage('technicians', updatedTechnicians);
      };

    // --- COMPONENTE DE GESTIÓN DE TÉCNICOS ---

    const TechnicianManager = () => {
        const [techName, setTechName] = useState('');
        const [techRate, setTechRate] = useState(10);

        const activeTechnicians = technicians.filter(t => t.active !== false);

        return (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-indigo-800 flex items-center gap-2">
                    <UsersIcon className="w-5 h-5" />
                    Gestión de Técnicos
                </h2>

                <div className="p-6 bg-gradient-to-br from-white to-purple-50 shadow-lg rounded-xl border border-indigo-200">
                    <h3 className="text-lg font-bold text-indigo-800 mb-4">Añadir Nuevo Técnico</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Nombre del Técnico"
                            value={techName}
                            onChange={(e) => setTechName(e.target.value)}
                            className="p-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-600 col-span-1 md:col-span-2 font-medium transition-all duration-200"
                        />
                        <div className="flex items-center">
                            <input
                                type="number"
                                placeholder="% Comisión (ej: 10)"
                                value={techRate}
                                onChange={(e) => setTechRate(e.target.value)}
                                min="0"
                                max="100"
                                className="p-3 border-2 border-gray-300 rounded-l-xl w-2/3 focus:ring-4 focus:ring-indigo-300 focus:border-indigo-600 font-medium transition-all duration-200"
                            />
                            <span className="p-3 bg-gradient-to-r from-gray-200 to-gray-300 border-2 border-l-0 border-gray-300 rounded-r-xl w-1/3 text-center font-bold text-gray-700">%</span>
                        </div>
                        <button
                            onClick={() => handleAddTechnician(techName, techRate)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center col-span-full md:col-span-1 shadow-md"
                            disabled={!techName.trim()}
                        >
                            <PlusIcon className="w-4 h-4 mr-1" />
                            Agregar
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-indigo-100 to-purple-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-800 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-800 uppercase tracking-wider">Comisión Base</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-indigo-800 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {activeTechnicians.map((tech) => (
                                <tr key={tech.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{tech.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-purple-600">
                                        {(tech.defaultCommissionRate * 100).toFixed(0)}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDeleteTechnician(tech.id, tech.name)}
                                            className="text-red-600 hover:text-white hover:bg-red-600 ml-4 p-2 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-md"
                                            title="Desactivar Técnico"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {activeTechnicians.length === 0 && (
                        <p className="p-6 text-center text-gray-500">No hay técnicos activos. Por favor, agregue uno.</p>
                    )}
                </div>
            </div>
        );
    };

    // --- COMPONENTE DE REPORTES ---

    const CommissionReports = () => {
        const [reportResults, setReportResults] = useState([]);
        const [isFetchingReport, setIsFetchingReport] = useState(false);

        const fetchReport = () => {
            setIsFetchingReport(true);
            try {
                let filteredOrders = [...orders];

                if (selectedTechnicianId !== 'all') {
                    filteredOrders = filteredOrders.filter(order => order.technicianId === selectedTechnicianId);
                }

                filteredOrders = filteredOrders.filter(order => {
                    const orderDate = new Date(order.date);
                    const startDate = new Date(reportDateRange.start);
                    const endDate = new Date(reportDateRange.end);
                    return orderDate >= startDate && orderDate <= endDate;
                });

                setReportResults(filteredOrders);

            } catch (e) {
                console.error("Error fetching report:", e);
                setMessage({ type: 'error', text: 'Error al generar el reporte.' });
            } finally {
                setIsFetchingReport(false);
            }
        };

        const groupedReports = useMemo(() => {
            return reportResults.reduce((acc, order) => {
                const tech = technicians.find(t => t.id === order.technicianId) || { name: 'Desconocido' };
                const techName = tech.name;

                if (!acc[techName]) {
                    acc[techName] = {
                        totalCommission: 0,
                        totalOrders: 0,
                        details: [],
                    };
                }

                acc[techName].totalCommission += order.commissionValue || 0;
                acc[techName].totalOrders += 1;
                acc[techName].details.push(order);

                return acc;
            }, {});
        }, [reportResults, technicians]);

        const handlePrint = (techName, details) => {
            const printWindow = window.open('', '_blank');
            printWindow.document.write('<html><head><title>Reporte de Comisión - ' + techName + '</title>');
            printWindow.document.write('<style>');
            printWindow.document.write('body { font-family: sans-serif; padding: 20px; }');
            printWindow.document.write('h1 { text-align: center; color: #312e81; border-bottom: 2px solid #e0e7ff; padding-bottom: 10px; }');
            printWindow.document.write('h2 { color: #4338ca; margin-top: 20px; }');
            printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 15px; }');
            printWindow.document.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }');
            printWindow.document.write('th { background-color: #f3f4f6; }');
            printWindow.document.write('.summary { margin-top: 20px; font-size: 14px; font-weight: bold; background-color: #eef2ff; padding: 10px; border-radius: 8px; }');
            printWindow.document.write('</style></head><body>');

            printWindow.document.write(`<h1>Reporte de Comisiones para ${techName}</h1>`);
            printWindow.document.write(`<p>Periodo: ${reportDateRange.start} al ${reportDateRange.end}</p>`);

            printWindow.document.write('<h2>Detalle de Órdenes</h2>');
            printWindow.document.write('<table>');
            printWindow.document.write('<thead><tr><th>Fecha</th><th>N° Orden</th><th>Cliente</th><th>Costo Bruto</th><th>Neto (sin IVA)</th><th>Costo Repuestos</th><th>Base Comisionable</th><th>% Comisión</th><th>Valor Comisión</th></tr></thead>');
            printWindow.document.write('<tbody>');

            let totalCommission = 0;
            details.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(order => {
                const netCost = order.rawCost / (1 + IVA_PERCENTAGE);
                const commissionableBase = Math.max(0, netCost - order.materialsCost);

                totalCommission += order.commissionValue;

                printWindow.document.write('<tr>');
                printWindow.document.write(`<td>${order.date}</td>`);
                printWindow.document.write(`<td>${order.workOrderNumber}</td>`);
                printWindow.document.write(`<td>${order.clientName}</td>`);
                printWindow.document.write(`<td>$${order.rawCost.toFixed(0)}</td>`);
                printWindow.document.write(`<td>$${netCost.toFixed(0)}</td>`);
                printWindow.document.write(`<td>$${order.materialsCost.toFixed(0)}</td>`);
                printWindow.document.write(`<td>$${commissionableBase.toFixed(0)}</td>`);
                printWindow.document.write(`<td>${(order.commissionRate * 100).toFixed(0)}%</td>`);
                printWindow.document.write(`<td>$${order.commissionValue.toFixed(0)}</td>`);
                printWindow.document.write('</tr>');
            });

            printWindow.document.write('</tbody>');
            printWindow.document.write('</table>');

            printWindow.document.write('<div class="summary">');
            printWindow.document.write(`<p>Total Comisionado para ${techName}: **$${totalCommission.toFixed(0)}**</p>`);
            printWindow.document.write(`<p>Total Órdenes: ${details.length}</p>`);
            printWindow.document.write('</div>');

            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        };

        const totalCommissioned = Object.values(groupedReports).reduce((sum, report) => sum + report.totalCommission, 0);

        return (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-indigo-800 flex items-center gap-2">
                    <BookOpenIcon className="w-5 h-5" />
                    Reporte de Comisiones
                </h2>

                <div className="p-6 bg-gradient-to-br from-white to-green-50 shadow-lg rounded-xl border border-indigo-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Técnico:</label>
                        <select
                            value={selectedTechnicianId}
                            onChange={(e) => setSelectedTechnicianId(e.target.value)}
                            className="p-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-600 font-medium bg-white transition-all duration-200"
                        >
                            <option value="all">Todos los Técnicos</option>
                            {technicians.filter(t => t.active !== false).map(tech => (
                                <option key={tech.id} value={tech.id}>{tech.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Fecha Inicio:</label>
                        <input
                            type="date"
                            value={reportDateRange.start}
                            onChange={(e) => setReportDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="p-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-600 font-medium transition-all duration-200"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Fecha Fin:</label>
                        <input
                            type="date"
                            value={reportDateRange.end}
                            onChange={(e) => setReportDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="p-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-600 font-medium transition-all duration-200"
                        />
                    </div>
                     <button
                        onClick={fetchReport}
                        disabled={isFetchingReport}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 shadow-md"
                    >
                        {isFetchingReport ? 'Cargando...' : <><CalculatorIcon className="w-4 h-4 mr-2" /> Generar Reporte</>}
                    </button>
                </div>

                {isFetchingReport ? (
                    <div className="text-center p-8 text-gray-500">Cargando datos...</div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-5 bg-gradient-to-br from-green-100 via-emerald-100 to-green-50 border-2 border-green-300 rounded-xl text-center shadow-lg">
                            <h3 className="text-xl font-bold text-green-800">Total Comisionado en el Período: ${totalCommissioned.toLocaleString('es-CL')}</h3>
                        </div>

                        {Object.entries(groupedReports).map(([techName, report]) => (
                            <div key={techName} className="bg-gradient-to-br from-white to-indigo-50 shadow-lg rounded-xl p-6 border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-200">
                                <div className="flex justify-between items-center border-b border-indigo-200 pb-3 mb-3">
                                    <h3 className="text-lg font-bold text-gray-800">Técnico: {techName}</h3>
                                    <button
                                        onClick={() => handlePrint(techName, report.details)}
                                        className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center text-sm font-semibold shadow-md"
                                    >
                                        <PrinterIcon className="w-4 h-4 mr-1.5" />
                                        Imprimir Detalle
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <p className="text-base text-indigo-700 font-semibold">Comisión Total: <span className="text-gray-900 text-lg font-bold">${report.totalCommission.toLocaleString('es-CL')}</span></p>
                                    <p className="text-base text-indigo-700 font-semibold">Órdenes Realizadas: <span className="text-gray-900 text-lg font-bold">{report.totalOrders}</span></p>
                                </div>
                            </div>
                        ))}
                         {Object.keys(groupedReports).length === 0 && (
                            <p className="p-6 text-center text-gray-500">No se encontraron órdenes en el período y filtro seleccionados.</p>
                        )}
                    </div>
                )}
            </div>
        );
    };


    // --- RENDERING DE LA INTERFAZ ---

    const Notification = ({ msg }) => {
        if (!msg || !msg.text) return null;
        const baseClass = "p-3 rounded-lg flex items-center shadow-lg mb-4 transition-all duration-300 border";
        const colorClass = msg.type === 'success'
            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300'
            : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300';

        return (
            <div className={`${baseClass} ${colorClass}`}>
                <MegaphoneIcon className="w-5 h-5 mr-2" />
                <span className="flex-grow font-semibold">{msg.text}</span>
                <button onClick={() => setMessage(null)} className="ml-4 text-gray-700 hover:text-gray-900 hover:bg-white/50 p-1.5 rounded-full transition-all">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
        );
    };

    const NavButton = ({ tab, icon, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
                ${activeTab === tab
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border border-indigo-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 hover:text-indigo-700 border border-transparent'
                }`}
        >
            {icon}
            <span className="hidden sm:inline ml-1.5">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans">
            <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-xl py-4 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <CalculatorIcon className="w-6 h-6" />
                        Gestor de Comisiones
                    </h1>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="flex gap-2 bg-white p-1.5 rounded-t-xl shadow-lg border-b-2 border-indigo-200">
                    <NavButton tab="orders" label="Ingreso de Órdenes" icon={<PencilIcon className="w-4 h-4" />} />
                    <NavButton tab="technicians" label="Gestión de Técnicos" icon={<UsersIcon className="w-4 h-4" />} />
                    <NavButton tab="reports" label="Reportes" icon={<BookOpenIcon className="w-4 h-4" />} />
                </div>

                <div className="p-6 bg-white shadow-xl rounded-b-xl border-x-2 border-b-2 border-indigo-100">
                    <Notification msg={message} />

                    {activeTab === 'orders' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 p-6 bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-lg border border-indigo-200">
                                <h2 className="text-xl font-bold text-indigo-800 mb-4 flex items-center gap-2">
                                    <PencilIcon className="w-5 h-5" />
                                    Ingreso de Nueva Orden
                                </h2>
                                <form onSubmit={handleSubmitOrder} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Técnico Asignado</label>
                                            <select
                                                name="technicianId"
                                                value={newOrder.technicianId}
                                                onChange={handleOrderChange}
                                                required
                                                className="mt-1 block w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-600 transition-all duration-200 font-medium bg-white"
                                            >
                                                <option value="" disabled>Seleccione un técnico</option>
                                                {technicians.filter(t => t.active !== false).map(tech => (
                                                    <option key={tech.id} value={tech.id}>{tech.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">N° Orden de Trabajo</label>
                                            <input
                                                type="text"
                                                name="workOrderNumber"
                                                value={newOrder.workOrderNumber}
                                                onChange={handleOrderChange}
                                                required
                                                className="mt-1 block w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-600 transition-all duration-200 font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
                                        <input
                                            type="text"
                                            name="clientName"
                                            value={newOrder.clientName}
                                            onChange={handleOrderChange}
                                            required
                                            className="mt-1 block w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-600 transition-all duration-200 font-medium"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Costo Bruto Cobrado ($)</label>
                                            <input
                                                type="number"
                                                name="rawCost"
                                                value={newOrder.rawCost || ''}
                                                onChange={handleOrderChange}
                                                min="0"
                                                required
                                                className="mt-1 block w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-600 transition-all duration-200 font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Costo Repuestos/Insumos ($)</label>
                                            <input
                                                type="number"
                                                name="materialsCost"
                                                value={newOrder.materialsCost || ''}
                                                onChange={handleOrderChange}
                                                min="0"
                                                required
                                                className="mt-1 block w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-600 transition-all duration-200 font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">% Comisión Aplicado</label>
                                            <div className="flex mt-1">
                                                <input
                                                    type="number"
                                                    name="commissionRate"
                                                    value={newOrder.commissionRate * 100 || ''}
                                                    onChange={handleOrderChange}
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    required
                                                    className="block w-2/3 p-3 border-2 border-r-0 border-gray-300 rounded-l-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-600 transition-all duration-200 font-medium"
                                                />
                                                <span className="block w-1/3 p-3 bg-gradient-to-r from-gray-200 to-gray-300 border-2 border-gray-300 rounded-r-xl text-center font-bold text-gray-700">%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!newOrder.workOrderNumber || !newOrder.technicianId || newOrder.rawCost <= 0}
                                        >
                                            <PlusIcon className="w-5 h-5 mr-2" />
                                            Agregar Orden y Calcular Comisión
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="lg:col-span-1 p-5 bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 rounded-xl shadow-lg border-2 border-indigo-300 h-fit">
                                <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                    <CalculatorIcon className="w-5 h-5" />
                                    Resumen de Cálculo
                                </h3>
                                <div className="space-y-3">
                                    <DetailItem label="Costo Bruto Cobrado" value={newOrder.rawCost} isCurrency />
                                    <DetailItem label={`Valor IVA (${(IVA_PERCENTAGE * 100).toFixed(0)}%)`} value={calculatedValues.ivaValue} isCurrency isSub />
                                    <DetailItem label="Costo Neto (Sin IVA)" value={calculatedValues.netCost} isCurrency isHighlight />
                                    <DetailItem label="Costo Repuestos/Insumos" value={newOrder.materialsCost} isCurrency isSub />
                                    <DetailItem label="Base Comisionable" value={calculatedValues.commissionableBase} isCurrency isHighlight />
                                    <DetailItem label={`% Comisión Aplicado`} value={(newOrder.commissionRate * 100).toFixed(1) + '%'} isRate />
                                </div>
                                <div className="mt-4 pt-4 border-t border-indigo-300">
                                    <DetailItem label="VALOR FINAL COMISIÓN" value={calculatedValues.commissionValue} isCurrency isTotal />
                                </div>
                            </div>

                             <div className="lg:col-span-3 mt-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <BookOpenIcon className="w-5 h-5 text-indigo-600" />
                                    Últimas Órdenes Agregadas
                                </h3>
                                <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                                     <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Orden</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Técnico</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Bruto</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Base Comisión</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {orders.map((order) => {
                                                const tech = technicians.find(t => t.id === order.technicianId);
                                                const baseComision = Math.max(0, (order.rawCost / (1 + IVA_PERCENTAGE)) - order.materialsCost);
                                                return (
                                                    <tr key={order.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 transform hover:scale-[1.01]">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{order.date}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{order.workOrderNumber}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-700">{tech ? tech.name : 'Desconocido'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">${(order.rawCost || 0).toLocaleString('es-CL')}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-600">${baseComision.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-green-700 text-right">${(order.commissionValue || 0).toLocaleString('es-CL')}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'technicians' && <TechnicianManager />}
                    {activeTab === 'reports' && <CommissionReports />}
                </div>
            </div>
        </div>
    );
};

// Componente auxiliar para mostrar detalles del cálculo
const DetailItem = ({ label, value, isCurrency = false, isRate = false, isHighlight = false, isTotal = false, isSub = false }) => {
    const formatValue = (val) => {
        if (typeof val !== 'number' || isNaN(val)) return '-';
        if (isCurrency || isTotal) {
            return `$${val.toLocaleString('es-CL', { maximumFractionDigits: isTotal ? 0 : 2 })}`;
        }
        return val;
    };

    let labelClass = 'text-xs font-medium text-gray-700';
    let valueClass = 'font-semibold text-gray-900 text-sm';

    if (isHighlight) {
        labelClass = 'text-sm font-bold text-indigo-800';
        valueClass = 'font-bold text-indigo-900 text-base';
    }
    if (isTotal) {
        labelClass = 'text-base font-bold text-green-700 uppercase';
        valueClass = 'text-xl font-bold text-green-700';
    }
    if (isSub) {
        labelClass = 'text-xs italic text-gray-600';
        valueClass = 'text-xs font-medium text-gray-700';
    }
    if (isRate) {
         valueClass = 'font-bold text-purple-700 text-sm';
    }

    return (
        <div className="flex justify-between items-center py-0.5">
            <span className={labelClass}>{label}</span>
            <span className={valueClass}>{formatValue(value)}</span>
        </div>
    );
};

export default App;
