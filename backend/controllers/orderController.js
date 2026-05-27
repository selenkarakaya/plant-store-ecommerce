const asyncHandler = require("express-async-handler");
const db = require("../db");

const phoneRegex = /^\+?[0-9\s()-]{7,20}$/;
const minAddressLength = 10;

const isValidPhone = (phone) => {
  if (!phone) return false;
  const digitsOnly = phone.replace(/\D/g, "");
  return phoneRegex.test(phone) && digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

const checkoutOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    shipping_address,
    phone,
    shipping_method = "standard",
    payment_method = "mock_card",
  } = req.body;
  const trimmedShippingAddress = shipping_address?.trim();
  const trimmedPhone = phone?.trim();

  if (!trimmedShippingAddress) {
    res.status(400);
    throw new Error("Shipping address is required");
  }

  if (trimmedShippingAddress.length < minAddressLength) {
    res.status(400);
    throw new Error("Shipping address must be at least 10 characters.");
  }

  if (!isValidPhone(trimmedPhone)) {
    res.status(400);
    throw new Error("Please enter a valid phone number.");
  }

  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    // Get active cart
    const cartRes = await client.query(
      `SELECT * FROM carts WHERE user_id = $1 AND status = 'active' FOR UPDATE`,
      [userId]
    );
    const cart = cartRes.rows[0];

    if (!cart) {
      res.status(400);
      throw new Error("No active cart found");
    }

    // Get cart contents with locked stock rows so stock cannot be oversold.
    const itemsRes = await client.query(
      `SELECT
        ci.*,
        pv.stock,
        pv.variant_name
      FROM cart_items ci
      JOIN product_variants pv ON ci.product_variant_id = pv.id
      WHERE ci.cart_id = $1
      FOR UPDATE OF pv`,
      [cart.id]
    );
    const cartItems = itemsRes.rows;

    if (cartItems.length === 0) {
      res.status(400);
      throw new Error("Your cart is empty");
    }

    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        res.status(400);
        throw new Error(
          `Only ${item.stock} items in stock for ${item.variant_name}`
        );
      }
    }

    // Mock payment -> successful
    const subtotal = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.total_price),
      0
    );
    let shippingFee = 0;
    if (shipping_method === "express") {
      shippingFee = subtotal >= 60 ? 5.99 : 7.99;
    } else if (shipping_method === "standard") {
      shippingFee = subtotal >= 60 ? 0 : 5.99;
    } else {
      res.status(400);
      throw new Error("Invalid shipping method");
    }

    const discount = cart.discount_amount || 0;
    const totalAmount = subtotal + shippingFee - discount;

    // Create the order
    const orderRes = await client.query(
      `INSERT INTO orders
       (user_id, status, shipping_method, shipping_fee, coupon_code, discount_amount, total_amount, shipping_address, payment_method, created_at, updated_at)
       VALUES ($1, 'paid', $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [
        userId,
        shipping_method,
        shippingFee,
        cart.coupon_code,
        discount,
        totalAmount,
        trimmedShippingAddress,
        payment_method,
      ]
    );
    const order = orderRes.rows[0];

    // Save order items and decrease stock
    for (const item of cartItems) {
      await client.query(
        `INSERT INTO order_items
        (order_id, product_variant_id, quantity, unit_price, total_price)
        VALUES ($1, $2, $3, $4, $5)`,
        [
          order.id,
          item.product_variant_id,
          item.quantity,
          item.unit_price,
          item.total_price,
        ]
      );

      await client.query(
        `UPDATE product_variants
         SET stock = stock - $1
         WHERE id = $2`,
        [item.quantity, item.product_variant_id]
      );
    }

    // Close the cart
    await client.query(
      `UPDATE carts SET status = 'completed', updated_at = NOW() WHERE id = $1`,
      [cart.id]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Payment successful, order placed",
      order_id: order.id,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const ordersRes = await db.query(
    `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );

  res.json(ordersRes.rows);
});

const getOrderDetails = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.params;

  // Get the order and check if it belongs to this user
  const orderRes = await db.query(`SELECT * FROM orders WHERE id = $1`, [
    orderId,
  ]);
  const order = orderRes.rows[0];

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user_id !== userId) {
    res.status(403);
    throw new Error("You are not authorized to view this order");
  }

  // order_items + product details
  const itemsRes = await db.query(
    `
      SELECT
        oi.id AS order_item_id,
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        pv.id AS variant_id,
        pv.variant_name,
        p.name AS product_name,
        p.image_url
      FROM order_items oi
      JOIN product_variants pv ON oi.product_variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE oi.order_id = $1
      `,
    [orderId]
  );

  res.json({
    order,
    items: itemsRes.rows,
  });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const ordersRes = await db.query(`
    SELECT o.*, u.name AS user_name, u.email AS user_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `);

  res.json(ordersRes.rows);
});

module.exports = { checkoutOrder, getMyOrders, getOrderDetails, getAllOrders };
