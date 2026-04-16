// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_ACCESS_TOKEN = Deno.env.get('EXPO_ACCESS_TOKEN');

serve(async (req) => {
  try {
    const { record, old_record } = await req.json();

    // Check if status changed
    if (!old_record || old_record.status === record.status) {
      return new Response('Status unchanged, no notification sent', { status: 200 });
    }

    // Set up Supabase admin client to fetch user push token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const messages = [];

    // --- 1. NOTIFY RIDER (IF CONFIRMED) ---
    if (record.status === 'confirmed') {
      // Fetch all riders' tokens (where role = 'rider' in user_profiles)
      const { data: riders } = await supabaseClient
        .from('user_profiles')
        .select('id, role')
        .eq('role', 'rider');
      
      if (riders && riders.length > 0) {
        const riderIds = riders.map(r => r.id);
        const { data: pushTokensData } = await supabaseClient
          .from('users')
          .select('push_token')
          .in('id', riderIds)
          .not('push_token', 'is', null);

        if (pushTokensData) {
          for (const row of pushTokensData) {
            messages.push({
              to: row.push_token,
              sound: 'default',
              title: 'New Delivery Available! ⚡',
              body: 'A new order is ready for pickup in your area.',
              data: { orderId: record.id, type: 'rider_alert' },
            });
          }
        }
      }
    }

    // --- 2. NOTIFY CUSTOMER ---
    const { data: customerData } = await supabaseClient
      .from('user_profiles')
      .select('push_token')
      .eq('id', record.user_id)
      .single();

    if (customerData?.push_token) {
      let title = 'Order Update';
      let body = `Your order status changed to ${record.status}`;

      if (record.status === 'confirmed') {
        title = 'Order Confirmed! 🎉';
        body = 'Your order is being prepared by our dark store team.';
      } else if (record.status === 'out_for_delivery') {
        title = 'Rider is on the way 🛵';
        body = 'Your rider has picked up the order and is heading to you.';
      } else if (record.status === 'delivered') {
        title = 'Order Delivered ✅';
        body = 'Enjoy your groceries! Tap to leave a quick review.';
      }

      messages.push({
        to: customerData.push_token,
        sound: 'default',
        title,
        body,
        data: { orderId: record.id, type: 'customer_alert' },
      });
    }

    if (messages.length === 0) {
      return new Response('No push tokens found to notify', { status: 200 });
    }

    // --- 3. SEND TO EXPO ---
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${EXPO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(error);
    return new Response('Internal Server Error', { status: 500 });
  }
});
