# MIGRACIÓN DEL MONITOR A SUPABASE

Este documento explica cómo migrar el sistema de monitor de localStorage a Supabase para permitir acceso desde cualquier lugar.

## 📋 PREREQUISITOS

1. Cuenta en Supabase (https://supabase.com)
2. Proyecto creado en Supabase
3. Variables de entorno configuradas en el archivo `.env`:
   ```
   VITE_SUPABASE_URL=tu-url-de-supabase
   VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
   ```

## 🗄️ PASO 1: CREAR LAS TABLAS EN SUPABASE

1. Accede a tu proyecto en Supabase
2. Ve a la sección **SQL Editor**
3. Copia todo el contenido del archivo `supabase_migration.sql`
4. Pega el contenido en el editor SQL
5. Ejecuta el script haciendo clic en **Run**

Esto creará las siguientes tablas:
- `monitor_branches` - Sucursales
- `monitor_users` - Usuarios del monitor
- `monitor_categories` - Categorías de órdenes
- `monitor_technicians` - Técnicos
- `monitor_orders` - Órdenes activas
- `monitor_history` - Historial de auditoría

## 📦 PASO 2: MIGRAR DATOS EXISTENTES (OPCIONAL)

Si ya tienes datos en localStorage que quieres conservar:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Console**
3. Ejecuta el siguiente código:

```javascript
import { migrateFromLocalStorage } from './src/services/monitorService';
await migrateFromLocalStorage();
```

O desde el componente AlertaMonitor, agrega un botón temporal:

```jsx
<button onClick={async () => {
    const { migrateFromLocalStorage } = await import('../../services/monitorService');
    const success = await migrateFromLocalStorage();
    alert(success ? 'Migración exitosa' : 'Error en la migración');
}}>
    Migrar datos a Supabase
</button>
```

## 🔄 PASO 3: ACTUALIZAR EL COMPONENTE AlertaMonitor

El siguiente paso es modificar el componente `AlertaMonitor.jsx` para usar Supabase en lugar de localStorage. 

### Cambios principales:

1. **Importar el servicio**:
```jsx
import * as monitorService from '../../services/monitorService';
```

2. **Cargar datos desde Supabase**:
```jsx
useEffect(() => {
    const loadData = async () => {
        const branches = await monitorService.getBranches();
        const users = await monitorService.getMonitorUsers();
        const categories = await monitorService.getCategories();
        const technicians = await monitorService.getTechnicians();
        const orders = await monitorService.getOrders();
        const history = await monitorService.getHistory();
        
        setData({
            branches,
            users,
            cats: categories,
            techs: technicians,
            orders,
            history
        });
    };
    loadData();
}, []);
```

3. **Reemplazar operaciones CRUD**:

**Crear orden:**
```jsx
const addOrder = async () => {
    const newOrder = {
        id: parseInt(newOrderId),
        tech: selectedTech || "PEND",
        catId: parseInt(selectedCat),
        creator: currentUser.name,
        branchId: currentUser.branchId,
        start: Date.now()
    };
    
    const created = await monitorService.addOrder(newOrder);
    if (created) {
        setData(prev => ({
            ...prev,
            orders: [...prev.orders, created]
        }));
        setNewOrderId('');
    }
};
```

**Eliminar orden:**
```jsx
const delOrder = async (id) => {
    const o = data.orders.find(x => x.id === id);
    if (!o) return;
    
    if (confirm("¿Borrar?")) {
        // Agregar al historial
        await monitorService.addHistoryEntry({
            order_id: o.id,
            tech: o.tech,
            catId: o.catId,
            creator: o.creator,
            branchId: o.branchId,
            start: o.start,
            deletedBy: currentUser.name,
            deletedAt: Date.now()
        });
        
        // Eliminar orden
        const deleted = await monitorService.deleteOrder(id);
        if (deleted) {
            setData(prev => ({
                ...prev,
                orders: prev.orders.filter(x => x.id !== id)
            }));
        }
    }
};
```

**Agregar sucursal:**
```jsx
const addBranch = async () => {
    const name = newBranchName.trim();
    if (!name) return alert('Ingresa nombre');
    
    const created = await monitorService.addBranch(name);
    if (created) {
        setData(prev => ({
            ...prev,
            branches: [...prev.branches, created]
        }));
        setNewBranchName('');
    }
};
```

## 🔄 PASO 4: ACTUALIZACIÓN EN TIEMPO REAL

Para sincronizar datos entre múltiples usuarios en tiempo real, usa Supabase Realtime:

```jsx
useEffect(() => {
    // Suscribirse a cambios en órdenes
    const subscription = supabase
        .channel('monitor-orders')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'monitor_orders' },
            (payload) => {
                console.log('Cambio detectado:', payload);
                // Recargar datos
                loadOrders();
            }
        )
        .subscribe();
    
    return () => {
        subscription.unsubscribe();
    };
}, []);
```

## ✅ PASO 5: VERIFICACIÓN

Después de la migración, verifica:

1. ✅ Los datos se guardan en Supabase (revisa las tablas en el dashboard)
2. ✅ Las órdenes aparecen en el monitor
3. ✅ Los usuarios pueden autenticarse con sus contraseñas
4. ✅ Los cambios se sincronizan entre dispositivos
5. ✅ El historial de auditoría funciona correctamente

## 🔐 SEGURIDAD

### Políticas RLS (Row Level Security)

Las tablas tienen políticas que permiten acceso completo para:
- Usuarios autenticados (`authenticated`)
- Usuarios anónimos (`anon`)

**IMPORTANTE:** Para producción, deberías restringir estas políticas:

```sql
-- Ejemplo: Solo permitir a usuarios ver su propia sucursal
CREATE POLICY "Users can only see their branch orders" ON monitor_orders
    FOR SELECT
    TO authenticated
    USING (branchId = (auth.jwt() -> 'user_metadata' ->> 'branchId')::bigint);
```

## 🐛 TROUBLESHOOTING

### Error: "relation does not exist"
- Asegúrate de haber ejecutado el script SQL completo
- Verifica que las tablas se crearon correctamente en el dashboard

### Error: "permission denied"
- Revisa las políticas RLS de las tablas
- Verifica que las credenciales de Supabase sean correctas

### Los datos no se actualizan
- Verifica la conexión a internet
- Revisa la consola del navegador para errores
- Asegúrate de que el servicio monitorService esté importado correctamente

## 📝 NOTAS ADICIONALES

- **Compatibilidad**: El sistema mantiene compatibilidad con localStorage como fallback
- **Migración gradual**: Puedes migrar progresivamente, manteniendo localStorage hasta confirmar que Supabase funciona
- **Backup**: Antes de migrar, exporta los datos de localStorage por seguridad

## 🚀 VENTAJAS DE LA MIGRACIÓN

1. ✅ **Acceso desde cualquier dispositivo** - Los datos están en la nube
2. ✅ **Sincronización en tiempo real** - Múltiples usuarios ven los mismos datos
3. ✅ **Backup automático** - Supabase hace backups regulares
4. ✅ **Escalabilidad** - Soporta muchos más usuarios y órdenes
5. ✅ **Auditoría mejorada** - Historial completo en base de datos
