// AlertaMonitor.jsx - Sistema de monitor de turnos/órdenes temporal
import React, { useState, useEffect } from 'react';
import { useLocalAuth } from '../../hooks';

const DB_KEY = 'monitor_v11_0_user_edit';

const AlertaMonitor = () => {
    const { userRole, logout: appLogout } = useLocalAuth();
    const isAdminRole = userRole === 'admin';
    
    const [data, setData] = useState({
        branches: [{id: 1, name: "Principal"}],
        users: [{name:'admin', pass:'1234', role:'admin', branchId: 1}],
        cats: [{id:1, name:'General', tOr:2, tRe:5, tCr:10}],
        techs: [{id:1, name:'fulanito'}],
        orders: [],
        history: []
    });
    
    // Usuario simulado basado en el rol de la app principal
    const [currentUser] = useState({ 
        name: isAdminRole ? 'admin' : 'operador', 
        role: isAdminRole ? 'admin' : 'creator', 
        branchId: 1 
    });
    const [activeTab, setActiveTab] = useState('entry');
    const [currentTheme, setCurrentTheme] = useState('light');
    
    // Estado para nueva orden
    const [newOrderId, setNewOrderId] = useState('');
    const [selectedTech, setSelectedTech] = useState('');
    const [selectedCat, setSelectedCat] = useState('');
    
    // Estado para gestión de usuarios
    const [editingUserOriginalName, setEditingUserOriginalName] = useState(null);
    const [newUserName, setNewUserName] = useState('');
    const [newUserPass, setNewUserPass] = useState('');
    const [newUserRole, setNewUserRole] = useState('creator');
    const [newUserBranch, setNewUserBranch] = useState('');
    const [onlyViewMonitor, setOnlyViewMonitor] = useState('vierwer');
    
    // Estado para otras entidades
    const [newBranchName, setNewBranchName] = useState('');
    const [newTechName, setNewTechName] = useState('');
    const [catName, setCatName] = useState('');
    const [catOr, setCatOr] = useState('');
    const [catRe, setCatRe] = useState('');
    const [catCr, setCatCr] = useState('');
    const [auditSearch, setAuditSearch] = useState('');
    const [adminBranchFilter, setAdminBranchFilter] = useState('all');
    
    // Cargar datos al iniciar
    useEffect(() => {
        const stored = localStorage.getItem(DB_KEY);
        if(stored) {
            setData(JSON.parse(stored));
        }
        applyTheme();
    }, []);
    
    // Actualizar monitor cada segundo
    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => ({...prev})); // Force re-render
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    
    // Guardar datos
    const saveData = (newData) => {
        localStorage.setItem(DB_KEY, JSON.stringify(newData));
        setData(newData);
    };
    
    // Temas
    const cycleTheme = () => {
        let newTheme = 'light';
        if(currentTheme === 'light') newTheme = 'dark';
        else if(currentTheme === 'dark') newTheme = 'ifrix-dark';
        else if(currentTheme === 'ifrix-dark') newTheme = 'ifrix-light';
        setCurrentTheme(newTheme);
        localStorage.setItem('appTheme', newTheme);
    };
    
    const applyTheme = () => {
        const savedTheme = localStorage.getItem('appTheme') || 'light';
        setCurrentTheme(savedTheme);
    };
    
    const getThemeButtonText = () => {
        if(currentTheme === 'dark') return "🌙 Oscuro";
        if(currentTheme === 'ifrix-dark') return "🟢 Ifrix Dark";
        if(currentTheme === 'ifrix-light') return "⚪ Ifrix Light";
        return "🌞 Claro";
    };
    
    // Órdenes
    const addOrder = () => {
        const id = parseInt(newOrderId);
        const tech = selectedTech;
        const catId = parseInt(selectedCat);
        
        if(!id) return alert("Falta numero");
        
        const duplicate = data.orders.find(o => o.id === id);
        if(duplicate) {
            const conflictBranch = data.branches.find(b => b.id == duplicate.branchId);
            const conflictName = conflictBranch ? conflictBranch.name : "Desconocida";
            return alert(`¡ERROR!\nLa orden #${id} ya está activa en la sucursal: ${conflictName}.`);
        }
        
        const newData = {...data};
        newData.orders.push({ 
            id, 
            tech: tech||"PEND", 
            catId, 
            creator: currentUser.name, 
            branchId: currentUser.branchId, 
            start: Date.now() 
        });
        saveData(newData);
        setNewOrderId('');
    };
    
    const delOrder = (id) => {
        if(confirm("¿Borrar?")) {
            const o = data.orders.find(x => x.id === id);
            if(o) {
                const newData = {...data};
                newData.history.push({...o, deletedBy: currentUser.name, deletedAt: Date.now()});
                newData.orders = newData.orders.filter(x => x.id !== id);
                saveData(newData);
            }
        }
    };
    
    const clearAll = () => {
        if(confirm("¿Limpiar pantalla?")) {
            let toKill = [];
            if(currentUser.role === 'admin') {
                toKill = (adminBranchFilter === 'all') ? data.orders : data.orders.filter(o => o.branchId == adminBranchFilter);
            } else {
                toKill = data.orders.filter(o => o.branchId == currentUser.branchId);
            }
            
            const newData = {...data};
            toKill.forEach(o => newData.history.push({...o, deletedBy: currentUser.name, deletedAt: Date.now()}));
            newData.orders = newData.orders.filter(o => !toKill.some(k => k === o));
            saveData(newData);
        }
    };
    
    // Usuarios
    const saveUserProcess = () => {
        const n = newUserName.trim();
        const p = newUserPass.trim();
        const r = newUserRole;
        const b = newUserBranch;
        
        if(!n || !p) return alert("Faltan datos");
        
        const newData = {...data};
        
        if (editingUserOriginalName) {
            const index = newData.users.findIndex(u => u.name === editingUserOriginalName);
            if (index !== -1) {
                if(n !== editingUserOriginalName && newData.users.some(u => u.name === n)) {
                    return alert("El nuevo nombre de usuario ya está en uso.");
                }
                newData.users[index] = { name: n, pass: p, role: r, branchId: b };
                saveData(newData);
                alert("Usuario actualizado");
                cancelEditUser();
            }
        } else {
            if(newData.users.some(u => u.name === n)) return alert("El usuario ya existe");
            newData.users.push({name:n, pass:p, role:r, branchId:b});
            saveData(newData);
            setNewUserName('');
            setNewUserPass('');
        }
    };
    
    const prepareEditUser = (name) => {
        const user = data.users.find(u => u.name === name);
        if(!user) return;
        
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
    
    const dropUser = (n) => {
        if(n === currentUser.name) return alert("No puedes borrar tu propio usuario activo.");
        if(confirm("¿Eliminar usuario " + n + "?")) {
            const newData = {...data};
            newData.users = newData.users.filter(x => x.name !== n);
            saveData(newData);
        }
    };
    
    // Sucursales, Técnicos, Categorías
    const addBranch = () => {
        if(newBranchName) {
            const newData = {...data};
            newData.branches.push({id:Date.now(), name:newBranchName});
            saveData(newData);
            setNewBranchName('');
        }
    };
    
    const dropBranch = (id) => {
        const newData = {...data};
        newData.branches = newData.branches.filter(x => x.id !== id);
        saveData(newData);
    };
    
    const addTech = () => {
        if(newTechName) {
            const newData = {...data};
            newData.techs.push({id:Date.now(), name:newTechName});
            saveData(newData);
            setNewTechName('');
        }
    };
    
    const dropTech = (id) => {
        const newData = {...data};
        newData.techs = newData.techs.filter(x => x.id !== id);
        saveData(newData);
    };
    
    const addCat = () => {
        if(catName) {
            const newData = {...data};
            newData.cats.push({id:Date.now(), name:catName, tOr:catOr, tRe:catRe, tCr:catCr});
            saveData(newData);
            setCatName('');
            setCatOr('');
            setCatRe('');
            setCatCr('');
        }
    };
    
    const dropCat = (id) => {
        const newData = {...data};
        newData.cats = newData.cats.filter(x => x.id !== id);
        saveData(newData);
    };
    
    // Renderizado del monitor
    const getFilteredOrders = () => {
        if(!currentUser) return [];
        
        let orders = [];
        if(currentUser.role === 'admin') {
            orders = (adminBranchFilter === 'all') ? data.orders : data.orders.filter(o => o.branchId == adminBranchFilter);
        } else {
            orders = data.orders.filter(o => o.branchId == currentUser.branchId);
        }
        return orders.sort((a, b) => a.start - b.start);
    };
    
    const renderOrderCard = (o, isTiny, now) => {
        const cat = data.cats.find(c => c.id === o.catId);
        const branch = data.branches.find(b => b.id == o.branchId);
        const branchName = branch ? branch.name : "??";
        
        if(!cat) return null;
        
        const elapsedMin = (now - o.start) / 60000;
        let colorClass = 'bg-green-600';
        if(elapsedMin >= cat.tCr) colorClass = 'bg-red-600 border-4 border-white animate-pulse';
        else if(elapsedMin >= cat.tRe) colorClass = 'bg-red-600';
        else if(elapsedMin >= cat.tOr) colorClass = 'bg-orange-500';
        
        const sec = Math.floor((now - o.start)/1000);
        const timeStr = `${Math.floor(sec/60).toString().padStart(2,'0')}:${(sec%60).toString().padStart(2,'0')}`;
        
        const canDel = (currentUser.role === 'admin' || currentUser.branchId == o.branchId);
        
        return (
            <div key={o.id} className={`${colorClass} text-white rounded-lg p-3 relative flex flex-col justify-between shadow-inner`}>
                {canDel && (
                    <button 
                        onClick={() => delOrder(o.id)}
                        className="absolute top-1 right-1 bg-black bg-opacity-30 text-white rounded-full w-6 h-6 font-bold z-20 hover:bg-opacity-50"
                    >
                        X
                    </button>
                )}
                <div className="flex justify-between">
                    <div className={`font-black leading-none ${isTiny ? 'text-8xl text-center w-full' : 'text-5xl'}`}>
                        {o.id}
                    </div>
                    {!isTiny && <div className="text-sm">{o.creator}</div>}
                </div>
                {!isTiny && (
                    <div className="font-bold text-center text-2xl uppercase bg-black bg-opacity-20 rounded my-2">
                        {o.tech}
                    </div>
                )}
                <div className="flex justify-between items-end text-xs">
                    {!isTiny && (
                        <div className="max-w-[65%] font-semibold uppercase overflow-hidden text-ellipsis whitespace-nowrap">
                            {cat.name} - {branchName}
                        </div>
                    )}
                    <div className="font-mono font-bold text-3xl">{timeStr}</div>
                </div>
            </div>
        );
    };
    
    const themeClass = currentTheme === 'dark' ? 'bg-slate-900 text-slate-100' : 
                       currentTheme === 'ifrix-dark' ? 'bg-black text-white' : 
                       currentTheme === 'ifrix-light' ? 'bg-white text-black' : 
                       'bg-slate-100 text-slate-900';
    
    const bName = data.branches.find(b=>b.id == currentUser.branchId)?.name || "Global";
    const orders = getFilteredOrders();
    const now = Date.now();
    
    const headerBg = currentTheme === 'ifrix-dark' ? 'bg-black border-b-2 border-green-500' :
                     currentTheme === 'ifrix-light' ? 'bg-white border-b-2 border-black' :
                     currentTheme === 'dark' ? 'bg-slate-800 border-b border-slate-700' : 'bg-white border-b border-gray-200';
    const titleColor = currentTheme === 'ifrix-dark' ? 'text-green-500' :
                       currentTheme === 'ifrix-light' ? 'text-black' : 'text-blue-600';
    const themeBtn = currentTheme === 'ifrix-dark' ? 'px-3 py-1 border-2 border-green-500 rounded text-sm font-bold text-green-500 hover:bg-green-500 hover:text-black' :
                     currentTheme === 'ifrix-light' ? 'px-3 py-1 border-2 border-black rounded text-sm font-bold text-black hover:bg-black hover:text-green-500' :
                     currentTheme === 'dark' ? 'px-3 py-1 border border-slate-600 rounded text-sm font-bold text-slate-300 hover:bg-slate-700' :
                     'px-3 py-1 border border-gray-300 rounded text-sm font-bold text-gray-700 hover:bg-gray-100';
    
    return (
        <div className={`min-h-screen flex flex-col ${themeClass}`}>
            {/* Header */}
            <div className={`${headerBg} px-5 py-3 flex justify-between items-center`}>
                <span className={`font-black text-lg ${titleColor}`}>MONITOR ENTERPRISE</span>
                <div className="flex items-center gap-4">
                    <button onClick={cycleTheme} className={themeBtn}>
                        {getThemeButtonText()}
                    </button>
                    <div className="text-sm text-right">
                        <div className="font-bold">{currentUser.name.toUpperCase()}</div>
                        <div className="opacity-70">{bName}</div>
                    </div>
                    <button 
                        onClick={appLogout}
                        className="bg-red-600 text-white px-3 py-1 rounded font-semibold hover:bg-red-700"
                    >
                        Salir
                    </button>
                </div>
            </div>
            
            {/* Tabs */}
            <div className="flex justify-center gap-3 p-3 border-b">
                <button 
                    onClick={() => setActiveTab('entry')}
                    className={`px-5 py-2 rounded font-semibold ${activeTab === 'entry' ? 
                        (currentTheme === 'ifrix-dark' ? 'bg-green-500 text-black' : 
                         currentTheme === 'ifrix-light' ? 'bg-black text-green-500' : 'bg-blue-600 text-white') : 
                        (currentTheme === 'ifrix-dark' ? 'bg-black border-2 border-green-500 text-green-500' : 
                         currentTheme === 'ifrix-light' ? 'bg-white border-2 border-black text-black' : 
                         currentTheme === 'dark' ? 'bg-slate-700 border border-slate-600 text-slate-300' : 'bg-white border border-gray-300 text-gray-700')}`}
                >
                    1. Crear
                </button>
                <button 
                    onClick={() => setActiveTab('monitor')}
                    className={`px-5 py-2 rounded font-semibold ${activeTab === 'monitor' ? 
                        (currentTheme === 'ifrix-dark' ? 'bg-green-500 text-black' : 
                         currentTheme === 'ifrix-light' ? 'bg-black text-green-500' : 'bg-blue-600 text-white') : 
                        (currentTheme === 'ifrix-dark' ? 'bg-black border-2 border-green-500 text-green-500' : 
                         currentTheme === 'ifrix-light' ? 'bg-white border-2 border-black text-black' : 
                         currentTheme === 'dark' ? 'bg-slate-700 border border-slate-600 text-slate-300' : 'bg-white border border-gray-300 text-gray-700')}`}
                >
                    2. Monitor
                </button>
                {isAdminRole && (
                    <>
                        <button 
                            onClick={() => setActiveTab('config')}
                            className={`px-5 py-2 rounded font-semibold ${activeTab === 'config' ? 
                                (currentTheme === 'ifrix-dark' ? 'bg-green-500 text-black' : 
                                 currentTheme === 'ifrix-light' ? 'bg-black text-green-500' : 'bg-blue-600 text-white') : 
                                (currentTheme === 'ifrix-dark' ? 'bg-black border-2 border-green-500 text-green-500' : 
                                 currentTheme === 'ifrix-light' ? 'bg-white border-2 border-black text-black' : 
                                 currentTheme === 'dark' ? 'bg-slate-700 border border-slate-600 text-slate-300' : 'bg-white border border-gray-300 text-gray-700')}`}
                        >
                            3. Config
                        </button>
                        <button 
                            onClick={() => setActiveTab('audit')}
                            className={`px-5 py-2 rounded font-semibold ${activeTab === 'audit' ? 
                                (currentTheme === 'ifrix-dark' ? 'bg-green-500 text-black' : 
                                 currentTheme === 'ifrix-light' ? 'bg-black text-green-500' : 'bg-blue-600 text-white') : 
                                (currentTheme === 'ifrix-dark' ? 'bg-black border-2 border-green-500 text-green-500' : 
                                 currentTheme === 'ifrix-light' ? 'bg-white border-2 border-black text-black' : 
                                 currentTheme === 'dark' ? 'bg-slate-700 border border-slate-600 text-slate-300' : 'bg-white border border-gray-300 text-gray-700')}`}
                        >
                            4. Auditoría
                        </button>
                    </>
                )}
            </div>
            
            {/* Content Area */}
            <div className="flex-1 overflow-auto p-5">
                {/* Tab 1: Crear */}
                {activeTab === 'entry' && (
                    <div className="max-w-lg mx-auto">
                        <div className={`rounded-lg p-6 shadow mb-4 ${
                            currentTheme === 'ifrix-dark' ? 'bg-black border-2 border-green-500' :
                            currentTheme === 'ifrix-light' ? 'bg-white border-2 border-black' :
                            currentTheme === 'dark' ? 'bg-slate-800' : 'bg-white'
                        }`}>
                            <h2 className={`text-2xl font-bold mb-4 ${
                                currentTheme === 'ifrix-dark' ? 'text-green-500' :
                                currentTheme === 'ifrix-light' ? 'text-black' : 'text-blue-600'
                            }`}>Nuevo Turno</h2>
                            <input 
                                type="number" 
                                value={newOrderId}
                                onChange={(e) => setNewOrderId(e.target.value.replace(/[^0-9]/g,''))}
                                placeholder="00"
                                className={`w-full text-6xl font-black text-center p-3 rounded mb-3 ${
                                    currentTheme === 'ifrix-dark' ? 'border-2 border-green-500 bg-black text-green-500' :
                                    currentTheme === 'ifrix-light' ? 'border-2 border-black bg-white text-black' :
                                    currentTheme === 'dark' ? 'border border-slate-600 bg-slate-700 text-blue-400' :
                                    'border border-gray-300 bg-white text-blue-600'
                                }`}
                                onKeyPress={(e) => e.key === 'Enter' && addOrder()}
                            />
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <select 
                                    value={selectedTech}
                                    onChange={(e) => setSelectedTech(e.target.value)}
                                    className={`p-2 rounded ${
                                        currentTheme === 'ifrix-dark' ? 'border-2 border-green-500 bg-black text-green-500' :
                                        currentTheme === 'ifrix-light' ? 'border-2 border-black bg-white text-black' :
                                        currentTheme === 'dark' ? 'border border-slate-600 bg-slate-700 text-white' :
                                        'border border-gray-300 bg-white text-gray-900'
                                    }`}
                                >
                                    <option value="">-- Sin Asignar --</option>
                                    {data.techs.map(t => (
                                        <option key={t.id} value={t.name}>{t.name}</option>
                                    ))}
                                </select>
                                <select 
                                    value={selectedCat}
                                    onChange={(e) => setSelectedCat(e.target.value)}
                                    className={`p-2 rounded ${
                                        currentTheme === 'ifrix-dark' ? 'border-2 border-green-500 bg-black text-green-500' :
                                        currentTheme === 'ifrix-light' ? 'border-2 border-black bg-white text-black' :
                                        currentTheme === 'dark' ? 'border border-slate-600 bg-slate-700 text-white' :
                                        'border border-gray-300 bg-white text-gray-900'
                                    }`}
                                >
                                    {data.cats.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button 
                                onClick={addOrder}
                                className={`w-full p-3 rounded font-semibold ${
                                    currentTheme === 'ifrix-dark' ? 'bg-green-500 text-black hover:bg-green-400' :
                                    currentTheme === 'ifrix-light' ? 'bg-black text-green-500 hover:bg-gray-900' :
                                    'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                PUBLICAR
                            </button>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow border-l-4 border-orange-500">
                            <h3 className="text-lg font-bold mb-3">Mis Órdenes Activas</h3>
                            <ul className="space-y-2">
                                {orders.map(o => (
                                    <li key={o.id} className="flex justify-between items-center p-2 border-b">
                                        <span>#{o.id} ({o.tech})</span>
                                        <button 
                                            onClick={() => delOrder(o.id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between p-3 bg-black bg-opacity-5 mb-3">
                            {isAdminRole && (
                                <select 
                                    value={adminBranchFilter}
                                    onChange={(e) => setAdminBranchFilter(e.target.value)}
                                    className="p-1 border rounded"
                                >
                                    <option value="all">Ver Todo</option>
                                    {data.branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            )}
                            <button 
                                onClick={clearAll}
                                className="px-3 py-1 border rounded text-sm hover:bg-slate-200"
                            >
                                Limpiar Mi Pantalla
                            </button>
                        </div>
                        <div className="flex-1 grid gap-3" style={{
                            gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(orders.length * 1.6))}, 1fr)`,
                            gridTemplateRows: `repeat(${Math.ceil(orders.length / Math.ceil(Math.sqrt(orders.length * 1.6)))}, 1fr)`
                        }}>
                            {orders.map(o => renderOrderCard(o, orders.length > 15, now))}
                        </div>
                    </div>
                )}
                
                {/* Tab 3: Config */}
                {activeTab === 'config' && isAdminRole && (
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow mb-4">
                                <h3 className="text-lg font-bold mb-3">Sucursales</h3>
                                <div className="flex gap-2 mb-3">
                                    <input 
                                        value={newBranchName}
                                        onChange={(e) => setNewBranchName(e.target.value)}
                                        placeholder="Nombre"
                                        className="flex-1 p-2 border rounded"
                                    />
                                    <button onClick={addBranch} className="bg-blue-600 text-white px-4 rounded font-bold">+</button>
                                </div>
                                <ul className="space-y-2">
                                    {data.branches.map(b => (
                                        <li key={b.id} className="flex justify-between p-2 border-b">
                                            {b.name}
                                            <button onClick={() => dropBranch(b.id)} className="text-red-500">X</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
                                <h3 className="text-lg font-bold mb-3">Técnicos</h3>
                                <div className="flex gap-2 mb-3">
                                    <input 
                                        value={newTechName}
                                        onChange={(e) => setNewTechName(e.target.value)}
                                        placeholder="Nombre"
                                        className="flex-1 p-2 border rounded"
                                    />
                                    <button onClick={addTech} className="bg-blue-600 text-white px-4 rounded font-bold">+</button>
                                </div>
                                <ul className="space-y-2">
                                    {data.techs.map(t => (
                                        <li key={t.id} className="flex justify-between p-2 border-b">
                                            {t.name}
                                            <button onClick={() => dropTech(t.id)} className="text-red-500">X</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        
                        <div>
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow mb-4">
                                <h3 className="text-lg font-bold mb-3">Gestión de Usuarios</h3>
                                <input 
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    placeholder="Usuario"
                                    className="w-full p-2 border rounded mb-2"
                                />
                                <input 
                                    type="password"
                                    value={newUserPass}
                                    onChange={(e) => setNewUserPass(e.target.value)}
                                    placeholder="Clave"
                                    className="w-full p-2 border rounded mb-2"
                                />
                                <select 
                                    value={newUserRole}
                                    onChange={(e) => setNewUserRole(e.target.value)}
                                    className="w-full p-2 border rounded mb-2"
                                >
                                    <option value="creator">Operador</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <select 
                                    value={newUserBranch}
                                    onChange={(e) => setNewUserBranch(e.target.value)}
                                    className="w-full p-2 border rounded mb-2"
                                >
                                    {data.branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                <button 
                                    onClick={saveUserProcess}
                                    className={`w-full text-white p-2 rounded font-semibold mb-2 ${editingUserOriginalName ? 'bg-blue-500' : 'bg-blue-600'}`}
                                >
                                    {editingUserOriginalName ? 'Guardar Cambios' : 'Crear Usuario'}
                                </button>
                                {editingUserOriginalName && (
                                    <button 
                                        onClick={cancelEditUser}
                                        className="w-full bg-gray-500 text-white p-2 rounded"
                                    >
                                        Cancelar Edición
                                    </button>
                                )}
                                
                                <ul className="space-y-2 mt-4">
                                    {data.users.map(u => {
                                        const b = data.branches.find(br => br.id == u.branchId);
                                        const bName = b ? b.name : "??";
                                        return (
                                            <li key={u.name} className="flex justify-between items-center p-2 border-b">
                                                <span>
                                                    {u.name} ({u.role}) - <small className="text-purple-600">{bName}</small>
                                                </span>
                                                <div className="flex gap-1">
                                                    <button 
                                                        onClick={() => prepareEditUser(u.name)}
                                                        className="bg-blue-500 text-white px-2 py-1 text-xs rounded font-bold"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => dropUser(u.name)}
                                                        className="bg-red-500 text-white px-2 py-1 text-xs rounded font-bold"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
                                <h3 className="text-lg font-bold mb-3">Categorías</h3>
                                <input 
                                    value={catName}
                                    onChange={(e) => setCatName(e.target.value)}
                                    placeholder="Nombre"
                                    className="w-full p-2 border rounded mb-2"
                                />
                                <div className="flex gap-2 mb-2">
                                    <input 
                                        value={catOr}
                                        onChange={(e) => setCatOr(e.target.value)}
                                        placeholder="Nar"
                                        type="number"
                                        className="flex-1 p-2 border rounded"
                                    />
                                    <input 
                                        value={catRe}
                                        onChange={(e) => setCatRe(e.target.value)}
                                        placeholder="Roj"
                                        type="number"
                                        className="flex-1 p-2 border rounded"
                                    />
                                    <input 
                                        value={catCr}
                                        onChange={(e) => setCatCr(e.target.value)}
                                        placeholder="Cri"
                                        type="number"
                                        className="flex-1 p-2 border rounded"
                                    />
                                </div>
                                <button onClick={addCat} className="w-full bg-blue-600 text-white p-2 rounded font-semibold mb-2">
                                    Agregar
                                </button>
                                <ul className="space-y-2">
                                    {data.cats.map(c => (
                                        <li key={c.id} className="flex justify-between p-2 border-b">
                                            {c.name}
                                            <button onClick={() => dropCat(c.id)} className="text-red-500">X</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Tab 4: Auditoría */}
                {activeTab === 'audit' && isAdminRole && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
                        <h3 className="text-lg font-bold mb-3">Auditoría</h3>
                        <input 
                            value={auditSearch}
                            onChange={(e) => setAuditSearch(e.target.value)}
                            placeholder="Buscar ticket..."
                            className="w-full p-2 border rounded mb-3"
                        />
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-2">Ticket</th>
                                    <th className="p-2">Sucursal</th>
                                    <th className="p-2">Acción</th>
                                    <th className="p-2">Fecha y Hora</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.history.slice().reverse().slice(0, 50)
                                    .filter(h => !auditSearch || h.id == auditSearch)
                                    .map((h, idx) => {
                                        const bName = data.branches.find(b => b.id == h.branchId)?.name || '??';
                                        return (
                                            <tr key={idx} className="border-b">
                                                <td className="p-2">{h.id}</td>
                                                <td className="p-2">{bName}</td>
                                                <td className="p-2">{h.deletedBy}</td>
                                                <td className="p-2">{new Date(h.deletedAt).toLocaleString()}</td>
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
