-- ============================================
-- MIGRACIÓN MONITOR A SUPABASE
-- Base de datos para sistema de monitor de órdenes/turnos
-- ============================================

-- Habilitar Row Level Security (RLS) para todas las tablas
-- Por ahora, las políticas permitirán acceso completo a usuarios autenticados

-- ============================================
-- 1. TABLA: monitor_branches (Sucursales)
-- ============================================
CREATE TABLE IF NOT EXISTS monitor_branches (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para branches
ALTER TABLE monitor_branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON monitor_branches
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Permitir acceso anónimo temporal (cambiar según requisitos)
CREATE POLICY "Allow all operations for anon users" ON monitor_branches
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- ============================================
-- 2. TABLA: monitor_users (Usuarios del monitor)
-- ============================================
CREATE TABLE IF NOT EXISTS monitor_users (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    pass TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'creator', 'technician')),
    branch_id BIGINT REFERENCES monitor_branches(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para users
ALTER TABLE monitor_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON monitor_users
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for anon users" ON monitor_users
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- ============================================
-- 3. TABLA: monitor_categories (Categorías de órdenes)
-- ============================================
CREATE TABLE IF NOT EXISTS monitor_categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    t_or INTEGER NOT NULL DEFAULT 2,  -- Tiempo para estado naranja (minutos)
    t_re INTEGER NOT NULL DEFAULT 5,  -- Tiempo para estado rojo (minutos)
    t_cr INTEGER NOT NULL DEFAULT 10, -- Tiempo para estado crítico (minutos)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para categories
ALTER TABLE monitor_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON monitor_categories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for anon users" ON monitor_categories
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- ============================================
-- 4. TABLA: monitor_technicians (Técnicos)
-- ============================================
CREATE TABLE IF NOT EXISTS monitor_technicians (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para technicians
ALTER TABLE monitor_technicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON monitor_technicians
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for anon users" ON monitor_technicians
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- ============================================
-- 5. TABLA: monitor_orders (Órdenes activas)
-- ============================================
CREATE TABLE IF NOT EXISTS monitor_orders (
    id INTEGER PRIMARY KEY,  -- Número de orden (ingresado por usuario)
    tech TEXT NOT NULL,
    cat_id BIGINT REFERENCES monitor_categories(id) ON DELETE SET NULL,
    creator TEXT NOT NULL,
    branch_id BIGINT REFERENCES monitor_branches(id) ON DELETE CASCADE,
    start BIGINT NOT NULL,  -- Timestamp en milisegundos
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para orders
ALTER TABLE monitor_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON monitor_orders
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for anon users" ON monitor_orders
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- ============================================
-- 6. TABLA: monitor_history (Historial/Auditoría)
-- ============================================
CREATE TABLE IF NOT EXISTS monitor_history (
    id BIGSERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,  -- ID de la orden eliminada
    tech TEXT NOT NULL,
    cat_id BIGINT,
    creator TEXT NOT NULL,
    branch_id BIGINT REFERENCES monitor_branches(id) ON DELETE SET NULL,
    start BIGINT NOT NULL,
    deleted_by TEXT NOT NULL,
    deleted_at BIGINT NOT NULL,  -- Timestamp en milisegundos
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para history
ALTER TABLE monitor_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON monitor_history
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for anon users" ON monitor_history
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- ============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_monitor_orders_branch ON monitor_orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_monitor_orders_start ON monitor_orders(start);
CREATE INDEX IF NOT EXISTS idx_monitor_history_branch ON monitor_history(branch_id);
CREATE INDEX IF NOT EXISTS idx_monitor_history_deleted_at ON monitor_history(deleted_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitor_users_branch ON monitor_users(branch_id);

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar sucursales por defecto
INSERT INTO monitor_branches (name) VALUES 
    ('Huérfanos'),
    ('Mojitas'),
    ('Apumanque')
ON CONFLICT (name) DO NOTHING;

-- Insertar categoría por defecto
INSERT INTO monitor_categories (name, t_or, t_re, t_cr) VALUES 
    ('General', 2, 5, 10)
ON CONFLICT DO NOTHING;

-- Insertar técnico por defecto
INSERT INTO monitor_technicians (name) VALUES 
    ('fulanito')
ON CONFLICT DO NOTHING;

-- Insertar usuario admin por defecto (vinculado a sucursal Huérfanos)
INSERT INTO monitor_users (name, pass, role, branch_id) VALUES 
    ('admin', '1234', 'admin', 1)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE monitor_branches IS 'Sucursales/ubicaciones del negocio';
COMMENT ON TABLE monitor_users IS 'Usuarios que pueden acceder al monitor';
COMMENT ON TABLE monitor_categories IS 'Categorías de órdenes con tiempos de alerta';
COMMENT ON TABLE monitor_technicians IS 'Técnicos disponibles para asignar a órdenes';
COMMENT ON TABLE monitor_orders IS 'Órdenes/turnos activos en el monitor';
COMMENT ON TABLE monitor_history IS 'Historial de órdenes eliminadas para auditoría';
