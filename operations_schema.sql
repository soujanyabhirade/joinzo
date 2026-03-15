-- BUILD: 2026-03-15: MVP Operations Schema

-- 🏢 1. WAREHOUSES
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location GEOGRAPHY(POINT) NOT NULL,
    service_radius_meters INTEGER DEFAULT 3000,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 📦 2. INVENTORY (Linked to Warehouse)
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL, -- Links to existing products table
    stock_count INTEGER DEFAULT 0,
    expiry_date DATE,
    alert_threshold INTEGER DEFAULT 10,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(warehouse_id, product_id)
);

-- 🛵 3. RIDER SESSIONS & OCCUPANCY
CREATE TABLE rider_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID NOT NULL,
    current_warehouse_id UUID REFERENCES warehouses(id),
    status TEXT CHECK (status IN ('idle', 'busy', 'offline')) DEFAULT 'offline',
    last_location GEOGRAPHY(POINT),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 🏘️ 4. ORDER BATCHES (Clustering)
CREATE TABLE order_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID REFERENCES warehouses(id),
    building_id UUID, -- For targeted gate-drop optimization
    status TEXT CHECK (status IN ('forming', 'assigned', 'dispatched', 'completed')) DEFAULT 'forming',
    rider_id UUID REFERENCES rider_sessions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 📊 5. ANALYTICS: LOOP PARTICIPATION
CREATE TABLE community_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    total_orders INTEGER DEFAULT 0,
    loop_participation_rate DECIMAL(5,2),
    collective_savings DECIMAL(12,2) DEFAULT 0,
    UNIQUE(building_id, date)
);
