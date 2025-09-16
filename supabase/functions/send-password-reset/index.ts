import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { email, resetUrl }: PasswordResetRequest = await req.json();

    if (!email || !resetUrl) {
      return new Response(
        JSON.stringify({ error: "Email and resetUrl are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending password reset email to: ${email}`);

    const emailResponse = await resend.emails.send({
      from: "GOLFIT Argentina <onboarding@resend.dev>",
      to: [email],
      subject: "Recuperación de Contraseña - GOLFIT Argentina",
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperación de Contraseña</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏌️ GOLFIT Argentina</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Tu app de golf favorita</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #22c55e; margin-top: 0;">Recuperación de Contraseña</h2>
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en GOLFIT Argentina.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; transition: all 0.3s ease;">
                Restablecer Contraseña
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
            </p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-size: 12px;">
              ${resetUrl}
            </p>
          </div>
          
          <div style="border-top: 2px solid #e9ecef; padding-top: 20px; text-align: center;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
            </p>
            <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">
              Este enlace expirará en 24 horas por seguridad.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2025 GOLFIT Argentina. Todos los derechos reservados.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);
    
    // Check if there was an error from Resend
    if (emailResponse.error) {
      throw new Error(`Resend API error: ${emailResponse.error.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.data?.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send password reset email",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);