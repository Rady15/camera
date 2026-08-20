/**
 * Email Service using Resend
 * Documentation: https://resend.com/docs
 */

import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@securecam.com'

// Email Types
export interface EmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  shipping: number
  discount?: number
  total: number
  shippingAddress: {
    street: string
    city: string
    state: string
    phone: string
  }
  paymentMethod: string
}

export interface WelcomeEmailData {
  name: string
  email: string
}

/**
 * Send a generic email
 */
export async function sendEmail(params: EmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
      reply_to: params.replyTo,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean }> {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>مرحباً بك في SecureCam</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0;">🎥 SecureCam Egypt</h1>
      </div>
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1e3a5f;">مرحباً ${data.name}! 👋</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          شكراً لإنشاء حسابك في SecureCam Egypt! نحن سعداء بانضمامك إلينا.
        </p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          يمكنك الآن تصفح مجموعتنا الواسعة من كاميرات المراقبة وأنظمة الأمان بأفضل الأسعار.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" 
             style="background: #1e3a5f; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            تصفح المنتجات
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 14px;">
          مع تحيات,<br>
          فريق SecureCam Egypt
        </p>
      </div>
    </body>
    </html>
  `

  const result = await sendEmail({
    to: data.email,
    subject: 'مرحباً بك في SecureCam Egypt! 🎥',
    html,
  })

  return { success: result.success }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<{ success: boolean }> {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">${item.price.toLocaleString('ar-EG')} ريال</td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>تأكيد الطلب #${data.orderNumber}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0;">🎥 SecureCam Egypt</h1>
      </div>
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1e3a5f;">تم استلام طلبك بنجاح! ✅</h2>
        <p style="color: #333; font-size: 16px;">
          مرحباً ${data.customerName}،
        </p>
        <p style="color: #333; font-size: 16px;">
          شكراً لتسوقك معنا! تم استلام طلبك رقم <strong>#${data.orderNumber}</strong>
        </p>
        
        <h3 style="color: #1e3a5f; margin-top: 30px;">📦 تفاصيل الطلب:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background: #1e3a5f; color: #fff;">
              <th style="padding: 10px;">المنتج</th>
              <th style="padding: 10px;">الكمية</th>
              <th style="padding: 10px;">السعر</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background: #fff; border-radius: 5px;">
          <p style="margin: 5px 0; display: flex; justify-content: space-between;">
            <span>المجموع الفرعي:</span>
            <span>${data.subtotal.toLocaleString('ar-EG')} ريال</span>
          </p>
          ${data.discount ? `
          <p style="margin: 5px 0; display: flex; justify-content: space-between; color: #22c55e;">
            <span>الخصم:</span>
            <span>-${data.discount.toLocaleString('ar-EG')} ريال</span>
          </p>
          ` : ''}
          <p style="margin: 5px 0; display: flex; justify-content: space-between;">
            <span>الشحن:</span>
            <span>${data.shipping.toLocaleString('ar-EG')} ريال</span>
          </p>
          <hr style="margin: 10px 0;">
          <p style="margin: 5px 0; display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
            <span>الإجمالي:</span>
            <span style="color: #1e3a5f;">${data.total.toLocaleString('ar-EG')} ريال</span>
          </p>
        </div>
        
        <h3 style="color: #1e3a5f; margin-top: 30px;">📍 عنوان التوصيل:</h3>
        <div style="padding: 15px; background: #fff; border-radius: 5px;">
          <p style="margin: 5px 0;">${data.shippingAddress.street}</p>
          <p style="margin: 5px 0;">${data.shippingAddress.city}, ${data.shippingAddress.state}</p>
          <p style="margin: 5px 0;">📞 ${data.shippingAddress.phone}</p>
        </div>
        
        <p style="color: #666; margin-top: 30px; font-size: 14px;">
          طريقة الدفع: ${data.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : data.paymentMethod}
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 14px;">
          للاستفسار، يرجى التواصل معنا عبر:<br>
          📧 support@securecam.com<br>
          📞 +20 100 123 4567
        </p>
      </div>
    </body>
    </html>
  `

  const result = await sendEmail({
    to: data.customerEmail,
    subject: `تأكيد الطلب #${data.orderNumber} - SecureCam Egypt`,
    html,
  })

  return { success: result.success }
}

