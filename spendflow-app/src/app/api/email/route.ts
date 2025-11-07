import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.NEXT_PUBLIC_EMAIL_USER || 'spendflowapp@gmail.com',
    pass: process.env.NEXT_PUBLIC_EMAIL_PASS || 'ywir tomy ibjg czjm' // App password
  }
};

// Email templates
const EMAIL_TEMPLATES = {
  paymentFailed: {
    subject: 'Payment Failed - Action Required',
    html: (userName: string, cardName: string, amount: string, reason: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">SpendFlow Alert</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Payment Failed</h2>
          <p>Hi ${userName},</p>
          <p>Your automatic payment to <strong>${cardName}</strong> for <strong>$${amount}</strong> has failed.</p>
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Reason:</strong> ${reason}
          </div>
          <p>Please check your account balance and payment settings to avoid late fees.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
               style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Check Your Account
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `
  },

  paymentReminder: {
    subject: 'Payment Reminder - Due Soon',
    html: (userName: string, cardName: string, amount: string, daysUntilDue: number) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">SpendFlow Reminder</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Payment Due Soon</h2>
          <p>Hi ${userName},</p>
          <p>Your payment to <strong>${cardName}</strong> for <strong>$${amount}</strong> is due in <strong>${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}</strong>.</p>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>💳 Payment Details:</strong><br>
            Card: ${cardName}<br>
            Amount: $${amount}<br>
            Due: ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}
          </div>
          <p>Please ensure you have sufficient funds in your account to avoid late fees.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Account Details
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated reminder from SpendFlow.
          </p>
        </div>
      </div>
    `
  },

  paymentSuccess: {
    subject: 'Payment Processed Successfully',
    html: (userName: string, cardName: string, amount: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Payment Successful</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 48px;">✅</div>
          </div>
          <h2 style="color: #1f2937; margin-top: 0; text-align: center;">Payment Processed</h2>
          <p>Hi ${userName},</p>
          <p>Great news! Your automatic payment to <strong>${cardName}</strong> for <strong>$${amount}</strong> has been processed successfully.</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>✅ Payment Details:</strong><br>
            Card: ${cardName}<br>
            Amount: $${amount}<br>
            Status: Completed
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Transaction Details
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Thank you for using SpendFlow!
          </p>
        </div>
      </div>
    `
  },

  emailConfirmation: {
    subject: 'Confirm Your Email - SpendFlow',
    html: (userName: string, confirmationLink: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Verify Your Email</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${userName},</h2>
          <p>Welcome to SpendFlow! Please confirm your email address to get started.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationLink}"
               style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
              Confirm Email Address
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            Need help? Contact our support team.
          </p>
        </div>
      </div>
    `
  },

  passwordReset: {
    subject: 'Reset Your Password - SpendFlow',
    html: (userName: string, resetLink: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${userName},</h2>
          <p>You requested a password reset for your SpendFlow account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
               style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>🔒 Security Notice:</strong><br>
            This link will expire in 1 hour for your security.<br>
            If you didn't request this reset, please ignore this email.
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Need help? Contact our support team anytime.
          </p>
        </div>
      </div>
    `
  },
};

// Server-side email service
class ServerEmailService {
  private static transporter = nodemailer.createTransport(EMAIL_CONFIG);

  // Verify email configuration
  static async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connected successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }

  // Send payment failure notification
  static async sendPaymentFailure(
    userEmail: string,
    userName: string,
    cardName: string,
    amount: number,
    reason: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"SpendFlow" <${EMAIL_CONFIG.auth.user}>`,
        to: userEmail,
        subject: EMAIL_TEMPLATES.paymentFailed.subject,
        html: EMAIL_TEMPLATES.paymentFailed.html(userName, cardName, amount.toFixed(2), reason)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Payment failure email sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending payment failure email:', error);
      return false;
    }
  }

  // Send payment reminder
  static async sendPaymentReminder(
    userEmail: string,
    userName: string,
    cardName: string,
    amount: number,
    daysUntilDue: number
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"SpendFlow" <${EMAIL_CONFIG.auth.user}>`,
        to: userEmail,
        subject: EMAIL_TEMPLATES.paymentReminder.subject,
        html: EMAIL_TEMPLATES.paymentReminder.html(userName, cardName, amount.toFixed(2), daysUntilDue)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Payment reminder email sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending payment reminder email:', error);
      return false;
    }
  }

  // Send payment success notification
  static async sendPaymentSuccess(
    userEmail: string,
    userName: string,
    cardName: string,
    amount: number
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"SpendFlow" <${EMAIL_CONFIG.auth.user}>`,
        to: userEmail,
        subject: EMAIL_TEMPLATES.paymentSuccess.subject,
        html: EMAIL_TEMPLATES.paymentSuccess.html(userName, cardName, amount.toFixed(2))
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Payment success email sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending payment success email:', error);
      return false;
    }
  }

  // Send email confirmation
  static async sendEmailConfirmation(
    userEmail: string,
    userName: string,
    confirmationLink: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"SpendFlow" <${EMAIL_CONFIG.auth.user}>`,
        to: userEmail,
        subject: EMAIL_TEMPLATES.emailConfirmation.subject,
        html: EMAIL_TEMPLATES.emailConfirmation.html(userName, confirmationLink)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email confirmation sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending email confirmation:', error);
      return false;
    }
  }

  // Send password reset email
  static async sendPasswordReset(
    userEmail: string,
    userName: string,
    resetLink: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"SpendFlow" <${EMAIL_CONFIG.auth.user}>`,
        to: userEmail,
        subject: EMAIL_TEMPLATES.passwordReset.subject,
        html: EMAIL_TEMPLATES.passwordReset.html(userName, resetLink)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  // Send custom email
  static async sendCustomEmail(
    to: string,
    subject: string,
    html: string,
    from?: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: from || `"SpendFlow" <${EMAIL_CONFIG.auth.user}>`,
        to,
        subject,
        html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Custom email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Error sending custom email:', error);
      return false;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'send_payment_failure':
        const failureResult = await ServerEmailService.sendPaymentFailure(
          data.userEmail,
          data.userName,
          data.cardName,
          data.amount,
          data.reason
        );
        return NextResponse.json({ success: failureResult });

      case 'send_payment_reminder':
        const reminderResult = await ServerEmailService.sendPaymentReminder(
          data.userEmail,
          data.userName,
          data.cardName,
          data.amount,
          data.daysUntilDue
        );
        return NextResponse.json({ success: reminderResult });

      case 'send_payment_success':
        const successResult = await ServerEmailService.sendPaymentSuccess(
          data.userEmail,
          data.userName,
          data.cardName,
          data.amount
        );
        return NextResponse.json({ success: successResult });

      case 'send_email_confirmation':
        const confirmationResult = await ServerEmailService.sendEmailConfirmation(
          data.userEmail,
          data.userName,
          data.confirmationLink
        );
        return NextResponse.json({ success: confirmationResult });

      case 'send_password_reset':
        const resetResult = await ServerEmailService.sendPasswordReset(
          data.userEmail,
          data.userName,
          data.resetLink
        );
        return NextResponse.json({ success: resetResult });

      case 'send_custom':
        const customResult = await ServerEmailService.sendCustomEmail(
          data.to,
          data.subject,
          data.html,
          data.from
        );
        return NextResponse.json({ success: customResult });

      case 'verify_connection':
        const connected = await ServerEmailService.verifyConnection();
        return NextResponse.json({ success: connected });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
