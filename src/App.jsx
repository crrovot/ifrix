// App.jsx - Componente principal de la aplicacion
// Arquitectura modular para facilitar el mantenimiento

import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';

// Constantes
import { TABS } from './constants';

// Hooks personalizados
import { useTechnicians, useOrders } from './hooks';

// Componentes
import { Header, MainContainer } from './components/layout';
import { OrdersPage } from './components/orders';
import { TechnicianManager } from './components/technicians';
import { ReportsPage } from './components/reports';
import { AlertaMonitor } from './components/monitor';
import { SEO, OrdersSEO, TechniciansSEO, ReportsSEO, Login } from './components/common';
import { useLocalAuth } from './hooks';

const App = () => {
    const { isAuthenticated, userRole, logout } = useLocalAuth();
    
    // Estado de navegacion - si es operador, iniciar en Monitor
    const [activeTab, setActiveTab] = useState(
        userRole === 'operator' ? TABS.MONITOR : TABS.ORDERS
    );
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Hooks de datos
    const { 
        technicians, 
        activeTechnicians,
        addTechnician, 
        deleteTechnician 
    } = useTechnicians();

    const {
        orders,
        newOrder,
        calculatedValues,
        editingOrder,
        editingCalculatedValues,
        handleOrderChange,
        addOrder,
        deleteOrder,
        startEditOrder,
        cancelEditOrder,
        handleEditOrderChange,
        saveEditOrder,
    } = useOrders();

    // Handlers
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(prev => !prev);
    };

    // SEO dinámico según la tab activa
    const renderSEO = () => {
        switch (activeTab) {
            case TABS.ORDERS:
                return <OrdersSEO />;
            case TABS.TECHNICIANS:
                return <TechniciansSEO />;
            case TABS.REPORTS:
                return <ReportsSEO />;
            default:
                return <SEO />;
        }
    };

    // Eliminar línea de useLocalAuth duplicada
    const isAdmin = userRole === 'admin';

    if (!isAuthenticated) {
        // Mostrar pantalla de login y no renderizar el resto
        return <Login />;
    }

    return (
        <>
            {/* SEO dinámico */}
            {renderSEO()}
            
            <div className="min-h-screen bg-slate-100 font-sans">
            {/* Notificaciones Toast */}
            <Toaster 
                position="top-center" 
                toastOptions={{ 
                    style: { 
                        fontSize: '12px', 
                        padding: '8px 12px',
                        maxWidth: '90vw'
                    },
                    duration: 3000
                }} 
            />

            {/* Header con navegacion */}
            <Header 
                activeTab={activeTab}
                onTabChange={handleTabChange}
                mobileMenuOpen={mobileMenuOpen}
                onToggleMobileMenu={toggleMobileMenu}
                onLogout={logout}
            />

            {/* Contenido principal */}
            <MainContainer>
                {/* Tab: Ordenes - Solo para admin */}
                {activeTab === TABS.ORDERS && isAdmin && (
                    <OrdersPage 
                        orders={orders}
                        technicians={technicians}
                        newOrder={newOrder}
                        calculatedValues={calculatedValues}
                        onOrderChange={handleOrderChange}
                        onSubmit={(e) => addOrder(e, technicians)}
                        // Edición
                        editingOrder={editingOrder}
                        editingCalculatedValues={editingCalculatedValues}
                        onEditOrder={startEditOrder}
                        onDeleteOrder={deleteOrder}
                        onEditChange={handleEditOrderChange}
                        onSaveEdit={saveEditOrder}
                        onCancelEdit={cancelEditOrder}
                    />
                )}

                {/* Tab: Tecnicos - Solo para admin */}
                {activeTab === TABS.TECHNICIANS && isAdmin && (
                    <TechnicianManager 
                        technicians={technicians}
                        onAddTechnician={addTechnician}
                        onDeleteTechnician={deleteTechnician}
                    />
                )}

                {/* Tab: Reportes - Solo para admin */}
                {activeTab === TABS.REPORTS && isAdmin && (
                    <ReportsPage 
                        orders={orders}
                        technicians={technicians}
                    />
                )}

                {/* Tab: Monitor de Alertas */}
                {activeTab === TABS.MONITOR && (
                    <AlertaMonitor />
                )}
            </MainContainer>
        </div>
        </>
    );
};

export default App;
