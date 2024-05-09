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
    text: `Dear ${formData.name},

Thank you for contacting Tekisky Software Pvt Ltd. We have received your message and our team will contact you shortly.

Best regards,
Tekisky Software Pvt Ltd`,
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
