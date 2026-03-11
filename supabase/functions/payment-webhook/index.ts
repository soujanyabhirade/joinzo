// @ts-nocheck
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // 1. Handle CORS Preflight Requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 2. Parse the webhook payload
        const reqBody = await req.json();

        // **MOCK SIGNATURE VERIFICATION**
        // In reality, use Stripe's webhooks.constructEvent using Deno crypto.
        const webhookSignature = req.headers.get("stripe-signature");
        if (!webhookSignature) {
            throw new Error("Missing Signature");
        }

        // 3. Setup Supabase Admin Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 4. Handle Mock 'payment_intent.succeeded' event
        const { eventType, orderId, paymentIntentId } = reqBody;

        if (eventType === "payment.success" && orderId) {
            // 5. Update Order Status in Database
            const { error: dbError } = await supabase
                .from('orders')
                .update({
                    status: 'packed', // Instantly move to packed / processing
                    transaction_id: paymentIntentId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId);

            if (dbError) throw dbError;

            console.log(`Order ${orderId} marked as Payment Successful.`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error("Webhook Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
