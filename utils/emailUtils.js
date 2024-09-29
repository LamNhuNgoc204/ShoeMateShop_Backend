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
    `
  };
  
  await transporter.sendMail(mailOptions);
};


 

