import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../features/user/userSlice";
import UserInfo from "../components/UserInfo";
import UserOrders from "../components/UserOrders";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("orders"); // 'profile' | 'orders'

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();

      toast.success("Logged out successfully");

      navigate("/login");
    } catch (err) {
      toast.error(err || "Logout failed");
    }
  };

  return (
    <main
      className="flex flex-col md:flex-row md:items-center max-w-5xl mx-auto mt-10 p-6 gap-6 shadow rounded"
      role="main"
    >
      {/* Navigation - Tabs */}
      <nav
        className="flex md:flex-col justify-center md:justify-start gap-4 font-semibold w-full md:w-1/4"
        aria-label="User tabs"
      >
        <button
          onClick={() => setSelectedTab("profile")}
          aria-current={selectedTab === "profile" ? "page" : undefined}
          className={`px-4 py-2 rounded-md cursor-pointer w-full md:w-auto text-center ${
            selectedTab === "profile"
              ? "bg-terracotta text-white"
              : "bg-gray-200 text-gray-700 border border-terracotta"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setSelectedTab("orders")}
          aria-current={selectedTab === "orders" ? "page" : undefined}
          className={`px-4 py-2 rounded-md cursor-pointer w-full md:w-auto text-center ${
            selectedTab === "orders"
              ? "bg-terracotta text-white"
              : "bg-gray-200 text-gray-700 border border-terracotta"
          }`}
        >
          Orders
        </button>
        <button
          onClick={handleLogout}
          className="text-terracotta font-bold border-b border-terracotta px-4 py-2 hover:scale-105 cursor-pointer w-full md:w-auto text-center"
        >
          Logout
        </button>
      </nav>

      {/* Content Section */}
      <section aria-labelledby="profile-heading" className="w-full md:w-3/4">
        {selectedTab === "profile" && <UserInfo />}
        {selectedTab === "orders" && <UserOrders />}
      </section>
    </main>
  );
};

export default ProfilePage;
