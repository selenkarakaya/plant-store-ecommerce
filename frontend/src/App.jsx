import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, setUserInfo } from "./features/user/userSlice";
import { clearCart, getCart } from "./features/carts/cartSlice";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";
import ProductDetailPage from "./pages/ProductDetailPage";
import PrivateRoute from "./utils/PrivateRoute";
import ProductListPage from "./components/ProductListPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import SearchResultsPage from "./pages/SearchResultsPage";

function App() {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await dispatch(fetchUserProfile()).unwrap();
        dispatch(setUserInfo(result)); // store the user in redux
      } catch (err) {
        console.log("Session not found:", err.message);
      }
    };

    if (!userInfo) {
      checkAuth();
    }
  }, [dispatch, userInfo]);

  useEffect(() => {
    if (userInfo) {
      dispatch(getCart());
    } else {
      dispatch(clearCart());
    }
  }, [dispatch, userInfo]);

  return (
    <>
      <Router>
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              borderRadius: "8px",
              background: "#333",
              color: "#fff",
            },

            success: {
              duration: 2000,
              theme: {
                primary: "green",
                secondary: "white",
              },
            },
            error: {
              duration: 3000,
              theme: {
                primary: "red",
                secondary: "white",
              },
            },
          }}
        />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PrivateRoute />}>
            <Route path="/me" element={<UserProfile />} />
          </Route>
          <Route path="/shoppingCart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/category/:categoryId" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
        </Routes>
        <Footer />
      </Router>
    </>
  );
}

export default App;
