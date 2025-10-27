import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  otp: string;
  fullName: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, otp, fullName }: EmailRequest = await req.json();

    if (!to || !otp) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Send email using Supabase's built-in email service
    // For now, we'll just log it and return success
    // In production, integrate with Resend or another email service
    
    console.log('Sending OTP Email:');
    console.log('To:', to);
    console.log('OTP:', otp);
    console.log('Full Name:', fullName);

    // Email HTML content
    const emailHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f0;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(135deg, #8B7355 0%, #D4AF37 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
          }
          .title {
            color: #2D2D2D;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #6B7280;
            font-size: 14px;
          }
          .otp-box {
            background: linear-gradient(135deg, #8B7355 0%, #654321 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 48px;
            font-weight: bold;
            color: white;
            letter-spacing: 8px;
            margin: 0;
          }
          .otp-label {
            color: rgba(255,255,255,0.8);
            font-size: 14px;
            margin-top: 10px;
          }
          .message {
            color: #2D2D2D;
            font-size: 16px;
            line-height: 1.6;
            text-align: center;
            margin: 20px 0;
          }
          .warning {
            background: #FEF3C7;
            border-radius: 8px;
            padding: 15px;
            color: #92400E;
            font-size: 14px;
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #6B7280;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🛡️ فطن</div>
            <h1 class="title">رمز التحقق من الهوية</h1>
            <p class="subtitle">مرحباً ${fullName || 'المستخدم'}</p>
          </div>

          <p class="message">
            لإكمال عملية التسجيل في منصة فطن، يرجى استخدام رمز التحقق التالي:
          </p>

          <div class="otp-box">
            <h2 class="otp-code">${otp}</h2>
            <p class="otp-label">رمز التحقق صالح لمدة 10 دقائق</p>
          </div>

          <div class="warning">
            ⚠️ لا تشارك هذا الرمز مع أي شخص. فريق فطن لن يطلب منك هذا الرمز أبداً.
          </div>

          <p class="message">
            إذا لم تقم بطلب هذا الرمز، يرجى تجاهل هذه الرسالة.
          </p>

          <div class="footer">
            <p>© 2025 منصة فطن - الأمن الفكري</p>
            <p>هذه رسالة تلقائية، يرجى عدم الرد عليها</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // TODO: Integrate with Resend or another email service
    // For now, return success with the OTP (for testing)
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP sent successfully (logged to console)',
        // Remove this in production
        otp: otp,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send OTP',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});