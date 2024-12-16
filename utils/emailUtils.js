const nodemailer = require("nodemailer");

// Cấu hình email gửi qua Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASSWORD,
  },
});
exports.sendVerificationEmail = async (email, otpCode) => {
  const mailOptions = {
    from: '"ShoeMate Shop 👟" <shoemateshop@gmail.com>',
    to: email,
    subject: "Verify Your Email",
    text: `Your verification code is ${otpCode}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  padding: 20px;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background: #fff;
                  padding: 20px;
                  border-radius: 5px;
                  box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
              h1 {
                  color: #333;
              }
              .button {
                  display: inline-block;
                  font-size: 16px;
                  color: #fff;
                  background-color: #007BFF;
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 5px;
                  margin-top: 20px;
              }
              .footer {
                  margin-top: 20px;
                  font-size: 12px;
                  color: #888;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Email Verification</h1>
              <p>Hello,</p>
              <p>Thank you for registering with ShoeMate Shop! To complete your registration, please verify your email address using the code below:</p>
              <h2 style="color: #007BFF;">${otpCode}</h2>
              <p>If you did not create an account, you can safely ignore this email.</p>
              <p>Best regards,<br>ShoeMate Shop Team</p>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} ShoeMate Shop. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

exports.sendRefundRequestEmail = async (email) => {
  const mailOptions = {
    from: '"ShoeMate Shop 👟" <shoemateshop@gmail.com>',
    to: email,
    subject: "Refund Request - Action Required",
    text: `We need additional information to process your refund.`,
    html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Refund Request</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: #fff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                h1 {
                    color: #333;
                }
                .button {
                    display: inline-block;
                    font-size: 16px;
                    color: #fff;
                    background-color: #007BFF;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #888;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Refund Request</h1>
                <p>Hello,</p>
                <p>We received your request for a refund. To proceed, we need additional information from you. Please reply to this email with the following details:</p>
                <ul>
                    <li>Your full name</li>
                    <li>Order number</li>
                    <li>Reason for the refund</li>
                    <li>Preferred refund method (e.g., bank transfer, credit card reversal)</li>
                </ul>
                <p>Once we receive your response, we will process your refund as quickly as possible.</p>
                <p>If you have any questions, feel free to contact us.</p>
                <p>Best regards,<br>ShoeMate Shop Team</p>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} ShoeMate Shop. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `,
  };

  await transporter.sendMail(mailOptions);
};

exports.sendRandomPassword = async (email, password, name) => {
  const mailOptions = {
    from: '"ShoeMate Shop 👟" <shoemateshop@gmail.com>',
    to: email,
    subject: "Send Random Password",
    text: `Your random password is ${password}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Registration Confirmation</title>
          <style>
              /* Reset mặc định */
              body, html {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
              }

              /* Khung email chính */
              .email-container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #f4f4f4;
                  border: 1px solid #e0e0e0;
              }

              /* Phần header */
              .email-header {
                  background-color: #007bff;
                  color: white;
                  text-align: center;
                  padding: 20px;
              }

              /* Phần nội dung chính */
              .email-body {
                  background-color: white;
                  padding: 20px;
                  color: #333;
              }

              .email-body h1 {
                  font-size: 24px;
              }

              .email-body p {
                  font-size: 16px;
                  line-height: 1.5;
              }

              /* Button hành động */
              .email-body .password-btn {
                  display: block;
                  width: fit-content;
                  padding: 10px 20px;
                  margin: 20px 0;
                  background-color: #28a745;
                  color: white;
                  text-align: center;
                  text-decoration: none;
                  border-radius: 5px;
              }

              /* Footer */
              .email-footer {
                  text-align: center;
                  padding: 20px;
                  font-size: 12px;
                  color: #777;
              }

              /* Định dạng cho màn hình nhỏ hơn 600px */
              @media screen and (max-width: 600px) {
                  .email-container {
                      padding: 10px;
                  }

                  .email-header, .email-body, .email-footer {
                      padding: 10px;
                  }

                  .email-body h1 {
                      font-size: 20px;
                  }

                  .email-body p {
                      font-size: 14px;
                  }

                  .email-body .password-btn {
                      width: 100%;
                      text-align: center;
                  }
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <!-- Header -->
              <div class="email-header">
                  <h1>Welcome to [${"Mate Shoe"}]!</h1>
              </div>

              <!-- Nội dung email -->
              <div class="email-body">
                  <h1>Hi [${name}],</h1>
                  <p>
                      Thank you for registering at [${"Mate Shoe"}]. Below is your randomly generated password for logging in:
                  </p>
                  <p class="password-btn">Your Password: <strong>[${password}]</strong></p>
                  <p>
                      Please log in and change your password immediately for security reasons.
                  </p>
              </div>

              <!-- Footer -->
              <div class="email-footer">
                  <p>&copy; 2024 [${"Mate Shoe"}]. All rights reserved.</p>
                  <p>If you have any questions, feel free to contact us at support@[${"Mate Shoe"}].com.</p>
              </div>
          </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
