import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/user/userSlice";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { name, email, password, confirmPassword } = formData;

  const onChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await dispatch(registerUser({ name, email, password })).unwrap();

      toast.success("Account created successfully");

      navigate("/");
    } catch (err) {
      toast.error(err || "Registration failed");
    }
  };
  const { userInfo, status } = useSelector((state) => state.user);

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [userInfo, navigate]);

  return (
    <main className="max-w-md mx-auto mt-10 p-6 border rounded" role="main">
      <header>
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
      </header>

      <form onSubmit={onSubmit} aria-label="Register Form">
        <div className="mb-4">
          <label htmlFor="name" className="sr-only">
            Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Name"
            value={name}
            onChange={onChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={onChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={onChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="sr-only">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={onChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={
            status === "loading" ||
            !name ||
            !email ||
            !password ||
            !confirmPassword
          }
          className={`w-full p-2 rounded text-white transition ${
            status === "loading" ||
            !name ||
            !email ||
            !password ||
            !confirmPassword
              ? "bg-primary/50 cursor-not-allowed"
              : "bg-primary hover:opacity-100"
          }`}
        >
          {status === "loading" ? "Registering..." : "Register"}
        </button>
      </form>

      <footer className="mt-4 text-sm text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-green-800 hover:underline">
          Login
        </Link>
      </footer>
    </main>
  );
}

export default Register;
