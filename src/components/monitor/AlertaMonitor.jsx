// AlertaMonitor.jsx - Sistema de monitor de turnos/órdenes con Supabase
import React, { useState, useEffect } from 'react';
import { useLocalAuth, useMonitorData } from '../../hooks';

const AlertaMonitor = () => {
    const { userRole, userData, logout: appLogout } = useLocalAuth();
    const isAdminRole = userRole === 'admin';

    // Usuario actual basado en la autenticación (ahora simplificado)
    const [currentUser, setCurrentUser] = useState({
        name: userData?.name || 'Administrador',
        role: userRole || 'admin',
        branchId: userData?.branchId || 1
    });

    // Función para cambiar de rol rápidamente (para este "proyecto absurdo")
    const switchRole = (role, name = 'Tecnico1') => {
        setCurrentUser(prev => ({
            ...prev,
            role: role,
            name: role === 'admin' ? 'Administrador' : name
        }));
    };

    // Hook de datos del monitor (reemplaza localStorage con Supabase)
    const {
        data,
        loading,
        error,
        refresh,
        addOrder: createOrder,
        deleteOrder: removeOrder,
        clearOrders,
        addBranch: createBranch,
        deleteBranch: removeBranch,
        addTechnician: createTechnician,
        deleteTechnician: removeTechnician,
        addCategory: createCategory,
        deleteCategory: removeCategory,
        addUser,
        updateUser,
        deleteUser
    } = useMonitorData(currentUser);

    const [activeTab, setActiveTab] = useState('entry');
    const [currentTheme, setCurrentTheme] = useState('light');
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Toggle Fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Escuchar cambios de fullscreen del sistema
    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // Estado para nueva orden
    const [newOrderId, setNewOrderId] = useState('');
    const [selectedTech, setSelectedTech] = useState('');
    const [selectedCat, setSelectedCat] = useState('');

    // Estado para gestión de usuarios
    const [editingUserOriginalName, setEditingUserOriginalName] = useState(null);
    const [newUserName, setNewUserName] = useState('');
    const [newUserPass, setNewUserPass] = useState('');
    const [newUserRole, setNewUserRole] = useState('creator');
    const [newUserBranch, setNewUserBranch] = useState(1);
    const [onlyViewMonitor, setOnlyViewMonitor] = useState('vierwer');

    // Estado para alertas sonoras técnicos
    const [alertedOrders, setAlertedOrders] = useState(new Set());

    // Estado para otras entidades
    const [newBranchName, setNewBranchName] = useState('');
    const [newTechName, setNewTechName] = useState('');
    const [catName, setCatName] = useState('');
    const [catOr, setCatOr] = useState('');
    const [catRe, setCatRe] = useState('');
    const [catCr, setCatCr] = useState('');
    const [auditSearch, setAuditSearch] = useState('');
    const [adminBranchFilter, setAdminBranchFilter] = useState('all');

    // Cargar tema al iniciar
    useEffect(() => {
        applyTheme();
    }, []);

    // Temas
    const cycleTheme = () => {
        let newTheme = 'light';
        if (currentTheme === 'light') newTheme = 'dark';
        else if (currentTheme === 'dark') newTheme = 'ifrix-dark';
        else if (currentTheme === 'ifrix-dark') newTheme = 'ifrix-light';
        setCurrentTheme(newTheme);
        localStorage.setItem('appTheme', newTheme);
    };

    const applyTheme = () => {
        const savedTheme = localStorage.getItem('appTheme') || 'light';
        setCurrentTheme(savedTheme);
    };

    const getThemeButtonText = () => {
        if (currentTheme === 'dark') return "🌙 Oscuro";
        if (currentTheme === 'ifrix-dark') return "🟢 Ifrix Dark";
        if (currentTheme === 'ifrix-light') return "⚪ Ifrix Light";
        return "🌞 Claro";
    };

    // Órdenes
    const addOrder = async () => {
        const id = parseInt(newOrderId);
        const tech = selectedTech;
        const catId = parseInt(selectedCat);

        if (!id) return alert("Falta numero");

        const duplicate = data.orders.find(o => o.id === id);
        if (duplicate) {
            const conflictBranch = data.branches.find(b => b.id == duplicate.branchId);
            const conflictName = conflictBranch ? conflictBranch.name : "Desconocida";
            return alert(`¡ERROR!\nLa orden #${id} ya está activa en la sucursal: ${conflictName}.`);
        }

        const created = await createOrder({
            id,
            tech: tech || "PEND",
            catId,
            creator: currentUser.name,
            branchId: currentUser.branchId,
            start: Date.now()
        });

        if (created) {
            setNewOrderId('');
        }
    };

    const delOrder = async (id) => {
        const o = data.orders.find(x => x.id === id);
        if (!o) return;

        if (currentUser.role !== 'admin' && o.branchId !== currentUser.branchId) {
            alert('No tienes permiso para eliminar esta orden');
            return;
        }

        if (confirm("¿Borrar?")) {
            await removeOrder(id, currentUser.name);
        }
    };

    const clearAll = async () => {
        if (confirm("¿Limpiar pantalla?")) {
            if (currentUser.role === 'admin') {
                const branchId = adminBranchFilter === 'all' ? null : parseInt(adminBranchFilter);
                await clearOrders(branchId, currentUser.name);
            } else {
                await clearOrders(currentUser.branchId, currentUser.name);
            }
        }
    };

    // Usuarios
    const saveUserProcess = async () => {
        const n = newUserName.trim();
        const p = newUserPass.trim();
        const r = newUserRole;
        const b = parseInt(newUserBranch);

        if (!n || !p) return alert("Faltan datos");
        if (!b || isNaN(b)) return alert("Selecciona una sucursal válida");

        try {
            if (editingUserOriginalName) {
                if (n !== editingUserOriginalName && data.users.some(u => u.name === n)) {
                    return alert("El nuevo nombre de usuario ya está en uso.");
                }
                const updated = await updateUser(editingUserOriginalName, { name: n, pass: p, role: r, branchId: b });
                if (updated) {
                    alert("Usuario actualizado");
                    cancelEditUser();
                } else {
                    alert("Error: No se pudo actualizar el usuario. Verifica la consola.");
                }
            } else {
                if (data.users.some(u => u.name === n)) return alert("El usuario ya existe");
                const created = await addUser({ name: n, pass: p, role: r, branchId: b });
                if (created) {
                    alert("Usuario creado exitosamente");
                    setNewUserName('');
                    setNewUserPass('');
                } else {
                    alert("Error: No se pudo crear el usuario.");
                }
            }
        } catch (err) {
            console.error("Error en saveUserProcess:", err);
            alert("Error: " + err.message);
        }
    };

    const prepareEditUser = (name) => {
        const user = data.users.find(u => u.name === name);
        if (!user) return;

        setNewUserName(user.name);
        setNewUserPass(user.pass);
        setNewUserRole(user.role);
        setNewUserBranch(user.branchId);
        setEditingUserOriginalName(name);
    };

    const cancelEditUser = () => {
        setEditingUserOriginalName(null);
        setNewUserName('');
        setNewUserPass('');
    };

    const dropUser = async (n) => {
        if (n === currentUser.name) return alert("No puedes borrar tu propio usuario activo.");
        if (confirm("¿Eliminar usuario " + n + "?")) {
            await deleteUser(n);
        }
    };

    // Sucursales, Técnicos, Categorías
    const addBranch = async () => {
        if (newBranchName) {
            const created = await createBranch(newBranchName);
            if (created) {
                setNewBranchName('');
            }
        }
    };

    const dropBranch = async (id) => {
        await removeBranch(id);
    };

    const addTech = async () => {
        if (newTechName) {
            const created = await createTechnician(newTechName);
            if (created) {
                setNewTechName('');
            }
        }
    };

    const dropTech = async (id) => {
        await removeTechnician(id);
    };

    const addCat = async () => {
        if (catName) {
            const created = await createCategory({ name: catName, tOr: catOr, tRe: catRe, tCr: catCr });
            if (created) {
                setCatName('');
                setCatOr('');
                setCatRe('');
                setCatCr('');
            }
        }
    };

    const dropCat = async (id) => {
        await removeCategory(id);
    };

    // Renderizado del monitor
    const getFilteredOrders = () => {
        if (!currentUser) return [];

        const isTechnician = currentUser.role === 'technician';
        const technicianBranch = data.branches.find(b => b.id == currentUser.branchId);
        const hasAccessToAll = technicianBranch && technicianBranch.name.toLowerCase() === 'todas';

        let orders = [];
        if (currentUser.role === 'admin' || (isTechnician && hasAccessToAll)) {
            orders = (adminBranchFilter === 'all' || (isTechnician && hasAccessToAll))
                ? data.orders
                : data.orders.filter(o => o.branchId == adminBranchFilter);
        } else {
            orders = data.orders.filter(o => o.branchId == currentUser.branchId);
        }

        // Función para calcular el nivel de urgencia de una orden
        const getUrgencyLevel = (order) => {
            const cat = data.cats.find(c => c.id === order.catId) || { tOr: 2, tRe: 5, tCr: 10 };
            const now = Date.now();
            const elapsedMin = (now - order.start) / 60000;

            if (elapsedMin >= cat.tCr) return 4; // Crítico (rojo parpadeante)
            if (elapsedMin >= cat.tRe) return 3; // Rojo
            if (elapsedMin >= cat.tOr) return 2; // Naranja
            return 1; // Verde
        };

        // Priorización para técnicos (mantiene lógica existente + urgencia)
        if (isTechnician) {
            return orders.sort((a, b) => {
                const aIsMine = a.tech === currentUser.name;
                const bIsMine = b.tech === currentUser.name;
                const aIsPend = a.tech === 'PEND' || !a.tech;
                const bIsPend = b.tech === 'PEND' || !b.tech;

                // Primero: mis órdenes
                if (aIsMine && !bIsMine) return -1;
                if (!aIsMine && bIsMine) return 1;

                // Segundo: pendientes
                if (aIsPend && !bIsPend) return -1;
                if (!aIsPend && bIsPend) return 1;

                // Tercero: por urgencia (más urgente primero)
                const urgencyDiff = getUrgencyLevel(b) - getUrgencyLevel(a);
                if (urgencyDiff !== 0) return urgencyDiff;

                // Cuarto: por antigüedad (más antigua primero)
                return a.start - b.start;
            });
        }

        // Priorización para admin y operadores: por urgencia y antigüedad
        return orders.sort((a, b) => {
            // Primero: por urgencia (más urgente primero)
            const urgencyDiff = getUrgencyLevel(b) - getUrgencyLevel(a);
            if (urgencyDiff !== 0) return urgencyDiff;

            // Segundo: por antigüedad (más antigua primero)
            return a.start - b.start;
        });
    };

    // Efecto para alertas sonoras (Solo técnicos)
    useEffect(() => {
        if (currentUser.role !== 'technician') return;

        const checkAlerts = () => {
            const now = Date.now();
            const redOrders = data.orders.filter(o => {
                if (alertedOrders.has(o.id)) return false;

                const cat = data.cats.find(c => c.id === o.catId) || { tRe: 5 };
                const elapsedMin = (now - o.start) / 60000;
                return elapsedMin >= cat.tRe;
            });

            if (redOrders.length > 0) {
                // Reproducir sonido en loop por 5 segundos
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.loop = true;
                audio.play().catch(e => console.log("Audio play blocked"));

                // Detener el sonido después de 5 segundos
                setTimeout(() => {
                    audio.pause();
                    audio.currentTime = 0;
                }, 5000);

                setAlertedOrders(prev => {
                    const next = new Set(prev);
                    redOrders.forEach(o => next.add(o.id));
                    return next;
                });
            }
        };

        const interval = setInterval(checkAlerts, 5000);
        return () => clearInterval(interval);
    }, [data.orders, data.cats, currentUser.role, alertedOrders]);

    const renderOrderCard = (o, isTiny, now) => {
        const cat = data.cats.find(c => c.id === o.catId) || {
            id: 0,
            name: 'Sin categoría',
            tOr: 2,
            tRe: 5,
            tCr: 10
        };
        const branch = data.branches.find(b => b.id == o.branchId);
        const branchName = branch ? branch.name : "??";

        const elapsedMin = (now - o.start) / 60000;
        let colorClass = 'bg-green-600';
        if (elapsedMin >= cat.tCr) colorClass = 'bg-red-600 border-4 border-white animate-pulse';
        else if (elapsedMin >= cat.tRe) colorClass = 'bg-red-600';
        else if (elapsedMin >= cat.tOr) colorClass = 'bg-orange-500';

        const sec = Math.floor((now - o.start) / 1000);
        const timeStr = `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`;

        const canDel = (currentUser.role === 'admin' || currentUser.branchId == o.branchId);

        return (
            <div key={o.id} className={`${colorClass} text-white rounded-lg p-3 relative flex flex-col shadow-inner min-h-0`}>
                {canDel && (
                    <button
                        onClick={() => delOrder(o.id)}
                        className="absolute top-1 right-1 bg-black bg-opacity-30 text-white rounded-full w-6 h-6 font-bold z-20 hover:bg-opacity-50 text-xs"
                    >
                        ✕
                    </button>
                )}

                {/* Número de orden */}
                <div className="flex justify-center items-center mb-2">
                    <div className={`font-black leading-none ${isTiny ? 'text-[clamp(3rem,12vh,6rem)]' : 'text-6xl'}`}>
                        {o.id}
                    </div>
                </div>

                {/* Técnico asignado */}
                {!isTiny && (
                    <div className="bg-black bg-opacity-30 rounded px-2 py-1 mb-2 text-center">
                        <div className="text-[0.65rem] opacity-70 uppercase tracking-wide">Técnico</div>
                        <div className="font-bold text-lg uppercase truncate">{o.tech || 'PEND'}</div>
                    </div>
                )}

                {/* Información adicional */}
                {!isTiny && (
                    <div className="grid grid-cols-2 gap-1 text-[0.7rem] mb-2">
                        <div className="bg-black bg-opacity-20 rounded px-2 py-1">
                            <div className="opacity-60 text-[0.6rem] uppercase">Creado por</div>
                            <div className="font-semibold truncate">{o.creator}</div>
                        </div>
                        <div className="bg-black bg-opacity-20 rounded px-2 py-1">
                            <div className="opacity-60 text-[0.6rem] uppercase">Sucursal</div>
                            <div className="font-semibold truncate">{branchName}</div>
                        </div>
                    </div>
                )}

                {/* Timer y categoría */}
                <div className="mt-auto pt-2 border-t border-white border-opacity-20">
                    <div className="flex justify-between items-center">
                        {!isTiny && (
                            <div className="text-[0.65rem] font-semibold uppercase truncate max-w-[50%] opacity-80">
                                {cat.name}
                            </div>
                        )}
                        <div className={`font-mono font-bold ml-auto ${isTiny ? 'text-2xl' : 'text-xl'}`}>
                            {timeStr}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const themeClass = currentTheme === 'dark' ? 'bg-slate-900 text-slate-100' :
        currentTheme === 'ifrix-dark' ? 'bg-black text-white' :
            currentTheme === 'ifrix-light' ? 'bg-white text-black' :
                'bg-slate-100 text-slate-900';

    const getThemeColors = () => {
        if (currentTheme === 'ifrix-dark') {
            return {
                bg: 'bg-black',
                bgCard: 'bg-black',
                border: 'border-green-500',
                text: 'text-green-500',
                textAlt: 'text-white',
                primary: 'bg-green-500',
                primaryText: 'text-black',
                primaryHover: 'hover:bg-green-400',
                input: 'border-2 border-green-500 bg-black text-green-500',
                button: 'bg-green-500 text-black hover:bg-green-400',
                header: 'bg-black border-b-2 border-green-500',
                tabActive: 'bg-green-500 text-black',
                tabInactive: 'bg-black border-2 border-green-500 text-green-500'
            };
        }
        if (currentTheme === 'ifrix-light') {
            return {
                bg: 'bg-white',
                bgCard: 'bg-white',
                border: 'border-black',
                text: 'text-black',
                textAlt: 'text-gray-700',
                primary: 'bg-black',
                primaryText: 'text-white',
                primaryHover: 'hover:bg-gray-900',
                input: 'border-2 border-black bg-white text-black',
                button: 'bg-black text-white hover:bg-gray-900',
                header: 'bg-white border-b-2 border-black',
                tabActive: 'bg-black text-white',
                tabInactive: 'bg-white border-2 border-black text-black'
            };
        }
        if (currentTheme === 'dark') {
            return {
                bg: 'bg-slate-900',
                bgCard: 'bg-slate-800',
                border: 'border-slate-700',
                text: 'text-slate-100',
                textAlt: 'text-slate-300',
                primary: 'bg-blue-600',
                primaryText: 'text-white',
                primaryHover: 'hover:bg-blue-700',
                input: 'border border-slate-600 bg-slate-700 text-white',
                button: 'bg-blue-600 text-white hover:bg-blue-700',
                header: 'bg-slate-800 border-b border-slate-700',
                tabActive: 'bg-blue-600 text-white',
                tabInactive: 'bg-slate-700 border border-slate-600 text-slate-300'
            };
        }
        return {
            bg: 'bg-slate-100',
            bgCard: 'bg-white',
            border: 'border-gray-300',
            text: 'text-gray-900',
            textAlt: 'text-gray-700',
            primary: 'bg-blue-600',
            primaryText: 'text-white',
            primaryHover: 'hover:bg-blue-700',
            input: 'border border-gray-300 bg-white text-gray-900',
            button: 'bg-blue-600 text-white hover:bg-blue-700',
            header: 'bg-white border-b border-gray-200',
            tabActive: 'bg-blue-600 text-white',
            tabInactive: 'bg-white border border-gray-300 text-gray-700'
        };
    };

    const colors = getThemeColors();
    const bName = currentUser.branchId
        ? (data.branches.find(b => b.id == currentUser.branchId)?.name || "Global")
        : "Todas las Sucursales";
    const orders = getFilteredOrders();
    const now = Date.now();

    return (
        <div className={`min-h-screen flex flex-col ${themeClass} ${isFullscreen ? 'fixed inset-0 z-[100]' : ''}`}>
            {/* Header */}
            {!isFullscreen && (
                <div className={`${colors.header} px-5 py-3 flex justify-between items-center`}>
                    <span className={`font-black text-lg ${colors.text}`}>MONITOR ENTERPRISE</span>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-gray-200 p-1 rounded-lg text-xs font-bold">
                            <button
                                onClick={() => switchRole('admin')}
                                className={`px-2 py-1 rounded ${currentUser.role === 'admin' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
                            >
                                ADMIN
                            </button>
                            <button
                                onClick={() => switchRole('technician', 'Tecnico1')}
                                className={`px-2 py-1 rounded ${currentUser.role === 'technician' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
                            >
                                TÉCNICO
                            </button>
                        </div>
                        <button onClick={cycleTheme} className={`px-3 py-1 border-2 ${colors.border} rounded text-sm font-bold ${colors.text} ${colors.primaryHover} transition-colors`}>
                            {getThemeButtonText()}
                        </button>
                        <div className={`text-sm text-right ${colors.textAlt}`}>
                            <div className="font-bold">{currentUser.name.toUpperCase()} ({currentUser.role})</div>
                            <div className="opacity-70">{bName}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            {!isFullscreen && (
                <div className={`flex justify-center gap-3 p-3 border-b ${colors.border}`}>
                    <button
                        onClick={() => setActiveTab('entry')}
                        className={`px-5 py-2 rounded font-semibold transition-colors ${activeTab === 'entry' ? colors.tabActive : colors.tabInactive}`}
                    >
                        1. Crear
                    </button>
                    <button
                        onClick={() => setActiveTab('monitor')}
                        className={`px-5 py-2 rounded font-semibold transition-colors ${activeTab === 'monitor' ? colors.tabActive : colors.tabInactive}`}
                    >
                        2. Monitor
                    </button>
                    {isAdminRole && (
                        <>
                            <button
                                onClick={() => setActiveTab('config')}
                                className={`px-5 py-2 rounded font-semibold transition-colors ${activeTab === 'config' ? colors.tabActive : colors.tabInactive}`}
                            >
                                3. Config
                            </button>
                            <button
                                onClick={() => setActiveTab('audit')}
                                className={`px-5 py-2 rounded font-semibold transition-colors ${activeTab === 'audit' ? colors.tabActive : colors.tabInactive}`}
                            >
                                4. Auditoría
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Content Area */}
            <div className={`flex-1 ${activeTab === 'monitor' ? 'overflow-hidden' : 'overflow-auto'} ${isFullscreen ? 'p-0' : 'p-5'}`}>
                {/* Tab 1: Crear */}
                {activeTab === 'entry' && (
                    <div className="max-w-lg mx-auto">
                        <div className={`${colors.bgCard} rounded-lg p-6 shadow mb-4 border-2 ${colors.border}`}>
                            <h2 className={`text-2xl font-bold mb-4 ${colors.text}`}>Nuevo Turno</h2>
                            <input
                                type="number"
                                value={newOrderId}
                                onChange={(e) => setNewOrderId(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="00"
                                className={`w-full text-6xl font-black text-center p-3 rounded mb-3 ${colors.input}`}
                                onKeyPress={(e) => e.key === 'Enter' && addOrder()}
                            />
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <select
                                    value={selectedTech}
                                    onChange={(e) => setSelectedTech(e.target.value)}
                                    className={`p-2 rounded ${colors.input}`}
                                >
                                    <option value="">-- Sin Asignar --</option>
                                    {data.techs.map(t => (
                                        <option key={t.id} value={t.name}>{t.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedCat}
                                    onChange={(e) => setSelectedCat(e.target.value)}
                                    className={`p-2 rounded ${colors.input}`}
                                >
                                    {data.cats.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={addOrder}
                                className={`w-full p-3 rounded font-semibold ${colors.button} transition-colors`}
                            >
                                PUBLICAR
                            </button>
                        </div>

                        <div className={`${colors.bgCard} rounded-lg p-6 shadow border-l-4 border-orange-500`}>
                            <h3 className={`text-lg font-bold mb-3 ${colors.text}`}>Mis Órdenes Activas</h3>
                            <ul className="space-y-2">
                                {orders.map(o => (
                                    <li key={o.id} className={`flex justify-between items-center p-2 border-b ${colors.border}`}>
                                        <span className={colors.textAlt}>#{o.id} ({o.tech})</span>
                                        <button
                                            onClick={() => delOrder(o.id)}
                                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 font-semibold transition-colors"
                                        >
                                            X
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Tab 2: Monitor */}
                {activeTab === 'monitor' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {!isFullscreen && (
                            <div className={`flex justify-between p-3 border-b ${colors.border} flex-shrink-0`}>
                                {isAdminRole && (
                                    <select
                                        value={adminBranchFilter}
                                        onChange={(e) => setAdminBranchFilter(e.target.value)}
                                        className={`p-2 rounded ${colors.input}`}
                                    >
                                        <option value="all">Ver Todo</option>
                                        {data.branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                )}
                                <div className="flex gap-2 ml-auto">
                                    <button
                                        onClick={toggleFullscreen}
                                        className={`px-4 py-2 rounded font-semibold ${colors.button} transition-colors flex items-center gap-2`}
                                        title="Expandir Pantalla"
                                    >
                                        ⛶ TV MODE
                                    </button>
                                    <button
                                        onClick={clearAll}
                                        className={`px-4 py-2 rounded font-semibold ${colors.button} transition-colors`}
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </div>
                        )}
                        {orders.length === 0 ? (
                            <div className={`flex-1 flex items-center justify-center ${colors.textAlt}`}>
                                <p className="text-2xl font-bold">No hay órdenes activas</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-hidden p-3">
                                <div
                                    id="monitor-grid"
                                    className="w-full h-full grid gap-3"
                                    style={{
                                        gridTemplateColumns: (() => {
                                            const count = orders.length;
                                            if (count === 0) return '1fr';
                                            if (count === 1) return '1fr';
                                            if (count === 2) return 'repeat(2, 1fr)';
                                            if (count <= 4) return 'repeat(2, 1fr)';
                                            if (count <= 6) return 'repeat(3, 1fr)';
                                            if (count <= 9) return 'repeat(3, 1fr)';
                                            if (count <= 12) return 'repeat(4, 1fr)';
                                            if (count <= 16) return 'repeat(4, 1fr)';
                                            return 'repeat(5, 1fr)';
                                        })(),
                                        gridAutoRows: '1fr'
                                    }}
                                >
                                    {orders.map(o => renderOrderCard(o, orders.length > 15, now))}
                                </div>
                            </div>
                        )}

                        {isFullscreen && (
                            <button
                                onClick={toggleFullscreen}
                                className="fixed bottom-4 right-4 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 z-[110] text-xs opacity-0 hover:opacity-100 transition-opacity"
                                title="Salir de Pantalla Completa"
                            >
                                ⛶ Esc
                            </button>
                        )}
                    </div>
                )}

                {/* Tab 3: Config */}
                {activeTab === 'config' && isAdminRole && (
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <div className={`${colors.bgCard} rounded-lg p-6 shadow mb-4 border-2 ${colors.border}`}>
                                <h3 className={`text-lg font-bold mb-3 ${colors.text}`}>Sucursales</h3>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        value={newBranchName}
                                        onChange={(e) => setNewBranchName(e.target.value)}
                                        placeholder="Nombre"
                                        className={`flex-1 p-2 rounded ${colors.input}`}
                                    />
                                    <button onClick={addBranch} className={`px-4 rounded font-bold ${colors.button} transition-colors`}>+</button>
                                </div>
                                <ul className="space-y-2">
                                    {data.branches.map(b => (
                                        <li key={b.id} className={`flex justify-between p-2 border-b ${colors.border}`}>
                                            <span className={colors.textAlt}>{b.name}</span>
                                            <button onClick={() => dropBranch(b.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors">X</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className={`${colors.bgCard} rounded-lg p-6 shadow border-2 ${colors.border}`}>
                                <h3 className={`text-lg font-bold mb-3 ${colors.text}`}>Técnicos</h3>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        value={newTechName}
                                        onChange={(e) => setNewTechName(e.target.value)}
                                        placeholder="Nombre"
                                        className={`flex-1 p-2 rounded ${colors.input}`}
                                    />
                                    <button onClick={addTech} className={`px-4 rounded font-bold ${colors.button} transition-colors`}>+</button>
                                </div>
                                <ul className="space-y-2">
                                    {data.techs.map(t => (
                                        <li key={t.id} className={`flex justify-between p-2 border-b ${colors.border}`}>
                                            <span className={colors.textAlt}>{t.name}</span>
                                            <button onClick={() => dropTech(t.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors">X</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div>
                            <div className={`${colors.bgCard} rounded-lg p-6 shadow mb-4 border-2 ${colors.border}`}>
                                <h3 className={`text-lg font-bold mb-3 ${colors.text}`}>Gestión de Usuarios</h3>
                                <input
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    placeholder="Usuario"
                                    className={`w-full p-2 rounded mb-2 ${colors.input}`}
                                />
                                <input
                                    type="password"
                                    value={newUserPass}
                                    onChange={(e) => setNewUserPass(e.target.value)}
                                    placeholder="Clave"
                                    className={`w-full p-2 rounded mb-2 ${colors.input}`}
                                />
                                <select
                                    value={newUserRole}
                                    onChange={(e) => setNewUserRole(e.target.value)}
                                    className={`w-full p-2 rounded mb-2 ${colors.input}`}
                                >
                                    <option value="creator">Operador</option>
                                    <option value="admin">Admin</option>
                                    <option value="technician">Técnico</option>
                                </select>
                                <select
                                    value={newUserBranch}
                                    onChange={(e) => setNewUserBranch(parseInt(e.target.value))}
                                    className={`w-full p-2 rounded mb-2 ${colors.input}`}
                                >
                                    {data.branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={saveUserProcess}
                                    className={`w-full p-2 rounded font-semibold mb-2 ${colors.button} transition-colors`}
                                >
                                    {editingUserOriginalName ? 'Guardar Cambios' : 'Crear Usuario'}
                                </button>
                                {editingUserOriginalName && (
                                    <button
                                        onClick={cancelEditUser}
                                        className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors"
                                    >
                                        Cancelar Edición
                                    </button>
                                )}

                                <ul className="space-y-2 mt-4">
                                    {data.users.map(u => {
                                        const b = data.branches.find(br => br.id == u.branchId);
                                        const bName = b ? b.name : "??";
                                        return (
                                            <li key={u.name} className={`flex justify-between items-center p-2 border-b ${colors.border}`}>
                                                <span className={colors.textAlt}>
                                                    {u.name} ({u.role}) - <small className={colors.text}>{bName}</small>
                                                </span>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => prepareEditUser(u.name)}
                                                        className={`px-2 py-1 text-xs rounded font-bold ${colors.button} transition-colors`}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => dropUser(u.name)}
                                                        className="bg-red-600 text-white px-2 py-1 text-xs rounded font-bold hover:bg-red-700 transition-colors"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            <div className={`${colors.bgCard} rounded-lg p-6 shadow border-2 ${colors.border}`}>
                                <h3 className={`text-lg font-bold mb-3 ${colors.text}`}>Categorías</h3>
                                <input
                                    value={catName}
                                    onChange={(e) => setCatName(e.target.value)}
                                    placeholder="Nombre"
                                    className={`w-full p-2 rounded mb-2 ${colors.input}`}
                                />
                                <div className="flex gap-2 mb-2">
                                    <input
                                        value={catOr}
                                        onChange={(e) => setCatOr(e.target.value)}
                                        placeholder="Nar"
                                        type="number"
                                        className={`flex-1 p-2 rounded ${colors.input}`}
                                    />
                                    <input
                                        value={catRe}
                                        onChange={(e) => setCatRe(e.target.value)}
                                        placeholder="Roj"
                                        type="number"
                                        className={`flex-1 p-2 rounded ${colors.input}`}
                                    />
                                    <input
                                        value={catCr}
                                        onChange={(e) => setCatCr(e.target.value)}
                                        placeholder="Cri"
                                        type="number"
                                        className={`flex-1 p-2 rounded ${colors.input}`}
                                    />
                                </div>
                                <button onClick={addCat} className={`w-full p-2 rounded font-semibold mb-2 ${colors.button} transition-colors`}>
                                    Agregar
                                </button>
                                <ul className="space-y-2">
                                    {data.cats.map(c => (
                                        <li key={c.id} className={`flex justify-between p-2 border-b ${colors.border}`}>
                                            <span className={colors.textAlt}>{c.name}</span>
                                            <button onClick={() => dropCat(c.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors">X</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 4: Auditoría */}
                {activeTab === 'audit' && isAdminRole && (
                    <div className={`${colors.bgCard} rounded-lg p-6 shadow border-2 ${colors.border}`}>
                        <h3 className={`text-lg font-bold mb-3 ${colors.text}`}>Auditoría</h3>
                        <input
                            value={auditSearch}
                            onChange={(e) => setAuditSearch(e.target.value)}
                            placeholder="Buscar ticket..."
                            className={`w-full p-2 rounded mb-3 ${colors.input}`}
                        />
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`border-b-2 text-left ${colors.border}`}>
                                    <th className={`p-2 ${colors.text}`}>Ticket</th>
                                    <th className={`p-2 ${colors.text}`}>Sucursal</th>
                                    <th className={`p-2 ${colors.text}`}>Acción</th>
                                    <th className={`p-2 ${colors.text}`}>Fecha y Hora</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.history.slice().reverse().slice(0, 50)
                                    .filter(h => !auditSearch || h.id == auditSearch)
                                    .map((h, idx) => {
                                        const bName = data.branches.find(b => b.id == h.branchId)?.name || '??';
                                        return (
                                            <tr key={idx} className={`border-b ${colors.border}`}>
                                                <td className={`p-2 ${colors.textAlt}`}>{h.id}</td>
                                                <td className={`p-2 ${colors.textAlt}`}>{bName}</td>
                                                <td className={`p-2 ${colors.textAlt}`}>{h.deletedBy}</td>
                                                <td className={`p-2 ${colors.textAlt}`}>{new Date(h.deletedAt).toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertaMonitor;
