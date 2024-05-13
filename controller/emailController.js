import nodemailer from "nodemailer";

const sendEmailController = (req, res) => {
  const { name, email, message, mobile } = req.body;

  sendFormDataEmail({ name, email, message, mobile });

  res.status(200).send("Form submitted successfully");
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tekiskymart920@gmail.com",
    pass: "unol ktol sndf viob",
  },
});

const sendFormDataEmail = (formData) => {
  // Email to be sent to you (tekiskymart920@gmail.com)
  const mailOptionsToYou = {
    from: formData.email,
    to: "tekiskymart920@gmail.com",
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
    <html>
      <head>
        <style>
         
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333333;
            text-align: center;
          }
          p {
            color: #666666;
            line-height: 1.6;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Dear ${formData.name},</h1>
          <p>Thank you for contacting Tekisky Pvt Ltd. We have received your message and our team will contact you shortly.</p>
          <p>Your Mobile Number: ${formData.mobile}</p>
          <p>We appreciate your interest in our services.</p>
          <p>Best regards,<br/>Tekisky Pvt Ltd</p>
        </div>
      </body>
    </html>
  `,
  };

  // Send email to you
  transporter.sendMail(mailOptionsToYou, function (error, info) {
    if (error) {
      console.log("Error sending email to you:", error);
    } else {
      console.log("Email sent to you:", info.response);
    }
  });

  // Send email to the user
  transporter.sendMail(mailOptionsToUser, function (error, info) {
    if (error) {
      console.log("Error sending email to user:", error);
    } else {
      console.log("Email sent to user:", info.response);
    }
  });
};

export default sendEmailController;
