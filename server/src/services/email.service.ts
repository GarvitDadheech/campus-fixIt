import * as nodemailer from 'nodemailer';
import { env } from '../config';
import { IssueStatus } from '../types';
import { log, STATUS_DISPLAY_NAMES } from '../utils';

class EmailService {
  /**
   * Get configured email transporter
   */
  private getEmailTransporter(): nodemailer.Transporter {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Check if email service is configured
   */
  private isConfigured(): boolean {
    return !!(env.EMAIL_USER && env.EMAIL_PASSWORD);
  }

  /**
   * Send an email
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      log.debug('Email service not configured, skipping email', { to, subject });
      return false;
    }

    const transporter = this.getEmailTransporter();

    const mailOptions = {
      from: env.EMAIL_USER,
      to,
      subject,
      html,
      text: text || this.stripHtml(html),
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      log.info('Email sent successfully', { to, subject, messageId: info.messageId });
      return true;
    } catch (error) {
      log.error('Failed to send email', error, { to, subject });
      return false;
    }
  }

  /**
   * Send welcome email after registration
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const subject = 'Welcome to Campus FixIt!';
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Campus FixIt!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for registering with Campus FixIt - your one-stop solution for reporting and tracking campus maintenance issues.</p>
              <p>With Campus FixIt, you can:</p>
              <ul>
                <li>Report issues with photos and descriptions</li>
                <li>Track the status of your reported issues</li>
                <li>Get notified when issues are resolved</li>
              </ul>
              <p>Start reporting issues today and help make our campus better!</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Campus FixIt. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return this.sendEmail(email, subject, html);
    } catch (error) {
      log.error('Failed to send welcome email', error, { email, name });
      return false;
    }
  }

  /**
   * Send issue status update email
   */
  async sendStatusUpdateEmail(
    email: string,
    name: string,
    issueTitle: string,
    previousStatus: IssueStatus,
    newStatus: IssueStatus,
    remarks?: string
  ): Promise<boolean> {
    try {
      const statusColors: Record<string, string> = {
        open: '#f59e0b',
        in_progress: '#3b82f6',
        resolved: '#10b981',
      };

      const subject = `Issue Update: ${issueTitle}`;
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; }
            .status-change { display: flex; align-items: center; justify-content: center; gap: 15px; margin: 20px 0; }
            .arrow { font-size: 24px; color: #666; }
            .remarks-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin-top: 20px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Issue Status Updated</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>The status of your issue has been updated:</p>
              <h3>"${issueTitle}"</h3>
              <div class="status-change">
                <span class="status-badge" style="background: ${statusColors[previousStatus]}">
                  ${STATUS_DISPLAY_NAMES[previousStatus]}
                </span>
                <span class="arrow">&rarr;</span>
                <span class="status-badge" style="background: ${statusColors[newStatus]}">
                  ${STATUS_DISPLAY_NAMES[newStatus]}
                </span>
              </div>
              ${
                remarks
                  ? `
                <div class="remarks-box">
                  <strong>Admin Remarks:</strong>
                  <p>${remarks}</p>
                </div>
              `
                  : ''
              }
              ${
                newStatus === 'resolved'
                  ? '<p>Great news! Your issue has been resolved. Thank you for helping improve our campus!</p>'
                  : '<p>We are working on resolving your issue. You will be notified of any further updates.</p>'
              }
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Campus FixIt. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return this.sendEmail(email, subject, html);
    } catch (error) {
      log.error('Failed to send status update email', error, { email, issueTitle, newStatus });
      return false;
    }
  }

  /**
   * Send issue created confirmation email
   */
  async sendIssueCreatedEmail(
    email: string,
    name: string,
    issueTitle: string,
    issueId: string,
    category: string,
    priority: string
  ): Promise<boolean> {
    try {
      const subject = `Issue Reported: ${issueTitle}`;
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .issue-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Issue Reported Successfully</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Your issue has been successfully reported. Our team will review it shortly.</p>
              <div class="issue-details">
                <h3>${issueTitle}</h3>
                <div class="detail-row">
                  <span>Issue ID:</span>
                  <span>#${issueId.slice(-8).toUpperCase()}</span>
                </div>
                <div class="detail-row">
                  <span>Category:</span>
                  <span>${category}</span>
                </div>
                <div class="detail-row">
                  <span>Priority:</span>
                  <span>${priority}</span>
                </div>
                <div class="detail-row">
                  <span>Status:</span>
                  <span>Open</span>
                </div>
              </div>
              <p>You will receive email notifications when the status of your issue changes.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Campus FixIt. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return this.sendEmail(email, subject, html);
    } catch (error) {
      log.error('Failed to send issue created email', error, { email, issueTitle, issueId });
      return false;
    }
  }

  /**
   * Strip HTML tags from text
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      log.warn('Email service not configured, cannot test connection');
      return false;
    }

    try {
      const transporter = this.getEmailTransporter();
      await transporter.verify();
      log.info('Email service connection verified');
      return true;
    } catch (error) {
      log.error('Email service connection test failed', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
export default emailService;
