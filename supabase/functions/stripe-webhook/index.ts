import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { handleError } from "../_shared/error-handler.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    let event: Stripe.Event;
    
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    console.log("Webhook event received:", event.type);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle payment success
    if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
      const session = event.data.object as any;
      
      console.log("Payment successful for session:", session.id);

      // Extract order ID from metadata (secure matching)
      const orderId = session.metadata?.order_id;
      
      if (!orderId) {
        console.error("Missing order_id in payment metadata");
        throw new Error("Invalid payment session - missing order reference");
      }

      console.log("Looking up order by ID:", orderId);

      // Find the specific order by ID
      const { data: matchedOrder, error: findError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("order_status", "pending")
        .single();

      if (findError) {
        console.error("Error finding order:", findError);
        throw findError;
      }

      if (!matchedOrder) {
        console.error("No pending order found with ID:", orderId);
        throw new Error("Order not found or already processed");
      }

      if (matchedOrder) {
        // Update order status to paid
        const { error: updateError } = await supabase
          .from("orders")
          .update({ order_status: "paid" })
          .eq("id", matchedOrder.id);

        if (updateError) {
          console.error("Error updating order status:", updateError);
          throw updateError;
        }

        console.log("Order status updated to paid:", matchedOrder.id);

        // Send payment confirmation email to customer
        const customerEmailHtml = `
          <h1>Payment Received!</h1>
          <p>Dear ${matchedOrder.customer_name},</p>
          <p>Thank you! We've received your payment and your custom 3D model is now in production.</p>
          
          <h2>Order Details</h2>
          <ul>
            <li><strong>Order ID:</strong> ${matchedOrder.id}</li>
            <li><strong>Size:</strong> ${matchedOrder.order_size}</li>
            <li><strong>Amount Paid:</strong> £${matchedOrder.order_price.toFixed(2)}</li>
          </ul>

          <h2>What's Next?</h2>
          <p>Our team is now working on bringing your creation to life. We'll keep you updated on the production progress and notify you when your model is ready to ship.</p>

          <p>Best regards,<br>The BuzzyMuzzy Team</p>
        `;

        await resend.emails.send({
          from: "BuzzyMuzzy <orders@buzzymuzzy.com>",
          to: [matchedOrder.customer_email],
          subject: "Payment Confirmed - Production Starting!",
          html: customerEmailHtml,
        });

        console.log("Payment confirmation email sent to customer");

        // Send notification to admin
        const adminEmailHtml = `
          <h1>Payment Received for Order #${matchedOrder.id}</h1>
          
          <h2>Customer Details</h2>
          <ul>
            <li><strong>Name:</strong> ${matchedOrder.customer_name}</li>
            <li><strong>Email:</strong> ${matchedOrder.customer_email}</li>
            <li><strong>Phone:</strong> ${matchedOrder.customer_phone || 'N/A'}</li>
          </ul>

          <h2>Order Details</h2>
          <ul>
            <li><strong>Order ID:</strong> ${matchedOrder.id}</li>
            <li><strong>Size:</strong> ${matchedOrder.order_size}</li>
            <li><strong>Amount:</strong> £${matchedOrder.order_price.toFixed(2)}</li>
            <li><strong>Status:</strong> ✅ PAID - Ready for Production</li>
          </ul>

          <h2>Generated 3D Concept</h2>
          <img src="${matchedOrder.generated_concept_url}" alt="3D Concept" style="max-width: 600px; border-radius: 8px;" />

          <p><strong>Description:</strong> ${matchedOrder.ai_description}</p>

          <p style="margin-top: 30px; color: #16a34a; font-weight: bold;">This order has been paid and is ready to begin production!</p>
        `;

        const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
        if (adminEmail) {
          await resend.emails.send({
            from: "BuzzyMuzzy Orders <orders@buzzymuzzy.com>",
            to: [adminEmail],
            subject: `💰 Payment Received - Order #${matchedOrder.id}`,
            html: adminEmailHtml,
          });
          console.log("Admin notification email sent");
        } else {
          console.warn("ADMIN_NOTIFICATION_EMAIL not configured - skipping admin notification");
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    const requestId = crypto.randomUUID();
    const { response, status } = handleError(error, requestId);
    
    return new Response(
      JSON.stringify(response),
      {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
