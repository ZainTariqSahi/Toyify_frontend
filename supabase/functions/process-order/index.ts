import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { checkRateLimit } from "../_shared/rate-limit.ts";
import {
  validateEmail,
  validatePhone,
  validateString,
  sanitizeString,
  validateOrderSize,
  validateOrderQuantity,
  calculateExpectedPrice
} from "../_shared/validation.ts";
import { handleError } from "../_shared/error-handler.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderRequest {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddress: string;
  originalImageBase64: string;
  aiDescription: string;
  orderSize: string;
  orderQuantity: number;
  orderPrice: number;
  freeShipping: boolean;
  paymentLink?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authenticated user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    // Rate limiting - 3 orders per 5 minutes per IP
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    if (!checkRateLimit(clientIP, 3, 300000)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many orders. Please try again in a few minutes." }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderData: OrderRequest = await req.json();
    
    // Input validation
    const nameValidation = validateString(orderData.customerName, 2, 100, 'Name');
    if (!nameValidation.valid) {
      return new Response(
        JSON.stringify({ error: nameValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!validateEmail(orderData.customerEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (orderData.customerPhone && !validatePhone(orderData.customerPhone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const addressValidation = validateString(orderData.deliveryAddress, 10, 500, 'Address');
    if (!addressValidation.valid) {
      return new Response(
        JSON.stringify({ error: addressValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!validateOrderSize(orderData.orderSize)) {
      return new Response(
        JSON.stringify({ error: 'Invalid order size' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!validateOrderQuantity(orderData.orderQuantity)) {
      return new Response(
        JSON.stringify({ error: 'Invalid order quantity (1-100)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Server-side price validation to prevent manipulation
    const expectedPrice = calculateExpectedPrice(
      orderData.orderSize,
      orderData.orderQuantity,
      orderData.freeShipping
    );
    
    if (Math.abs(orderData.orderPrice - expectedPrice) > 0.01) {
      console.warn(`Price mismatch detected: expected ${expectedPrice}, got ${orderData.orderPrice}`);
      return new Response(
        JSON.stringify({ error: 'Price validation failed. Please refresh and try again.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Sanitize string inputs
    orderData.customerName = sanitizeString(orderData.customerName);
    orderData.customerEmail = sanitizeString(orderData.customerEmail);
    orderData.deliveryAddress = sanitizeString(orderData.deliveryAddress);
    if (orderData.customerPhone) {
      orderData.customerPhone = sanitizeString(orderData.customerPhone);
    }
    
    console.log("Processing order for:", orderData.customerEmail);

    // Use service role for storage operations (authenticated client for user-scoped operations)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Upload original image to storage
    const originalImageBuffer = Uint8Array.from(
      atob(orderData.originalImageBase64.split(",")[1]),
      (c) => c.charCodeAt(0)
    );
    const originalImagePath = `orders/${crypto.randomUUID()}.png`;
    
    const { data: originalUploadData, error: originalUploadError } = await supabaseService
      .storage
      .from("concept-images")
      .upload(originalImagePath, originalImageBuffer, {
        contentType: "image/png",
      });

    if (originalUploadError) {
      console.error("Error uploading original image:", originalUploadError);
      throw originalUploadError;
    }

    // Generate permanent public URL (protected by RLS policies)
    const { data: originalPublicUrlData } = supabaseService.storage
      .from("concept-images")
      .getPublicUrl(originalImagePath);

    if (!originalPublicUrlData?.publicUrl) {
      throw new Error("Failed to get public URL for original image");
    }
    
    const originalImageUrl = originalPublicUrlData.publicUrl;
    console.log("Original image uploaded with permanent URL");

    // Step 2: Generate 3D concept image using Lovable AI (Gemini multimodal)
    console.log("Generating 3D concept image...");
    
    const prompt3D = `Transform this child's drawing into a professional product photograph of a real manufactured plush toy or figure.

CHARACTER DESCRIPTION: ${orderData.aiDescription}

CRITICAL TRANSFORMATION REQUIREMENTS:
- This must look like a REAL, PHYSICAL TOY photographed in a professional studio - NOT a drawing or illustration
- Use realistic plush toy materials: soft fleece, felt, fabric textures with visible stitching
- Show actual stuffing volume and three-dimensional form
- The toy should have that handcrafted, cuddly appearance of real manufactured plush toys

PHOTOGRAPHY STYLE:
- Professional product photography with studio lighting
- Soft, diffused lighting with gentle shadows on a clean surface
- Shallow depth of field (slight background blur)
- Clean, neutral background (white, cream, or soft pastel surface)
- Natural color grading like a high-end toy catalog photo

MATERIALS & TEXTURES:
- Visible fabric textures (fleece nap, felt smoothness, cotton weave)
- Realistic stitching details and seams
- Glass or plastic safety eyes with subtle reflections
- Soft, dimensional stuffing that gives natural volume
- Any hard parts (beaks, feet, accessories) should look like molded plastic or resin

TRANSFORMATION GOAL:
Take inspiration from the drawing's character and personality, but create what this would actually look like as a real, professionally manufactured and photographed plush toy product. Think premium toy brands like Jellycat, GUND, or Steiff.

The final image should be completely different from the drawing - it should look like a product photo you'd see on a toy store website.`;
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt3D
              },
              {
                type: "image_url",
                image_url: {
                  url: orderData.originalImageBase64
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error("AI rate limit exceeded. Please try again later.");
      }
      if (aiResponse.status === 402) {
        throw new Error("AI credits depleted. Please add credits to continue.");
      }
      const errorText = await aiResponse.text();
      console.error("AI generation error:", aiResponse.status, errorText);
      throw new Error("Failed to generate 3D concept image");
    }

    const aiData = await aiResponse.json();
    const generatedImageBase64 = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageBase64) {
      throw new Error("No image generated from AI");
    }

    console.log("3D concept image generated successfully");

    // Step 3: Upload generated concept image to storage
    const conceptImageBuffer = Uint8Array.from(
      atob(generatedImageBase64.split(",")[1]),
      (c) => c.charCodeAt(0)
    );
    const conceptImagePath = `orders/${crypto.randomUUID()}-concept.png`;
    
    const { data: conceptUploadData, error: conceptUploadError } = await supabaseService
      .storage
      .from("concept-images")
      .upload(conceptImagePath, conceptImageBuffer, {
        contentType: "image/png",
      });

    if (conceptUploadError) {
      console.error("Error uploading concept image:", conceptUploadError);
      throw conceptUploadError;
    }

    // Generate permanent public URL (protected by RLS policies)
    const { data: conceptPublicUrlData } = supabaseService.storage
      .from("concept-images")
      .getPublicUrl(conceptImagePath);
    
    if (!conceptPublicUrlData?.publicUrl) {
      throw new Error("Failed to get public URL for concept image");
    }
    
    const generatedConceptUrl = conceptPublicUrlData.publicUrl;
    console.log("Concept image uploaded with permanent URL");

    // Step 4: Create Stripe Payment Link
    console.log("Creating Stripe payment link...");
    
    const product = await stripe.products.create({
      name: `Custom 3D Model - ${orderData.orderSize} (Qty: ${orderData.orderQuantity})`,
      description: `${orderData.aiDescription}${orderData.freeShipping ? ' - FREE SHIPPING' : ''}`,
      images: [generatedConceptUrl],
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(orderData.orderPrice * 100), // Convert to pence
      currency: "gbp",
    });

    // Step 5: Save order to database using authenticated user's client
    const { data: orderRecord, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        delivery_address: orderData.deliveryAddress,
        original_image_url: originalImageUrl,
        ai_description: orderData.aiDescription,
        generated_concept_url: generatedConceptUrl,
        order_size: orderData.orderSize,
        order_quantity: orderData.orderQuantity,
        order_price: orderData.orderPrice,
        free_shipping: orderData.freeShipping,
        order_status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error saving order:", orderError);
      throw orderError;
    }

    console.log("Order saved to database:", orderRecord.id);

    // Create payment link with order ID in metadata for secure matching
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: {
        order_id: orderRecord.id,
      },
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${Deno.env.get("SUPABASE_URL")?.replace('https://szciplghslorfjqgmuxc.supabase.co', 'https://your-domain.com')}/thank-you`,
        },
      },
    });

    console.log("Payment link created:", paymentLink.url);

    // Update order with payment link using service role (RLS UPDATE policy allows service role)
    const { error: updateError } = await supabaseService
      .from("orders")
      .update({ payment_link: paymentLink.url })
      .eq("id", orderRecord.id);

    if (updateError) {
      console.error("Error updating order with payment link:", updateError);
      throw updateError;
    }

    console.log("Order updated with payment link");

    // Step 6: Send customer confirmation email
    const customerEmailHtml = `
      <h1>Thank You for Your Order!</h1>
      <p>Dear ${orderData.customerName},</p>
      <p>Thank you for your order! We're excited to bring your vision to life.</p>
      
      <h2>Order Summary</h2>
      <ul>
        <li><strong>Order ID:</strong> ${orderRecord.id}</li>
        <li><strong>Size:</strong> ${orderData.orderSize}</li>
        <li><strong>Quantity:</strong> ${orderData.orderQuantity}</li>
        <li><strong>Price:</strong> £${orderData.orderPrice.toFixed(2)}</li>
        ${orderData.freeShipping ? '<li><strong>Shipping:</strong> FREE 🎉</li>' : ''}
      </ul>

      <h2>Delivery Address</h2>
      <p>${orderData.deliveryAddress}</p>

      <h2>Your 3D Concept Preview</h2>
      <p>Here's what your custom 3D model will look like:</p>
      <img src="${generatedConceptUrl}" alt="3D Concept Preview" style="max-width: 600px; border-radius: 8px;" />
      
      <p><strong>Description:</strong> ${orderData.aiDescription}</p>

      <h2>Complete Your Payment</h2>
      <p>To proceed with production, please complete your payment:</p>
      <a href="${paymentLink.url}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">Pay Now - £${orderData.orderPrice.toFixed(2)}</a>

      <p style="margin-top: 30px;">If you're happy with this preview, please proceed with payment. If you have any questions or need adjustments, feel free to reply to this email.</p>

      <p>Best regards,<br>The BuzzyMuzzy Team</p>
    `;

    await resend.emails.send({
      from: "BuzzyMuzzy <orders@buzzymuzzy.com>",
      to: [orderData.customerEmail],
      subject: `Order Confirmation - Your 3D Model Preview`,
      html: customerEmailHtml,
    });

    console.log("Customer confirmation email sent");

    // Step 7: Send admin notification email
    const adminEmailHtml = `
      <h1>New Order Received</h1>
      
      <h2>Customer Details</h2>
      <ul>
        <li><strong>Name:</strong> ${orderData.customerName}</li>
        <li><strong>Email:</strong> ${orderData.customerEmail}</li>
        <li><strong>Phone:</strong> ${orderData.customerPhone || 'N/A'}</li>
        <li><strong>Delivery Address:</strong> ${orderData.deliveryAddress}</li>
      </ul>

      <h2>Order Details</h2>
      <ul>
        <li><strong>Order ID:</strong> ${orderRecord.id}</li>
        <li><strong>Size:</strong> ${orderData.orderSize}</li>
        <li><strong>Quantity:</strong> ${orderData.orderQuantity}</li>
        <li><strong>Price:</strong> £${orderData.orderPrice.toFixed(2)}</li>
        <li><strong>Free Shipping:</strong> ${orderData.freeShipping ? 'Yes 🎉' : 'No'}</li>
        <li><strong>Status:</strong> Pending Payment</li>
      </ul>

      <h2>Original Uploaded Image</h2>
      <img src="${originalImageUrl}" alt="Original Image" style="max-width: 400px; border-radius: 8px;" />

      <h2>AI-Generated Text Interpretation</h2>
      <p>${orderData.aiDescription}</p>

      <h2>Generated 3D Concept Image</h2>
      <img src="${generatedConceptUrl}" alt="Generated 3D Concept" style="max-width: 600px; border-radius: 8px;" />

      <p style="margin-top: 30px;">This order is ready for review. Once payment is received, production can begin.</p>
    `;

    const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
    if (adminEmail) {
      await resend.emails.send({
        from: "BuzzyMuzzy Orders <orders@buzzymuzzy.com>",
        to: [adminEmail],
        subject: `New Order #${orderRecord.id} - ${orderData.customerName}`,
        html: adminEmailHtml,
      });
      console.log("Admin notification email sent");
    } else {
      console.warn("ADMIN_NOTIFICATION_EMAIL not configured - skipping admin notification");
    }


    return new Response(
      JSON.stringify({
        success: true,
        orderId: orderRecord.id,
        generatedConceptUrl,
        message: "Order processed successfully. Confirmation emails sent.",
      }),
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
