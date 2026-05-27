import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { checkout, resetCheckoutStatus } from "../features/orders/orderSlice";
import { clearCart, getCart } from "../features/carts/cartSlice";
import toast from "react-hot-toast";

const phoneRegex = /^\+?[0-9\s()-]{7,20}$/;
const minAddressLength = 10;

const isValidPhone = (phone) => {
  const digitsOnly = phone.replace(/\D/g, "");
  return (
    phoneRegex.test(phone) && digitsOnly.length >= 7 && digitsOnly.length <= 15
  );
};

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cart, cart_items, shippingMethod } = useSelector(
    (state) => state.cart
  );
  const { checkoutStatus, checkoutError } = useSelector(
    (state) => state.orders
  );
  const userInfo = useSelector((state) => state.user.userInfo);

  const [address, setAddress] = useState(userInfo?.address || "");
  const [phone, setPhone] = useState(userInfo?.phone || "");
  const [paymentMethod, setPaymentMethod] = useState("mock_card");
  const [couponCode, setCouponCode] = useState("");

  useEffect(() => {
    dispatch(getCart());

    return () => {
      dispatch(resetCheckoutStatus());
    };
  }, [dispatch]);

  const subtotal = cart_items?.reduce(
    (sum, item) => sum + Number(item.total_price),
    0
  );
  const discount = Number(cart?.discount_amount || 0);

  // Calculate shipping fee based on shipping method and subtotal
  let shippingFee = 0;
  if (shippingMethod === "express") {
    shippingFee = subtotal >= 60 ? 5.99 : 7.99;
  } else if (shippingMethod === "standard") {
    shippingFee = subtotal >= 60 ? 0 : 5.99;
  }

  const totalAmount = subtotal + shippingFee - discount;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (address.trim().length < minAddressLength) {
      toast.error("Shipping address must be at least 10 characters");
      return;
    }

    if (!isValidPhone(phone.trim())) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const orderData = {
      shipping_address: address.trim(),
      phone: phone.trim(),
      shipping_method: shippingMethod,
      payment_method: paymentMethod,
      coupon_code: couponCode.trim() || null,
    };

    dispatch(checkout(orderData));
  };
  useEffect(() => {
    if (checkoutStatus === "succeeded") {
      dispatch(clearCart());
      toast.success("Order placed successfully! Thank you.");
      setTimeout(() => {
        dispatch(resetCheckoutStatus());
        navigate("/me");
      }, 1000);
    } else if (checkoutStatus === "failed" && checkoutError) {
      toast.error(`Order failed: ${checkoutError}`);
    }
  }, [checkoutStatus, checkoutError, dispatch, navigate]);

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col justify-around lg:flex-row gap-8">
      {/* Left: Shipping & Payment Form */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-md space-y-6">
        <h2 className="text-2xl font-bold mb-4">Shipping & Payment Details</h2>

        <div>
          <label className="block mb-1 font-semibold">Email</label>
          <input
            type="email"
            readOnly
            value={userInfo?.email || ""}
            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Shipping Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            minLength={minAddressLength}
            className="w-full border rounded px-3 py-2"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Must be at least 10 characters.
          </p>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Use 7 to 15 digits. Spaces, brackets and + are allowed.
          </p>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="mock_card">Credit Card (Mock)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={checkoutStatus === "loading"}
          className="bg-primary text-white px-6 py-3 rounded-3xl hover:bg-green-800"
        >
          {checkoutStatus === "loading" ? "Processing..." : "Place Order"}
        </button>
      </form>

      {/* Right: Order Summary */}
      <div className="w-full lg:w-96 bg-gray-50 p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>

        {/* Product list */}
        <div className="max-h-56 overflow-y-auto space-y-4 mb-4">
          {cart_items.map((item) => (
            <Link
              to={`/products/${item.product_id}`}
              key={item.id}
              className="flex gap-4 items-center"
            >
              <img
                src={item.product_image_url || "/placeholder.png"}
                alt={item.variant_name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-semibold">{item.variant_name}</p>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity}
                </p>
                <p className="text-sm text-gray-600 truncate max-w-xs">
                  {item.product_description || ""}
                </p>
              </div>
              <p className="font-bold">
                £{Number(item.total_price).toFixed(2)}
              </p>
            </Link>
          ))}
        </div>

        {/* Price breakdown */}
        <div className="space-y-2 text-gray-700 text-sm">
          <div className="flex justify-between">
            <span>Subtotal · {cart_items.length} items</span>
            <span>£{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>£{shippingFee.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-£{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span>£{totalAmount.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-500">This includes 20% VAT</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
