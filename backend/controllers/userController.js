const bcrypt = require("bcrypt");
const db = require("../db");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const phoneRegex = /^\+?[0-9\s()-]{7,20}$/;
const minAddressLength = 10;

const isValidPhone = (phone) => {
  if (!phone) return true;
  const digitsOnly = phone.replace(/\D/g, "");
  return phoneRegex.test(phone) && digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

const validateEmail = (email) => emailRegex.test(email);
const validatePassword = (password) => passwordRegex.test(password);
const validateAddress = (address) =>
  !address || address.trim().length >= minAddressLength;

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  const trimmedName = name?.trim();
  const trimmedEmail = email?.trim().toLowerCase();
  const trimmedPhone = phone?.trim();
  const trimmedAddress = address?.trim();

  if (!trimmedName || !trimmedEmail || !password) {
    res.status(400);
    throw new Error("Name, email and password are required.");
  }

  if (!validateEmail(trimmedEmail)) {
    res.status(400);
    throw new Error("Please enter a valid email address.");
  }

  if (!validatePassword(password)) {
    res.status(400);
    throw new Error(
      "Password must be at least 8 characters and include one uppercase letter and one number."
    );
  }

  if (!isValidPhone(trimmedPhone)) {
    res.status(400);
    throw new Error("Please enter a valid phone number.");
  }

  if (!validateAddress(trimmedAddress)) {
    res.status(400);
    throw new Error("Address must be at least 10 characters.");
  }

  const { rows } = await db.query("SELECT id FROM users WHERE email = $1", [
    trimmedEmail,
  ]);
  if (rows.length > 0) {
    res.status(409);
    throw new Error("Email already registered");
  }

  const saltRounds = 10;
  const password_hash = await bcrypt.hash(password, saltRounds);

  const query = `
    INSERT INTO users (name, email, password_hash, phone, address, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING id, name, email, phone, address, created_at, updated_at
  `;

  const userData = [
    trimmedName,
    trimmedEmail,
    password_hash,
    trimmedPhone || null,
    trimmedAddress || null,
  ];

  const result = await db.query(query, userData);

  res.status(201).json({ user: result.rows[0] });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = email?.trim().toLowerCase();

  if (!trimmedEmail || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  if (!validateEmail(trimmedEmail)) {
    res.status(400);
    throw new Error("Please enter a valid email address.");
  }

  const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [
    trimmedEmail,
  ]);
  const user = rows[0];

  if (!user) {
    res.status(401);
    throw new Error("Incorrect email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    res.status(401);
    throw new Error("Incorrect email or password");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, is_admin: user.is_admin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24,
  });

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      is_admin: user.is_admin,
    },
  });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);

  if (!rows[0]) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(rows[0]);
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { name, email, phone, address } = req.body;
  const trimmedName = name?.trim();
  const trimmedEmail = email?.trim().toLowerCase();
  const trimmedPhone = phone?.trim();
  const trimmedAddress = address?.trim();

  const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  const user = rows[0];

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (trimmedEmail && !validateEmail(trimmedEmail)) {
    res.status(400);
    throw new Error("Please enter a valid email address.");
  }

  if (!isValidPhone(trimmedPhone)) {
    res.status(400);
    throw new Error("Please enter a valid phone number.");
  }

  if (!validateAddress(trimmedAddress)) {
    res.status(400);
    throw new Error("Address must be at least 10 characters.");
  }

  if (trimmedEmail && trimmedEmail !== user.email) {
    const existingUser = await db.query(
      "SELECT id FROM users WHERE email = $1 AND id <> $2",
      [trimmedEmail, id]
    );

    if (existingUser.rows.length > 0) {
      res.status(409);
      throw new Error("Email already registered");
    }
  }

  const updated = await db.query(
    `
    UPDATE users
    SET name = $1, email = $2, phone = $3, address = $4, updated_at = NOW()
    WHERE id = $5
    RETURNING id, name, email, phone, address, updated_at
  `,
    [
      trimmedName || user.name,
      trimmedEmail || user.email,
      trimmedPhone || user.phone,
      trimmedAddress || user.address,
      id,
    ]
  );

  res.json(updated.rows[0]);
});

const changeUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || !currentPassword) {
    res.status(400);
    throw new Error("Both current and new password are required");
  }

  if (!validatePassword(newPassword)) {
    res.status(400);
    throw new Error(
      "Password must be at least 8 characters and include one uppercase letter and one number."
    );
  }

  const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  const user = rows[0];
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  const saltRounds = 10;
  const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

  await db.query(
    `
    UPDATE users
    SET password_hash = $1, updated_at = NOW()
    WHERE id = $2
  `,
    [newPasswordHash, id]
  );

  res.json({ message: "Password updated successfully" });
});

const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.json({ message: "Logged out successfully" });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  logoutUser,
};
