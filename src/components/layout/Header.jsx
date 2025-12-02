// Componente Header con navegación responsive

import React from 'react';
import { PencilIcon, UsersIcon, BookOpenIcon, XIcon, MenuIcon } from 'lucide-react';
import { TABS } from '../../constants';

export const Header = ({ 
    activeTab, 
    onTabChange, 
    mobileMenuOpen, 
    onToggleMobileMenu 
}) => {
    const handleTabClick = (tab) => {
        onTabChange(tab);
        if (mobileMenuOpen) onToggleMobileMenu();
    };

    return (
        <header className="bg-black text-white shadow-md py-2 sticky top-0 z-50 safe-area-top">
            <div className="max-w-full mx-auto px-2 xs:px-3 sm:px-4 lg:px-6 flex justify-between items-center min-h-[44px]">
                {/* Logo y título */}
                <div className="flex items-center gap-1.5 xs:gap-2">
                    <img 
                        src="/src/assets/Logo ifrix RGB-11.png" 
                        alt="Ifrix" 
                        className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 object-contain" 
                    />
                    <div className="flex flex-col xs:flex-row xs:items-center xs:gap-1">
                        <span className="text-sm xs:text-base sm:text-lg font-semibold leading-tight">
                            Comisiones
                        </span>
                        <span className="text-[10px] xs:text-xs text-gray-400 hidden xs:inline">
                            Ifrix
                        </span>
                    </div>
                </div>
                
                {/* Menú Desktop */}
                <nav className="hidden md:flex gap-1">
                    <NavButton 
                        active={activeTab === TABS.ORDERS}
                        onClick={() => handleTabClick(TABS.ORDERS)}
                        icon={<PencilIcon className="w-3.5 h-3.5 inline mr-1" />}
                        label="Órdenes"
                    />
                    <NavButton 
                        active={activeTab === TABS.TECHNICIANS}
                        onClick={() => handleTabClick(TABS.TECHNICIANS)}
                        icon={<UsersIcon className="w-3.5 h-3.5 inline mr-1" />}
                        label="Técnicos"
                    />
                    <NavButton 
                        active={activeTab === TABS.REPORTS}
                        onClick={() => handleTabClick(TABS.REPORTS)}
                        icon={<BookOpenIcon className="w-3.5 h-3.5 inline mr-1" />}
                        label="Reportes"
                    />
                </nav>

                {/* Botón Hamburguesa */}
                <button 
                    onClick={onToggleMobileMenu} 
                    className="md:hidden p-2.5 -mr-1 rounded-lg hover:bg-gray-800 active:bg-gray-700 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                    aria-label="Menú"
                >
                    {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
                </button>
            </div>

            {/* Menú Móvil */}
            {mobileMenuOpen && (
                <nav className="md:hidden bg-gray-900 border-t border-gray-700 px-2 xs:px-3 py-2 space-y-1 animate-slideDown">
                    <MobileNavButton 
                        active={activeTab === TABS.ORDERS}
                        onClick={() => handleTabClick(TABS.ORDERS)}
                        icon={<PencilIcon className="w-5 h-5 mr-3 flex-shrink-0" />}
                        label="Ingreso de Órdenes"
                    />
                    <MobileNavButton 
                        active={activeTab === TABS.TECHNICIANS}
                        onClick={() => handleTabClick(TABS.TECHNICIANS)}
                        icon={<UsersIcon className="w-5 h-5 mr-3 flex-shrink-0" />}
                        label="Gestión de Técnicos"
                    />
                    <MobileNavButton 
                        active={activeTab === TABS.REPORTS}
                        onClick={() => handleTabClick(TABS.REPORTS)}
                        icon={<BookOpenIcon className="w-5 h-5 mr-3 flex-shrink-0" />}
                        label="Reportes"
                    />
                </nav>
            )}
        </header>
    );
};

// Botón de navegación desktop
const NavButton = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick} 
        className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
            active 
                ? 'bg-cyan-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800'
        }`}
    >
        {icon}{label}
    </button>
);

// Botón de navegación móvil
const MobileNavButton = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick} 
        className={`w-full text-left px-3 py-3 text-sm rounded-lg flex items-center min-h-[48px] active:scale-[0.98] transition-transform ${
            active 
                ? 'bg-cyan-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800 active:bg-gray-700'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default Header;
