const nodemailer = require('nodemailer');

/**
 * Notification Service for Repair Service App
 * Handles email notifications via Gmail SMTP and logs SMS/WhatsApp notifications
 */

// Create reusable transporter object using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
    // Optional: Enable debug mode for troubleshooting
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
  });
};

// Initialize transporter
const transporter = createTransporter();

/**
 * Generic email sending function
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} message - Email body (HTML or plain text)
 * @returns {Promise<Object>} - Nodemailer response
 */
const sendEmail = async (to, subject, message) => {
  try {
    // Verify transporter configuration before sending
    await transporter.verify();

    const mailOptions = {
      from: {
        name: 'TechRepair Service',
        address: process.env.EMAIL_USER
      },
      to: to,
      subject: subject,
      html: message, // Support HTML content
      text: message.replace(/<[^>]*>/g, ''), // Strip HTML for plain text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}:`, info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

/**
 * Notification templates for different stages
 */
const notificationTemplates = {
  Created: {
    subject: 'Service Request Registered - #{id}',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: #007bff; margin: 0;">🔧 TechRepair Service</h2>
        </div>
        <div style="padding: 20px;">
          <h3 style="color: #28a745;">Service Request Registered!</h3>
          <p>Hi <strong>{name}</strong>,</p>
          <p>Your service request <strong>#{id}</strong> has been successfully registered with our repair center.</p>
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Request ID:</strong> {id}</p>
            <p><strong>Status:</strong> Under Review</p>
            <p><strong>Next Step:</strong> Our technicians will assess your device and provide a cost estimate soon.</p>
          </div>
          <p>You'll receive updates via email and SMS as your repair progresses.</p>
          <p style="margin-top: 20px;">Best regards,<br><strong>TechRepair Team</strong></p>
        </div>
        <div style="background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #6c757d;">
          Questions? Contact us at support@techrepair.com
        </div>
      </div>
    `,
    smsTemplate: 'Hi {name}, your service request #{id} has been registered. You\'ll receive updates as we progress with your repair.'
  },

  CostEstimate: {
    subject: 'Repair Cost Estimate - #{id}',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: #007bff; margin: 0;">🔧 TechRepair Service</h2>
        </div>
        <div style="padding: 20px;">
          <h3 style="color: #ffc107;">💰 Cost Estimate Ready</h3>
          <p>Hi <strong>{name}</strong>,</p>
          <p>We've completed the assessment of your device for request <strong>#{id}</strong>.</p>
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
            <h4 style="margin-top: 0; color: #856404;">Estimated Repair Cost</h4>
            <p style="font-size: 24px; font-weight: bold; color: #856404; margin: 10px 0;">₹{amount}</p>
            <p><strong>Breakdown:</strong> {description}</p>
          </div>
          <p><strong>Please approve this estimate to proceed with the repair.</strong></p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="#" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Approve Estimate</a>
          </div>
          <p style="margin-top: 20px;">Best regards,<br><strong>TechRepair Team</strong></p>
        </div>
        <div style="background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #6c757d;">
          Questions? Contact us at support@techrepair.com
        </div>
      </div>
    `,
    smsTemplate: 'Hi {name}, estimated repair cost for request #{id} is ₹{amount}. Please approve to proceed. {description}'
  },

  Repaired: {
    subject: 'Device Repaired - #{id}',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: #007bff; margin: 0;">🔧 TechRepair Service</h2>
        </div>
        <div style="padding: 20px;">
          <h3 style="color: #28a745;">✅ Device Repaired!</h3>
          <p>Hi <strong>{name}</strong>,</p>
          <p>Great news! Your device for request <strong>#{id}</strong> has been successfully repaired and tested.</p>
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #28a745;">
            <h4 style="margin-top: 0; color: #155724;">Repair Completed</h4>
            <p><strong>Work Done:</strong> {workDone}</p>
            <p><strong>Quality Check:</strong> Passed ✅</p>
            <p><strong>Status:</strong> Ready for Dispatch</p>
          </div>
          <p>Your device will be carefully packaged and dispatched shortly. You'll receive tracking details once shipped.</p>
          <p style="margin-top: 20px;">Best regards,<br><strong>TechRepair Team</strong></p>
        </div>
        <div style="background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #6c757d;">
          Questions? Contact us at support@techrepair.com
        </div>
      </div>
    `,
    smsTemplate: 'Hi {name}, your device for request #{id} is repaired and ready for dispatch. Work done: {workDone}'
  },

  Dispatched: {
    subject: 'Device Shipped - #{id}',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: #007bff; margin: 0;">🔧 TechRepair Service</h2>
        </div>
        <div style="padding: 20px;">
          <h3 style="color: #17a2b8;">🚚 Device Shipped!</h3>
          <p>Hi <strong>{name}</strong>,</p>
          <p>Your repaired device for request <strong>#{id}</strong> has been shipped and is on its way to you!</p>
          <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #17a2b8;">
            <h4 style="margin-top: 0; color: #0c5460;">Shipping Details</h4>
            <p><strong>Tracking ID:</strong> <span style="font-family: monospace; background-color: #fff; padding: 2px 8px; border-radius: 3px;">{trackingNo}</span></p>
            <p><strong>Courier:</strong> {courier}</p>
            <p><strong>Expected Delivery:</strong> {expectedDelivery}</p>
          </div>
          <div style="text-align: center; margin: 20px 0;">
            <a href="{trackingUrl}" style="background-color: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Package</a>
          </div>
          <p><strong>Important:</strong> Please keep your tracking ID safe and someone should be available to receive the package.</p>
          <p style="margin-top: 20px;">Best regards,<br><strong>TechRepair Team</strong></p>
        </div>
        <div style="background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #6c757d;">
          Questions? Contact us at support@techrepair.com
        </div>
      </div>
    `,
    smsTemplate: 'Hi {name}, your device for request #{id} has been shipped. Tracking ID: {trackingNo}. Expected delivery: {expectedDelivery}'
  }
};

/**
 * Replace template placeholders with actual data
 * @param {string} template - Template string with placeholders
 * @param {Object} data - Data object with replacement values
 * @returns {string} - Processed template
 */
const processTemplate = (template, data) => {
  let processed = template;
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    processed = processed.replace(regex, data[key] || '');
  });
  return processed;
};

/**
 * Main notification function - sends email and logs SMS/WhatsApp
 * @param {Object} customer - Customer info { name, email, phone }
 * @param {string} stage - Notification stage (Created, CostEstimate, Repaired, Dispatched)
 * @param {Object} extraData - Additional data for template replacement
 */
const sendNotification = async (customer, stage, extraData = {}) => {
  try {
    // Validate inputs
    if (!customer || !customer.name || !customer.email) {
      throw new Error('Customer information is incomplete (name and email required)');
    }

    if (!notificationTemplates[stage]) {
      throw new Error(`Invalid stage: ${stage}. Valid stages: ${Object.keys(notificationTemplates).join(', ')}`);
    }

    const template = notificationTemplates[stage];

    // Prepare template data
    const templateData = {
      name: customer.name,
      ...extraData
    };

    // Process email template
    const emailSubject = processTemplate(template.subject, templateData);
    const emailBody = processTemplate(template.emailTemplate, templateData);

    // Send email notification
    await sendEmail(customer.email, emailSubject, emailBody);

    // Log SMS/WhatsApp notification (placeholder)
    if (customer.phone) {
      const smsMessage = processTemplate(template.smsTemplate, templateData);
      console.log(`📱 [SMS/WhatsApp] Sent to ${customer.phone}: ${smsMessage}`);

      // In production, you would integrate with SMS/WhatsApp APIs here
      // Example integrations:
      // - Twilio: await twilioClient.messages.create({...})
      // - WhatsApp Business API: await whatsappClient.sendMessage({...})
    } else {
      console.log('⚠️ No phone number provided for SMS/WhatsApp notification');
    }

    console.log(`✅ Notification sent successfully to ${customer.name} (${customer.email}) for stage: ${stage}`);
    return { success: true, stage, customer: customer.email };

  } catch (error) {
    console.error(`❌ Notification failed for stage ${stage}:`, error.message);
    throw error;
  }
};

/**
 * Test function to verify email configuration
 */
const testEmailConfiguration = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email configuration is valid and ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendNotification,
  testEmailConfiguration,
  notificationTemplates
};