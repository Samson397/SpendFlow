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

  welcome: {
    subject: 'Welcome to SpendFlow!',
    html: (userName: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to SpendFlow!</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${userName}, Welcome Aboard!</h2>
          <p>Thank you for joining SpendFlow - your premium financial management platform.</p>
          <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>🎯 What you can do:</strong><br>
            • Track all your transactions<br>
            • Manage multiple credit cards<br>
            • Get payment reminders<br>
            • Analyze spending patterns<br>
            • Export financial data
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
               style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              Start Managing Your Finances
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Need help? Contact our support team anytime.
          </p>
        </div>
      </div>
    `
  }
};

export class EmailService {
  // Verify email configuration
  static async verifyConnection(): Promise<boolean> {
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'verify_connection' }),
      });

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error('Error verifying email connection:', error);
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
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_payment_failure',
          userEmail,
          userName,
          cardName,
          amount,
          reason
        }),
      });

      const data = await response.json();
      return data.success || false;
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
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_payment_reminder',
          userEmail,
          userName,
          cardName,
          amount,
          daysUntilDue
        }),
      });

      const data = await response.json();
      return data.success || false;
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
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_payment_success',
          userEmail,
          userName,
          cardName,
          amount
        }),
      });

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error('Error sending payment success email:', error);
      return false;
    }
  }

  // Send welcome email
  static async sendWelcomeEmail(
    userEmail: string,
    userName: string
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_welcome',
          userEmail,
          userName
        }),
      });

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error('Error sending welcome email:', error);
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
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_custom',
          to,
          subject,
          html,
          from
        }),
      });

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error('Error sending custom email:', error);
      return false;
    }
  }
}
