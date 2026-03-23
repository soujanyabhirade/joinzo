-- Enable Realtime for the generic products table
-- This allows our frontend listeners to receive instant WebSocket updates on row changes
alter publication supabase_realtime add table products;
