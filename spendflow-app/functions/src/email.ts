import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { defineString } from 'firebase-functions/params';

// Initialize Firebase Admin
admin.initializeApp();

// Define configuration parameters
const gmailEmail = defineString('GMAIL_EMAIL');
const gmailPassword = defineString('GMAIL_PASSWORD');

// Create a Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail.value(),
    pass: gmailPassword.value()
  }
});

// Interface for the contact message
export interface Reply {
  content: string;
  sentAt: admin.firestore.Timestamp | admin.firestore.FieldValue | Date;
  sentBy: string;
  notificationSent?: boolean;
  notificationSentAt?: admin.firestore.FieldValue;
  notificationError?: string;
}

interface ContactMessage {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: admin.firestore.Timestamp | admin.firestore.FieldValue;
  updatedAt?: admin.firestore.Timestamp | admin.firestore.FieldValue;
  emailSent?: boolean;
  emailSentAt?: admin.firestore.FieldValue;
  emailError?: string;
  replies?: Reply[];
  lastRepliedAt?: admin.firestore.Timestamp | admin.firestore.FieldValue;
}

// Interface for reply notifications
interface ReplyNotificationData {
  to: string;
  userName: string;
  adminName: string;
  message: string;
  replyContent: string;
  messageLink: string;
}

// Function to send reply notification email
export async function sendReplyNotification(data: ReplyNotificationData) {
  const { to, userName, adminName, message, replyContent, messageLink } = data;
  
  const mailOptions = {
    from: `"SpendFlow Support" <${gmailEmail.value()}>`,
    to,
    subject: `Re: Your message to SpendFlow Support`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">New Reply to Your Message</h2>
        <p>Hello ${userName},</p>
        <p>You have received a new reply to your message from ${adminName}:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #4f46e5; margin: 20px 0;">
          <p style="color: #4f46e5; font-weight: bold; margin: 0 0 10px 0;">Your original message:</p>
          <p style="white-space: pre-line; margin: 0;">${message}</p>
        </div>
        
        <div style="background-color: #eef2ff; padding: 15px; border-left: 4px solid #6366f1; margin: 20px 0;">
          <p style="color: #4f46e5; font-weight: bold; margin: 0 0 10px 0;">${adminName}'s reply:</p>
          <p style="white-space: pre-line; margin: 0;">${replyContent}</p>
        </div>
        
        <p>You can view and respond to this message by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${messageLink}" 
             style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; 
                    color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
            View Message
          </a>
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #4f46e5;">${messageLink}</p>
        
        <p>Best regards,<br>The SpendFlow Team</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Reply notification email sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('Error sending reply notification email:', error);
    throw new Error('Failed to send reply notification email');
  }
}

// Cloud Function to send email when a new contact message is created
export const sendContactEmail = onDocumentCreated(
  'contactMessages/{messageId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.error('No data associated with the event');
      return;
    }

    const message = snapshot.data() as ContactMessage;
    const adminEmail = 'spendflowapp@gmail.com';

    // Email options
    const mailOptions = {
      from: `"SpendFlow Support" <${gmailEmail.value()}>`,
      to: adminEmail,
      subject: `New Contact Message: ${message.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #d97706;">New Contact Message</h2>
          <p><strong>From:</strong> ${message.userName} (${message.userEmail})</p>
          <p><strong>Subject:</strong> ${message.subject}</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #f8f8f8; border-left: 4px solid #d97706;">
            ${message.message.replace(/\n/g, '<br>')}
          </div>
          <p style="color: #666; font-size: 0.9em;">
            Received on: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };

    try {
      // Send the email
      await transporter.sendMail(mailOptions);
      console.log('Contact email sent to admin');
      
      // Update the message to mark it as sent
      await snapshot.ref.update({ 
        emailSent: true, 
        emailSentAt: admin.firestore.FieldValue.serverTimestamp() 
      });
      
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error sending contact email:', errorMessage);
      await snapshot.ref.update({ 
        emailError: errorMessage,
        emailSent: false
      });
      return { success: false, error: errorMessage };
    }
  }
);

// Cloud Function to send email when a reply is added to a message
export const onReplyAdded = onDocumentUpdated(
  'contactMessages/{messageId}',
  async (event) => {
    const beforeData = event.data?.before.data() as ContactMessage | undefined;
    const afterData = event.data?.after.data() as ContactMessage | undefined;

    if (!beforeData || !afterData) return;

    // Check if a new reply was added
    const beforeReplies = beforeData.replies || [];
    const afterReplies = afterData.replies || [];
    
    if (afterReplies.length > beforeReplies.length) {
      const newReply = afterReplies[afterReplies.length - 1];
      
      // Skip if this reply was already processed
      if ((newReply as any).notificationSent) return;
      
      // Get the message link (replace with your actual message URL)
      const messageLink = `https://your-app-url.com/messages/${event.params.messageId}`;
      
      try {
        await sendReplyNotification({
          to: afterData.userEmail,
          userName: afterData.userName,
          adminName: (newReply as any).sentBy || 'Support Team',
          message: afterData.message,
          replyContent: (newReply as any).content,
          messageLink
        });
        
        // Update the document to mark notification as sent
        const updatedReplies = [...afterReplies];
        const lastIndex = updatedReplies.length - 1;
        updatedReplies[lastIndex] = {
          ...updatedReplies[lastIndex],
          notificationSent: true,
          notificationSentAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await event.data?.after.ref.update({
          replies: updatedReplies
        });
        
      } catch (error) {
        console.error('Error in onReplyAdded:', error);
        
        // Update the reply with error information
        const updatedReplies = [...afterReplies];
        const lastIndex = updatedReplies.length - 1;
        updatedReplies[lastIndex] = {
          ...updatedReplies[lastIndex],
          notificationError: error instanceof Error ? error.message : 'Unknown error',
          notificationSent: false
        };
        
        await event.data?.after.ref.update({
          replies: updatedReplies
        });
      }
    }
  }
);
