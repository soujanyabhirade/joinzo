import { supabase } from './supabase';

export interface OrderBatch {
    building_id: string;
    gate_id: string;
    orders: any[];
}

export class OrderBatcher {
    /**
     * Logic to group pending orders by their building/gate
     * to enable clustered 10-minute deliveries.
     */
    static async getBatchesForWarehouse(warehouseId: string): Promise<OrderBatch[]> {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('warehouse_id', warehouseId)
            .eq('status', 'packed');

        if (error || !orders) return [];

        // Simple clustering logic: group by building_id
        const batches: Record<string, any[]> = {};
        orders.forEach(order => {
            const buildingId = order.building_id || 'unassigned';
            if (!batches[buildingId]) batches[buildingId] = [];
            batches[buildingId].push(order);
        });

        return Object.keys(batches).map(buildingId => ({
            building_id: buildingId,
            gate_id: 'main_gate', // Placeholder for granular gate logic
            orders: batches[buildingId]
        }));
    }

    /**
     * Assigns a batch to a rider and updates statuses
     */
    static async assignBatchToRider(batchId: string, riderId: string) {
        // Implementation of database sync for batch assignment
        const { error } = await supabase
            .from('order_batches')
            .update({ 
                rider_id: riderId, 
                status: 'assigned' 
            })
            .eq('id', batchId);
            
        return !error;
    }
}
