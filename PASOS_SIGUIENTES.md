# GUÍA RÁPIDA: Migración a Supabase - Pasos Siguientes

## ✅ LO QUE YA ESTÁ HECHO

1. ✅ **Archivo SQL creado** (`supabase_migration.sql`) con todas las tablas necesarias
2. ✅ **Servicio de monitor** (`monitorService.js`) con todas las funciones CRUD
3. ✅ **Hook personalizado** (`useMonitorData.js`) para gestionar datos del monitor
4. ✅ **Autenticación actualizada** para consultar usuarios en Supabase
5. ✅ **Documentación completa** en `MIGRACION_SUPABASE.md`

## 🚀 PRÓXIMOS PASOS

### PASO 1: Configurar Supabase (5 minutos)

1. Ve a https://supabase.com y crea una cuenta
2. Crea un nuevo proyecto
3. Copia tus credenciales:
   - Project URL
   - Anon/Public Key
4. Crea archivo `.env` en la raíz del proyecto:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

### PASO 2: Crear las tablas (2 minutos)

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Haz clic en **New Query**
3. Copia todo el contenido de `supabase_migration.sql`
4. Pega en el editor y haz clic en **Run**
5. Verifica que las 6 tablas se crearon en la sección **Table Editor**

### PASO 3: Integrar el hook en AlertaMonitor

Reemplaza el componente `AlertaMonitor.jsx` para usar el nuevo hook:

```jsx
import React, { useState } from 'react';
import { useLocalAuth, useMonitorData } from '../../hooks';

const AlertaMonitor = () => {
    const { userRole, userData, logout: appLogout } = useLocalAuth();
    const isAdminRole = userRole === 'admin';
    
    // Usuario actual
    const [currentUser] = useState({ 
        name: userData?.monitorUser ? userData.name : (isAdminRole ? 'admin' : 'operador'),
        role: isAdminRole ? 'admin' : 'creator', 
        branchId: userData?.monitorUser ? userData.branchId : 1
    });

    // Hook de datos del monitor (reemplaza localStorage)
    const {
        data,
        loading,
        error,
        addOrder: createOrder,
        deleteOrder: removeOrder,
        clearOrders,
        addBranch: createBranch,
        deleteBranch: removeBranch,
        addTechnician: createTechnician,
        deleteTechnician: removeTechnician,
        addCategory: createCategory,
        deleteCategory: removeCategory,
        addUser: createUser,
        updateUser: modifyUser,
        deleteUser: removeUser
    } = useMonitorData(currentUser);

    // Estados locales
    const [activeTab, setActiveTab] = useState('entry');
    const [currentTheme, setCurrentTheme] = useState('light');
    const [newOrderId, setNewOrderId] = useState('');
    const [selectedTech, setSelectedTech] = useState('');
    const [selectedCat, setSelectedCat] = useState('');
    // ... resto de estados

    // Funciones actualizadas para usar el hook
    const addOrder = async () => {
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
        
        const created = await createOrder({ 
            id, 
            tech: tech||"PEND", 
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
        if(!o) return;
        
        if(currentUser.role !== 'admin' && o.branchId !== currentUser.branchId) {
            alert('No tienes permiso para eliminar esta orden');
            return;
        }
        
        if(confirm("¿Borrar?")) {
            await removeOrder(id, currentUser.name);
        }
    };

    const clearAll = async () => {
        if(confirm("¿Limpiar pantalla?")) {
            if(currentUser.role === 'admin') {
                const branchId = adminBranchFilter === 'all' ? null : parseInt(adminBranchFilter);
                await clearOrders(branchId, currentUser.name);
            } else {
                await clearOrders(currentUser.branchId, currentUser.name);
            }
        }
    };

    // Mostrar loading
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
    }

    // Mostrar error
    if (error) {
        return <div className="flex items-center justify-center min-h-screen text-red-600">Error: {error}</div>;
    }

    // ... resto del componente igual
};
```

### PASO 4: Actualizar funciones de configuración

Para sucursales, técnicos, categorías y usuarios, actualiza las funciones:

```jsx
// Sucursales
const addBranch = async () => {
    const name = newBranchName.trim();
    if(!name) return alert('Ingresa nombre');
    const created = await createBranch(name);
    if (created) setNewBranchName('');
};

const dropBranch = async (id) => {
    if(confirm("¿Eliminar?")) {
        await removeBranch(id);
    }
};

// Técnicos
const addTech = async () => {
    const name = newTechName.trim();
    if(!name) return alert('Ingresa nombre');
    const created = await createTechnician(name);
    if (created) setNewTechName('');
};

const dropTech = async (id) => {
    if(confirm("¿Eliminar?")) {
        await removeTechnician(id);
    }
};

// Categorías
const addCat = async () => {
    const name = catName.trim();
    if(!name) return alert('Ingresa nombre');
    const created = await createCategory({
        name,
        tOr: parseInt(catOr) || 2,
        tRe: parseInt(catRe) || 5,
        tCr: parseInt(catCr) || 10
    });
    if (created) {
        setCatName('');
        setCatOr('');
        setCatRe('');
        setCatCr('');
    }
};

const dropCat = async (id) => {
    if(confirm("¿Eliminar?")) {
        await removeCategory(id);
    }
};

// Usuarios
const saveUserProcess = async () => {
    const n = newUserName.trim();
    const p = newUserPass.trim();
    const r = newUserRole;
    const b = parseInt(newUserBranch);
    
    if(!n || !p) return alert('Faltan datos');
    
    if(editingUserOriginalName) {
        // Actualizar
        await modifyUser(editingUserOriginalName, {
            name: n,
            pass: p,
            role: r,
            branchId: b
        });
        setEditingUserOriginalName(null);
    } else {
        // Crear nuevo
        await createUser({
            name: n,
            pass: p,
            role: r,
            branchId: b
        });
    }
    
    // Limpiar form
    setNewUserName('');
    setNewUserPass('');
    setNewUserRole('creator');
    setNewUserBranch('');
};

const dropUser = async (name) => {
    if(confirm("¿Eliminar?")) {
        await removeUser(name);
    }
};
```

### PASO 5: Probar la migración

1. Inicia el servidor de desarrollo: `npm run dev`
2. Verifica que:
   - ✅ Se cargan los datos iniciales (3 sucursales, 1 categoría, 1 técnico)
   - ✅ Puedes crear órdenes
   - ✅ Las órdenes aparecen en el monitor
   - ✅ Puedes eliminar órdenes
   - ✅ El historial se guarda
   - ✅ Los cambios se ven desde otro dispositivo/navegador

## 🎯 RESULTADO ESPERADO

Después de completar estos pasos:

✅ Los datos se guardan en Supabase (nube)
✅ Acceso desde cualquier dispositivo con internet
✅ Sincronización automática en tiempo real
✅ Múltiples usuarios pueden ver y gestionar las mismas órdenes
✅ Historial de auditoría persistente
✅ Backup automático de Supabase

## 🆘 AYUDA

Si necesitas ayuda con algún paso:
1. Revisa `MIGRACION_SUPABASE.md` para detalles completos
2. Consulta la documentación de Supabase: https://supabase.com/docs
3. Revisa los logs de la consola del navegador (F12)
