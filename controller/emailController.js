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
    // Email to be sent to you (tekiskymart920@gmail.com)
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
      from: "tekiskymart920@gmail.com",
      to: formData.email,
      subject: "Confirmation: Your Message Has Been Received",
      html: `
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta http-equiv="content-type" content="text/html; charset=utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0;">
          <meta name="format-detection" content="telephone=no"/>
          <style>
            body {
              margin: 0;
              padding: 0;
              min-width: 100%;
              width: 100% !important;
              height: 100% !important;
              background-color: #2D3445;
              color: #FFFFFF;
              font-family: Arial, sans-serif;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            td {
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #3E4857;
              border-radius: 8px;
              overflow: hidden;
            }
            .header {
              text-align: center;
              background-color: #444C5E;
              padding: 20px;
            }
            .header img {
              max-width: 200px;
              height: auto;
              border-radius:8px;
            }
            .content {
              padding: 30px;
              background-color: #3E4857;
              color: #FFFFFF;
            }
            .content h1 {
              font-size: 24px;
              margin-bottom: 20px;
            }
            .content p {
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .content a {
              color: #FFFFFF;
              text-decoration: underline;
            }
            .footer {
              text-align: center;
              padding: 20px;
              background-color: #444C5E;
              font-size: 13px;
              color: #828999;
            }
            .footer a {
              color: #828999;
              text-decoration: underline;
            }
          </style>
          <title>Confirmation: Your Message Has Been Received</title>
        </head>
        <body>
          <table class="container">
            <tr>
              <td class="header">
                <a href="https://tekisky.com">
                
                </a>
              </td>
            </tr>
            <tr>
              <td class="content">
                <h1>Your Message Has Been Received</h1>
                <p>Dear ${formData.name},</p>
                <p>
                  Thank you for taking the first step toward a brighter future with Tekisky Pvt Ltd. Your message has landed in our inbox like a beacon of opportunity, and we couldn't be more thrilled!
                </p>
                <p>
                  We've received your inquiry and our team is buzzing with excitement to connect with you. Rest assured, we'll be reaching out to you shortly to dive into the details and discuss the amazing possibilities ahead.
                </p>
                <p>
                  While you eagerly await our response, why not take a moment to explore our website at
                  <a href="https://tekisky.com">www.tekisky.com</a>? It's a treasure trove of inspiration and insights into the innovative work we do.
                </p>
                <p>
                  We appreciate your trust in us and can't wait to embark on this journey together. Get ready for an extraordinary experience!
                </p>
                <p>Best regards,<br/>The Tekisky Pvt Ltd Team</p>
                <p>
                  Have a question? 
                  <a href="mailto:support@tekisky.com" target="_blank">Get in touch with us</a>
                </p>
              </td>
            </tr>
            <tr>
              <td class="footer">
                <p>
                  This email was sent to you because you recently submitted a contact form on our website. If you believe this was a mistake, please ignore this email.
                </p>
                <table style="margin-top: 20px; width: 100%;">
  <tr>
    <td class="footer" style="text-align: end;">
      Best Regards,<br>
      
      The Recruitment Team<br>
      Tekisky Pvt Ltd <br>
      <a href="mailto:hr@tekisky.com">hr@tekisky.com</a><br>
      <a href="tel:+918625817334">+91 8625817334</a>
    </td>
  </tr>
</table>
              </td>
            </tr>
          </table>
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
