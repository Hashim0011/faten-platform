import { supabase } from './supabase';

/**
 * توليد وإرسال OTP للمستخدم
 */
export async function generateAndSendOTP(
  userId: string,
  email: string,
  fullName: string
): Promise<{ success: boolean; otp?: string; error?: string }> {
  try {
    // 1. توليد OTP في قاعدة البيانات
    const { data: otpData, error: otpError } = await supabase.rpc('generate_new_otp', {
      p_user_id: userId,
      p_email: email,
    });

    if (otpError) {
      console.error('Error generating OTP:', otpError);
      return { success: false, error: 'فشل في توليد رمز التحقق' };
    }

    const otpCode = otpData[0]?.otp_code;

    if (!otpCode) {
      console.error('❌ فشل في توليد OTP - البيانات المرجعة:', otpData);
      return { success: false, error: 'فشل في توليد رمز التحقق' };
    }

    // طباعة OTP بشكل واضح جداً في Console
    console.log('\n\n');
    console.log('═════════════════════════════════════════════════════');
    console.log('🔐 رمز التحقق الخاص بك (OTP CODE):');
    console.log('═════════════════════════════════════════════════════');
    console.log('');
    console.log('%c📱 OTP: ' + otpCode, 'color: #22c55e; font-size: 24px; font-weight: bold;');
    console.log('');
    console.log('📧 Email:', email);
    console.log('👤 Name:', fullName);
    console.log('⏰ Valid for: 10 minutes');
    console.log('');
    console.log('═════════════════════════════════════════════════════');
    console.log('\n\n');

    // 2. إرسال OTP عبر البريد الإلكتروني باستخدام n8n webhook
    try {
      const webhookUrl = '/api/webhook';

      const emailResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'otp_verification',
          email: email,
          fullName: fullName,
          otpCode: otpCode,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!emailResponse.ok) {
        console.warn('⚠️ فشل إرسال البريد الإلكتروني، لكن الرمز متاح في الكونسول');
        // لا نفشل العملية كلها، الرمز موجود في قاعدة البيانات
      } else {
        console.log('✅ تم إرسال البريد الإلكتروني بنجاح');
      }
    } catch (emailError) {
      console.warn('⚠️ خطأ في إرسال البريد الإلكتروني:', emailError);
      // لا نفشل العملية كلها، الرمز موجود في قاعدة البيانات
    }

    return { success: true, otp: otpCode };
  } catch (error: any) {
    console.error('Error in generateAndSendOTP:', error);
    return { success: false, error: error.message || 'حدث خطأ غير متوقع' };
  }
}

/**
 * التحقق من OTP
 */
export async function verifyOTP(
  email: string,
  otpCode: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('verify_otp', {
      p_email: email,
      p_otp_code: otpCode,
    });

    if (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, error: 'فشل في التحقق من الرمز' };
    }

    const result = data[0];

    if (!result || !result.is_valid) {
      return {
        success: false,
        error: result?.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية',
      };
    }

    return {
      success: true,
      userId: result.user_id,
    };
  } catch (error: any) {
    console.error('Error in verifyOTP:', error);
    return { success: false, error: error.message || 'حدث خطأ غير متوقع' };
  }
}

/**
 * إعادة إرسال OTP
 */
export async function resendOTP(
  userId: string,
  email: string,
  fullName: string
): Promise<{ success: boolean; error?: string }> {
  return generateAndSendOTP(userId, email, fullName);
}

/**
 * حذف الأكواد المنتهية
 */
export async function deleteExpiredOTPs(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('delete_expired_otp_codes');

    if (error) {
      console.error('Error deleting expired OTPs:', error);
      return { success: false, error: 'فشل في حذف الأكواد المنتهية' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteExpiredOTPs:', error);
    return { success: false, error: error.message || 'حدث خطأ غير متوقع' };
  }
}

/**
 * الحصول على آخر OTP للمستخدم (للتطوير فقط)
 */
export async function getLatestOTP(
  userId: string
): Promise<{ success: boolean; otp?: string; expiresAt?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('otp_codes')
      .select('otp_code, expires_at, is_used')
      .eq('user_id', userId)
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'لا يوجد رمز تحقق نشط' };
      }
      console.error('Error getting latest OTP:', error);
      return { success: false, error: 'فشل في الحصول على رمز التحقق' };
    }

    return {
      success: true,
      otp: data.otp_code,
      expiresAt: data.expires_at,
    };
  } catch (error: any) {
    console.error('Error in getLatestOTP:', error);
    return { success: false, error: error.message || 'حدث خطأ غير متوقع' };
  }
}