/**
 * Send order status update email
 */
export async function sendOrderStatusEmail(data: {
  orderNumber: string
  customerName: string
  customerEmail: string
  status: string
  trackingNumber?: string
  trackingUrl?: string
}): Promise<{ success: boolean }> {
  const statusMessages: Record<string, { title: string; message: string }> = {
    confirmed: {
      title: 'تم تأكيد طلبك ✓',
      message: 'جاري تجهيز طلبك وسيتم شحنه قريباً.',
    },
    shipped: {
      title: 'تم شحن طلبك 🚚',
      message: 'طلبك في الطريق إليك!',
    },
    delivered: {
      title: 'تم تسليم طلبك 📦',
      message: 'نشكرك للتسوق معنا!',
    },
    cancelled: {
      title: 'تم إلغاء طلبك ❌',
      message: 'تم إلغاء طلبك بناءً على طلبك.',
    },
  }

  const statusInfo = statusMessages[data.status] || {
    title: `تحديث الطلب: ${data.status}`,
    message: 'تم تحديث حالة طلبك.',
  }

  const trackingHtml = data.trackingNumber ? `
    <div style="padding: 15px; background: #fff; border-radius: 5px; margin-top: 15px;">
      <p style="margin: 5px 0;"><strong>رقم التتبع:</strong> ${data.trackingNumber}</p>
      ${data.trackingUrl ? `
      <a href="${data.trackingUrl}" style="display: inline-block; margin-top: 10px; background: #1e3a5f; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        تتبع الشحنة
      </a>
      ` : ''}
    </div>
  ` : ''

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>${statusInfo.title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0;">🎥 SecureCam Egypt</h1>
      </div>
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1e3a5f;">${statusInfo.title}</h2>
        <p style="color: #333; font-size: 16px;">
          مرحباً ${data.customerName}،
        </p>
        <p style="color: #333; font-size: 16px;">
          ${statusInfo.message}
        </p>
        <p style="color: #666; font-size: 14px;">
          رقم الطلب: <strong>#${data.orderNumber}</strong>
        </p>
        ${trackingHtml}
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 14px;">
          مع تحيات,<br>
          فريق SecureCam Egypt
        </p>
      </div>
    </body>
    </html>
  `

  const result = await sendEmail({
    to: data.customerEmail,
    subject: `${statusInfo.title} - الطلب #${data.orderNumber}`,
    html,
  })

  return { success: result.success }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(data: {
  name: string
  email: string
  resetUrl: string
}): Promise<{ success: boolean }> {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>إعادة تعيين كلمة المرور</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0;">🎥 SecureCam Egypt</h1>
      </div>
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1e3a5f;">إعادة تعيين كلمة المرور</h2>
        <p style="color: #333; font-size: 16px;">
          مرحباً ${data.name}،
        </p>
        <p style="color: #333; font-size: 16px;">
          لقد طلبت إعادة تعيين كلمة المرور الخاصة بك. اضغط على الزر أدناه لإنشاء كلمة مرور جديدة:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetUrl}" 
             style="background: #1e3a5f; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            إعادة تعيين كلمة المرور
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          هذا الرابط صالح لمدة ساعة واحدة فقط. إذا لم تطلب هذا التغيير، يمكنك تجاهل هذا البريد.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 14px;">
          فريق SecureCam Egypt
        </p>
      </div>
    </body>
    </html>
  `

  const result = await sendEmail({
    to: data.email,
    subject: 'إعادة تعيين كلمة المرور - SecureCam Egypt',
    html,
  })

  return { success: result.success }
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}
