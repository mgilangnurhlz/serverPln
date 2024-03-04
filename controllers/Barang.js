import Barang from "../models/Barang.js";
import path from "path";
import { Op } from "sequelize";
import User from "../models/UserModel.js";

export const getBarangs = async (req, res) => {
  try {
    let response;
    if (req.role === "admin") {
      response = await Barang.findAll({
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
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    } else {
      response = await Barang.findAll({
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
        where: {
          userId: req.userId,
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getBarangById = async (req, res) => {
  try {
    const barang = await Barang.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!barang) {
      return res.status(404).json({ msg: "Item not found" });
    }

    let response;

    if (req.role === "admin") {
      response = await Barang.findOne({
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
        where: {
          id: barang.id,
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    } else {
      response = await Barang.findOne({
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
        where: {
          [Op.and]: [{ id: barang.id }, { userId: req.userId }],
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
      });
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const saveBarang = async (req, res) => {
  try {
    // Memastikan file telah diunggah
    if (req.files === null) {
      return res.status(400).json({ msg: "No image uploaded" });
    }

    const { name, code, location, datein, dateout } = req.body;
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowedType = [".png", ".jpg", ".jpeg"];

    // Memeriksa tipe file yang diunggah
    if (!allowedType.includes(ext.toLowerCase())) {
      return res
        .status(422)
        .json({ msg: "Invalid image extension (.png, .jpg, .jpeg)" });
    }

    // Memeriksa ukuran file yang diunggah
    if (fileSize > 5000000) {
      return res
        .status(422)
        .json({ msg: "Images must have a size of less than 5 MB" });
    }

    // Menyimpan file ke direktori
    file.mv(`./public/images/${fileName}`, async (err) => {
      if (err) {
        return res.status(500).json({ msg: err.message });
      }

      try {
        // Membuat barang baru dalam database
        const newBarang = await Barang.create({
          name: name,
          code: code,
          location: location,
          datein: datein,
          dateout: dateout,
          image: fileName,
          url: url,
          userId: req.userId, // Menyimpan ID pengguna yang membuat barang
        });

        // Mengembalikan respons sukses
        res
          .status(201)
          .json({ msg: "Product created successfully", data: newBarang });
      } catch (error) {
        // Mengembalikan respons gagal beserta pesan kesalahan jika terjadi kesalahan
        res.status(500).json({ msg: "Please complete the data form" });
      }
    });
  } catch (error) {
    // Mengembalikan respons gagal beserta pesan kesalahan jika terjadi kesalahan
    res.status(500).json({ msg: "Please complete the data form" });
  }
};

export const updateBarang = async (req, res) => {
  try {
    // Mengambil data barang berdasarkan ID
    const barang = await Barang.findOne({
      where: {
        id: req.params.id,
      },
    });

    // Memeriksa apakah data barang ditemukan
    if (!barang) {
      return res.status(404).json({ msg: "Item not found" });
    }

    let fileName = "";

    // Jika tidak ada file yang diunggah, gunakan nama file yang ada dalam database
    if (req.files === null) {
      fileName = barang.image;
    } else {
      // Jika ada file yang diunggah, proses file yang diunggah
      const file = req.files.file;
      const fileSize = file.data.length;
      const ext = path.extname(file.name);
      fileName = file.md5 + ext;
      const allowedType = [".png", ".jpg", ".jpeg"];

      // Memeriksa tipe file yang diunggah
      if (!allowedType.includes(ext.toLowerCase())) {
        return res
          .status(422)
          .json({ msg: "Invalid image extension (.png, .jpg, .jpeg)" });
      }

      // Memeriksa ukuran file yang diunggah
      if (fileSize > 5000000) {
        return res
          .status(422)
          .json({ msg: "Images must have a size of less than 5 MB" });
      }

      // Menyimpan file baru
      file.mv(`./public/images/${fileName}`, (err) => {
        if (err) {
          return res.status(500).json({ msg: err.message });
        }
      });
    }

    // Mendapatkan data dari body permintaan
    const { name, code, location, datein, dateout } = req.body;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

    // Memeriksa apakah pengguna adalah admin atau pemilik barang
    if (req.role === "admin" || barang.userId === req.userId) {
      // Memperbarui data barang dalam database
      await Barang.update(
        {
          name: name,
          code: code,
          location: location,
          datein: datein,
          dateout: dateout,
          image: fileName,
          url: url,
          userId: barang.userId, // Menggunakan userId yang ada dalam database
        },
        {
          where: {
            id: req.params.id,
          },
        }
      );

      // Mengembalikan respons sukses
      res.status(200).json({ msg: "Product Updated Successfully" });
    } else {
      // Jika pengguna tidak memiliki akses untuk mengedit barang, kirim respons akses terlarang
      res.status(403).json({ msg: "Forbidden: Access Denied" });
    }
  } catch (error) {
    // Mengembalikan respons gagal berserta pesan kesalahan jika terjadi kesalahan
    console.log(error.message);
    res.status(500).json({ msg: "Please complete the data form" });
  }
};

export const deleteBarang = async (req, res) => {
  try {
    // Mengambil data barang berdasarkan ID
    const barang = await Barang.findOne({
      where: {
        id: req.params.id,
      },
    });

    // Memeriksa apakah data barang ditemukan
    if (!barang) {
      return res.status(404).json({ msg: "No item found" });
    }

    // Memeriksa apakah pengguna memiliki akses untuk menghapus barang
    if (req.role === "admin" || req.userId === barang.userId) {
      // Menghapus barang dari database
      await Barang.destroy({
        where: {
          id: req.params.id,
        },
      });

      // Mengembalikan respons sukses
      return res.status(200).json({ msg: "Product deleted successfully" });
    } else {
      // Jika pengguna tidak memiliki akses untuk menghapus barang, kirim respons akses terlarang
      return res.status(403).json({ msg: "Forbidden: Access Denied" });
    }
  } catch (error) {
    // Mengembalikan respons gagal berserta pesan kesalahan jika terjadi kesalahan
    console.log(error.message);
    return res.status(500).json({ msg: error.message });
  }
};
