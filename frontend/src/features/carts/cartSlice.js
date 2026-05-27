import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import cartService from "./cartService";

// Thunks
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ product_variant_id, quantity }, thunkAPI) => {
    try {
      return await cartService.addToCart(product_variant_id, quantity);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const getCart = createAsyncThunk("cart/getCart", async (_, thunkAPI) => {
  try {
    return await cartService.getCart();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateCartItemQuantity = createAsyncThunk(
  "cart/updateCartItemQuantity",
  async ({ cartItemId, quantity }, thunkAPI) => {
    try {
      return await cartService.updateCartItemQuantity(cartItemId, quantity);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  "cart/removeItemFromCart",
  async (cartItemId, thunkAPI) => {
    try {
      return await cartService.removeItemFromCart(cartItemId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const initialState = {
  cart: null,
  cart_items: [],
  shippingMethod: "standard",
  status: "idle",
  error: null,
};

// Slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setShippingMethod: (state, action) => {
      state.shippingMethod = action.payload;
    },
    clearCart: (state) => {
      state.cart = null;
      state.cart_items = [];
      state.shippingMethod = "standard";
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        const existing = state.cart_items.find(
          (item) => item.id === action.payload.id
        );
        if (existing) {
          existing.quantity = action.payload.quantity;
          existing.total_price = action.payload.total_price;
        } else {
          state.cart_items.push(action.payload);
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(getCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cart = action.payload.cart;
        state.cart_items = action.payload.cart_items;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.cart = null;
        state.cart_items = [];
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updated = action.payload;
        const existing = state.cart_items.find(
          (item) => item.id === updated.id
        );

        if (existing) {
          existing.quantity = updated.quantity;
          existing.total_price = updated.total_price;
        }

        // If quantity becomes 0, remove the item locally as well
        if (updated.quantity === 0) {
          state.cart_items = state.cart_items.filter(
            (item) => item.id !== updated.id
          );
        }
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(removeItemFromCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Remove the deleted item from state.cart_items
        state.cart_items = state.cart_items.filter(
          (item) => item.id !== action.meta.arg
        );
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setShippingMethod, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
