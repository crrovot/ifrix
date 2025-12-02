// Componente contenedor principal

import React from 'react';

export const MainContainer = ({ children }) => {
    return (
        <div className="max-w-full mx-auto px-2 xs:px-3 sm:px-4 lg:px-6 py-2 xs:py-3">
            <div className="bg-white shadow rounded-lg p-2 xs:p-3 sm:p-4 min-h-[calc(100vh-70px)] xs:min-h-[calc(100vh-80px)]">
                {children}
            </div>
        </div>
    );
};

export default MainContainer;
