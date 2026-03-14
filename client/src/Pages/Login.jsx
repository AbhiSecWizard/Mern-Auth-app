import React, { useState, useContext} from "react";
import axios from "axios";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";

const Login = () => {

  const {backendUrl,setIsLoggedin,getUserData} = useContext(AppContent);
  const navigate = useNavigate();

  const [state, setState] =useState("Sign Up");
  const [name, setName] =useState("");
  const [email, setEmail] =useState("");
  const [password, setPassword] =useState("");
  
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {

      axios.defaults.withCredentials = true;

      if (state === "Sign Up") {

        const { data } = await axios.post(
          backendUrl+"/api/auth/register",
          { name, email, password }
        );

        if (data.success) {
          setIsLoggedin(true);
          toast.success("Account Created Successfully");
          getUserData()
          navigate("/");
        } else {
          toast.error(data.message);
        }

      } else {

        const { data } = await axios.post(
          backendUrl + "/api/auth/login",
          { email, password }
        );

        if (data.success) {
          setIsLoggedin(true);
          getUserData()
          toast.success("Login Successful");
          navigate("/");
        } else {
          toast.error(data.message);
        }

      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">

      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">

        <h2 className="text-center sm:text-4xl text-3xl font-bold mb-3 text-white">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>

        <p className="text-center mb-6">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account"}
        </p>

        <form onSubmit={onSubmitHandler}>

          {state === "Sign Up" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="" />
              <input
                type="text"
                placeholder="Full Name"
                className="bg-transparent outline-none w-full"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
              />
            </div>
          )}

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" />
            <input
              type="email"
              placeholder="Email"
              className="bg-transparent outline-none w-full"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" />
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent outline-none w-full"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>

          <p
            onClick={() => navigate("/reset-password")}
            className="text-indigo-500 cursor-pointer mb-4"
          >
            Forgot Password?
          </p>

          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer"
          >
            {state === "Sign Up" ? "Create Account" : "Login"}
          </button>

        </form>

        {state === "Sign Up" ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-blue-400 cursor-pointer underline"
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">
            Don't have an account?{" "}
            <span
              onClick={() => setState("Sign Up")}
              className="text-blue-400 cursor-pointer underline"
            >
              Sign Up
            </span>
          </p>
        )}

      </div>
    </div>
  );
};

export default Login;