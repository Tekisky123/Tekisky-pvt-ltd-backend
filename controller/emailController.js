import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendEmailController = (req, res) => {
  const { name, email, message, mobile } = req.body;

  sendFormDataEmail({ name, email, message, mobile })
    .then(() => {
      res.status(200).send("Form submitted successfully and emails sent");
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      res.status(500).send("Failed to send email");
    });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendFormDataEmail = (formData) => {
  return new Promise((resolve, reject) => {
    const mailOptionsToYou = {
      from: formData.email,
      to: process.env.SMTP_USER,
      subject: "New Form Submission",
      text: `
        Name: ${formData.name}
        Email: ${formData.email}
        Mobile: ${formData.mobile}
        Message: ${formData.message}
      `,
    };

    // Email to be sent to the user
    const mailOptionsToUser = {
      from: process.env.SMTP_USER,
      to: formData.email,
      subject: "Confirmation: Your Message Has Been Received",
      html: `
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 0;
              width: 100%;
              background-color: #f4f4f4;
              font-family: Arial, sans-serif;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding: 20px 0;
              background-color: #ffffff;
              border-bottom: 1px solid #e0e0e0;
            }
            .header img {
              max-width: 300px;
              height: auto;
            }
            .content {
              padding: 30px;
            }
            .content h1 {
              font-size: 24px;
              color: #333;
              margin-bottom: 20px;
            }
            .content p {
              font-size: 16px;
              line-height: 1.6;
              color: #666;
              margin-bottom: 20px;
            }
            .content a {
              color: #1a73e8;
              text-decoration: none;
            }
            .footer {
              text-align: center;
              padding: 20px 0;
              background-color: #f4f4f4;
              border-top: 1px solid #e0e0e0;
              font-size: 14px;
              color: #888;
            }
            .footer a {
              color: #1a73e8;
              text-decoration: none;
            }
          </style>
          <title>Confirmation: Your Message Has Been Received</title>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <a href="https://tekisky.com">
                <img src="https://tekisky.com/assets/WhatsApp_Image_2024-04-30_at_12.39.09_86de1ffc-removebg-preview-2SydUlQw.png" alt="Tekisky Pvt Ltd">
              </a>
            </div>
            <div class="content">
              <h1>Thank You for Contacting Us</h1>
              <p>Dear ${formData.name},</p>
              <p>
                Thank you for reaching out to Tekisky Pvt Ltd. We have received your message and our team will get back to you shortly.
              </p>
              <p>
                If you have any additional questions or need immediate assistance, feel free to contact us directly at <a href="mailto:hr@tekisky.com">support@tekisky.com or  <a href="tel:+918625817334">+91 8625817334</a>.
              </p>
              <p>
                In the meantime, you can explore our website to learn more about our services and offerings.
              </p>
              <p>
                Best regards,<br/>
                The Tekisky Pvt Ltd Team
              </p>
            </div>
            <div class="footer">
              <p>
                Tekisky Pvt Ltd, Workshop Corner, Nanded, Maharashtra, 431605<br/>
                <a href="mailto:hr@tekisky.com">support@tekisky.com</a> | <a href="tel:+918625817334">+91 8625817334</a>
              </p>
              <p>
                This email was sent to you because you recently submitted a contact form on our website. If you believe this was a mistake, please ignore this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send email to you
    transporter.sendMail(mailOptionsToYou, function (error, info) {
      if (error) {
        console.log("Error sending email to you:", error);
        reject(error);
      } else {
        console.log("Email sent to you:", info.response);
        // Send email to the user
        transporter.sendMail(mailOptionsToUser, function (error, info) {
          if (error) {
            console.log("Error sending email to user:", error);
            reject(error);
          } else {
            console.log("Email sent to user:", info.response);
            resolve();
          }
        });
      }
    });
  });
};

export default sendEmailController;
