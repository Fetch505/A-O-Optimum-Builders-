import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10,15}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, contact, email, address, comment } = body;

    // Validate required fields
    if (!fullName || !contact || !email || !address || !comment) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate full name (minimum 2 characters)
    if (fullName.trim().length < 2) {
      return NextResponse.json(
        { message: "Full name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Validate contact number
    if (!phoneRegex.test(contact.trim())) {
      return NextResponse.json(
        { message: "Invalid contact number. Must be 10-15 digits" },
        { status: 400 }
      );
    }

    // Validate email
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 }
      );
    }

    // Validate address (minimum 5 characters)
    if (address.trim().length < 5) {
      return NextResponse.json(
        { message: "Address must be at least 5 characters" },
        { status: 400 }
      );
    }

    // Validate comment (10-1500 characters)
    if (comment.trim().length < 10 || comment.length > 1500) {
      return NextResponse.json(
        { message: "Message must be between 10 and 1500 characters" },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Email to admin
    const adminMailOptions = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission from ${fullName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 30px;
            }
            .field {
              margin-bottom: 20px;
              padding-bottom: 20px;
              border-bottom: 1px solid #e5e5e5;
            }
            .field:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: bold;
              color: #f59e0b;
              margin-bottom: 5px;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .value {
              color: #333;
              font-size: 16px;
              margin-top: 5px;
            }
            .message-box {
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
            }
            .footer {
              background: #f9fafb;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Full Name</div>
                <div class="value">${fullName}</div>
              </div>
              <div class="field">
                <div class="label">Contact Number</div>
                <div class="value">${contact}</div>
              </div>
              <div class="field">
                <div class="label">Email Address</div>
                <div class="value">${email}</div>
              </div>
              <div class="field">
                <div class="label">Address</div>
                <div class="value">${address}</div>
              </div>
              <div class="field">
                <div class="label">Message</div>
                <div class="message-box">${comment.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from your website contact form</p>
              <p>Received on ${new Date().toLocaleString('en-US', { 
                dateStyle: 'full', 
                timeStyle: 'short' 
              })}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Confirmation email to user
    const userMailOptions = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Thank you for contacting ${process.env.COMPANY_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
            }
            .content p {
              margin-bottom: 15px;
              font-size: 16px;
              color: #555;
            }
            .highlight {
              background: #fef3c7;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #f59e0b;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin-top: 20px;
            }
            .footer {
              background: #f9fafb;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You, ${fullName}!</h1>
            </div>
            <div class="content">
              <p>We've received your message and appreciate you taking the time to contact us.</p>
              
              <div class="highlight">
                <strong>What happens next?</strong><br>
                Our team will review your inquiry and get back to you within 24-48 hours.
              </div>

              <p><strong>Your submitted information:</strong></p>
              <p style="color: #666; font-size: 14px;">
                <strong>Name:</strong> ${fullName}<br>
                <strong>Email:</strong> ${email}<br>
                <strong>Contact:</strong> ${contact}<br>
                <strong>Address:</strong> ${address}
              </p>

              <p style="margin-top: 30px;">If you have any urgent questions, feel free to call us directly.</p>
            </div>
            <div class="footer">
              <p><strong>${process.env.COMPANY_NAME}</strong></p>
              <p>This is an automated confirmation email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { message: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}