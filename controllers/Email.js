import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Barang from "../models/Barang.js";
import User from "../models/UserModel.js"; // Import model User
import { Op } from "sequelize";
import { subDays } from "date-fns";
import cron from "node-cron";

dotenv.config();

const processedRecordIds = new Set();

async function sendEmail(record, recipients) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "mgilangnurhaliz@gmail.com",
      pass: process.env.pass, // Use the correct environment variable name
    },
  });

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDateIn = new Date(record.datein).toLocaleDateString(
    "id-ID",
    options
  );
  const formattedDateOut = new Date(record.dateout).toLocaleDateString(
    "id-ID",
    options
  );

  let info = await transporter.sendMail({
    from: '"Maintenance" <mgilangnurhaliz@gmail.com>',
    to: recipients.join(","), // Join the recipients array into a comma-separated string
    subject: `Pengingat: Penggantian Diperlukan untuk Barang ${record.name} dengan Kode ${record.code}`, // Set subject as per your requirement
    html: `
    <p>Dear <strong> ${record.user.name},</strong> </p>
    <p>Kami ingin mengingatkan Anda mengenai status barang berikut di inventaris kami yang memerlukan penggantian atau perbaikan:</p>
    <p><strong>Nama Barang:</strong> ${record.name}</p>
    <p><strong>Kode Barang:</strong> ${record.code}</p>
    <p><strong>Lokasi Barang:</strong> ${record.location}</p>
    <p><strong>Tanggal Pemasangan:</strong> ${formattedDateIn}</p>
    <p><strong>Tanggal Penggantian:</strong> ${formattedDateOut}</p>
    <p>Mohon perhatikan hal ini untuk kelancaran operasional kami. Harap tinjau kondisi barang dan lakukan tindakan yang diperlukan. Pertanyaan atau bantuan lebih lanjut, hubungi departemen pemeliharaan kami. Terima kasih atas kerjasama Anda dalam menjaga standar peralatan kami.</p>
    <p>Salam hormat, Admin ElctraCare</p>
    `,
    attachments: [
      {
        filename: "image.png",
        path: `./public/images/${record.image}`,
        cid: "unique@gmail.com",
      },
    ],
  });

  console.log(info.messageId);
  console.log(info.accepted);
  console.log(info.rejected);

  processedRecordIds.add(record.id);
}

async function getEmailRecords() {
  const currentDate = new Date();
  currentDate.setUTCHours(0, 0, 0, 0); // Set to midnight

  try {
    const records = await Barang.findAll({
      where: {
        dateout: {
          [Op.lte]: subDays(currentDate, 3),
        },
        id: {
          [Op.notIn]: Array.from(processedRecordIds),
        },
      },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      attributes: [
        "id",
        "name",
        "image",
        "url",
        "code",
        "location",
        "datein",
        "dateout",
      ],
    });

    return records;
  } catch (error) {
    console.error("Error retrieving records:", error);
    throw error;
  }
}

async function getEmailRecipients(records) {
  try {
    // Dapatkan daftar email pemilik barang yang sesuai
    const recipients = records.map((record) => record.user.email);

    // Dapatkan daftar email admin
    const admins = await User.findAll({
      where: { role: "admin" },
      attributes: ["email"],
    });

    // Gabungkan daftar email pemilik barang dengan daftar email admin
    const allRecipients = [
      ...recipients,
      ...admins.map((admin) => admin.email),
    ];

    // Hapus duplikat jika ada
    const uniqueRecipients = [...new Set(allRecipients)];

    return uniqueRecipients;
  } catch (error) {
    console.error("Error retrieving email recipients:", error);
    throw error;
  }
}

export async function sendEmailsForMatchingDateOut() {
  try {
    const records = await getEmailRecords();
    const recipients = await getEmailRecipients(records);

    if (recipients.length > 0) {
      for (const record of records) {
        console.log("Processing record with dateout:", record.dateout);
        await sendEmail(record, recipients);
        processedRecordIds.add(record.id);
      }
    } else {
      console.log("No recipients found for sending emails.");
    }
  } catch (error) {
    console.error("Error sending emails:", error);
  }
}

// Run the task every day at 12:00 PM
cron.schedule("0 0 * * *", async () => {
  console.log("Running email sending task...");
  await sendEmailsForMatchingDateOut();
});
