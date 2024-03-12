import User from "../models/UserModel.js";
import argon2 from "argon2";

export const getUsers = async (req, res) => {
  try {
    const response = await User.findAll({
      attributes: [
        "uuid",
        "name",
        "email",
        "role",
        "office",
        "division",
        "status",
      ],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const response = await User.findOne({
      attributes: [
        "uuid",
        "name",
        "email",
        "role",
        "office",
        "division",
        "status",
      ],
      where: {
        uuid: req.params.id,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createUser = async (req, res) => {
  const {
    name,
    email,
    password,
    confPassword,
    role,
    office,
    division,
    status,
  } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ msg: "Email already exists" });
  }
  if (password !== confPassword)
    return res
      .status(400)
      .json({ msg: "Password and Confirm Password do not match" });
  const hashPassword = await argon2.hash(password);
  try {
    await User.create({
      name: name,
      email: email,
      password: hashPassword,
      role: role,
      office: office,
      division: division,
      status: status,
    });
    res.status(201).json({ msg: "Register Successful" });
  } catch (error) {
    res.status(400).json({ msg: "Please complete the data form" });
  }
};

export const updateUser = async (req, res) => {
  const user = await User.findOne({
    where: {
      uuid: req.params.id,
    },
  });
  if (!user) return res.status(404).json({ msg: "User not found" });
  const {
    name,
    email,
    password,
    confPassword,
    role,
    office,
    division,
    status,
  } = req.body;
  let hashPassword;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser && existingUser.id !== user.id) {
    return res.status(400).json({ msg: "Email already exists" });
  }
  //? agar tidak perlu mengedit password
  if (password === "" || password === null) {
    hashPassword = user.password;
  } else {
    hashPassword = await argon2.hash(password);
  }
  if (password !== confPassword)
    return res
      .status(400)
      .json({ msg: "Password and Confirm Password do not match" });
  try {
    await User.update(
      {
        name: name,
        email: email,
        password: hashPassword,
        role: role,
        office: office,
        division: division,
        status: status,
      },
      {
        where: {
          id: user.id,
        },
      }
    );
    res.status(200).json({ msg: "User Updated" });
  } catch (error) {
    res.status(400).json({ msg: "Please complete the data form" });
  }
};

export const deleteUser = async (req, res) => {
  const user = await User.findOne({
    where: {
      uuid: req.params.id,
    },
  });
  if (!user) return res.status(404).json({ msg: "User not found" });
  try {
    await User.destroy({
      where: {
        id: user.id,
      },
    });
    res.status(200).json({ msg: "User Deleted" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
