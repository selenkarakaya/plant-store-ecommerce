import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "./userService";

// user register
export const registerUser = createAsyncThunk(
  "user/register",
  async (userData, thunkAPI) => {
    try {
      return await userService.register(userData);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// user login
export const loginUser = createAsyncThunk(
  "user/login",
  async (userData, thunkAPI) => {
    try {
      return await userService.login(userData);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// user fetch profile
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, thunkAPI) => {
    try {
      return await userService.getProfile();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// user info update
export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData, thunkAPI) => {
    try {
      return await userService.updateProfile(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// password change
export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (passwordData, thunkAPI) => {
    try {
      return await userService.changePassword(passwordData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// user logout
export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, thunkAPI) => {
    try {
      return await userService.logout();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const initialState = {
  userInfo: null,

  status: "idle", // register/login/logout general status
  error: null,

  profile: null,
  profileStatus: "idle",
  profileError: null,

  updateStatus: "idle",
  passwordStatus: "idle",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    clearUser: (state) => {
      state.userInfo = null;
      state.profile = null;
      state.status = "idle";
      state.error = null;
      state.profileStatus = "idle";
      state.profileError = null;
      state.updateStatus = "idle";
      state.passwordStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userInfo = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userInfo = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileStatus = "loading";
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.profile = action.payload;
        state.userInfo = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileStatus = "failed";
        state.profileError = action.payload;
      })

      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.updateStatus = "loading";
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.userInfo = action.payload;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state) => {
        state.updateStatus = "failed";
      })

      // Change password
      .addCase(changePassword.pending, (state) => {
        state.passwordStatus = "loading";
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordStatus = "succeeded";
      })
      .addCase(changePassword.rejected, (state) => {
        state.passwordStatus = "failed";
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.userInfo = null;
        state.profile = null;
        state.status = "idle";
        state.error = null;
        state.profileStatus = "idle";
        state.profileError = null;
        state.updateStatus = "idle";
        state.passwordStatus = "idle";
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setUserInfo, clearUser } = userSlice.actions;
export default userSlice.reducer;
