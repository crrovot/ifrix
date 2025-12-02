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

const App = () => {
    // Estado de navegacion
    const [activeTab, setActiveTab] = useState(TABS.ORDERS);
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
        handleOrderChange,
        addOrder,
    } = useOrders();

    // Handlers
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(prev => !prev);
    };

    return (
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
            />

            {/* Contenido principal */}
            <MainContainer>
                {/* Tab: Ordenes */}
                {activeTab === TABS.ORDERS && (
                    <OrdersPage 
                        orders={orders}
                        technicians={technicians}
                        newOrder={newOrder}
                        calculatedValues={calculatedValues}
                        onOrderChange={handleOrderChange}
                        onSubmit={addOrder}
                    />
                )}

                {/* Tab: Tecnicos */}
                {activeTab === TABS.TECHNICIANS && (
                    <TechnicianManager 
                        technicians={technicians}
                        onAddTechnician={addTechnician}
                        onDeleteTechnician={deleteTechnician}
                    />
                )}

                {/* Tab: Reportes */}
                {activeTab === TABS.REPORTS && (
                    <ReportsPage 
                        orders={orders}
                        technicians={technicians}
                    />
                )}
            </MainContainer>
        </div>
    );
};

export default App;
