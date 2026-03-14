import { useContext, useRef, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const ResetPassword = () => {

  axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);

  const inputRefs = useRef([]);

  // AUTO NEXT INPUT
  const handleInput = (e, index) => {

    if (e.target.value.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

  };

  // BACKSPACE PREVIOUS INPUT
  const handleKeyDown = (e, index) => {

    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

  };

  // OTP PASTE
  const handlePaste = (e) => {

    const paste = e.clipboardData.getData("text").slice(0, 6);
    const pasteArray = paste.split("");

    pasteArray.forEach((char, index) => {

      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }

    });

  };

  // SEND EMAIL
  const onSubmitEmail = async (e) => {

    e.preventDefault();

    try {

      const { data } = await axios.post(
        backendUrl + "/api/auth/send-reset-otp",
        { email }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }

  };

  // VERIFY OTP
  const onSubmitOtp = (e) => {

    e.preventDefault();

    const otp = inputRefs.current
      .map((input) => input?.value || "")
      .join("");

    if (otp.length !== 6) {
      toast.error("Enter complete OTP");
      return;
    }

    setIsOtpSubmitted(true);

  };

  // RESET PASSWORD
  const onSubmitPassword = async (e) => {

    e.preventDefault();

    const otp = inputRefs.current
      .map((input) => input?.value || "")
      .join("");

    try {

      const { data } = await axios.post(
        backendUrl + "/api/auth/reset-password",
        { email, otp, newPassword }
      );

      if (data.success) {

        toast.success(data.message);
        navigate("/login");

      } else {
        toast.error(data.message);
      }

    } catch (error) {

      toast.error(error.response?.data?.message || error.message);

    }

  };

  return (

    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">

      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      {/* EMAIL FORM */}

      {!isEmailSent && (

        <form
          onSubmit={onSubmitEmail}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >

          <h1 className="text-white text-2xl text-center mb-4">
            Reset Password
          </h1>

          <p className="text-center mb-6 text-indigo-300">
            Enter your registered email
          </p>

          <div className="mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">

            <img src={assets.mail_icon} className="w-4 h-4" />

            <input
              type="email"
              placeholder="Email"
              className="bg-transparent outline-none text-white w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>

          <button className="w-full py-2.5 bg-indigo-600 text-white rounded-full">
            Send OTP
          </button>

        </form>

      )}

      {/* OTP FORM */}

      {isEmailSent && !isOtpSubmitted && (

        <form
          onSubmit={onSubmitOtp}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >

          <h1 className="text-white text-2xl text-center mb-6">
            Enter OTP
          </h1>

          <div
            className="flex justify-between mb-8"
            onPaste={handlePaste}
          >

            {Array(6).fill(0).map((_, index) => (

              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength="1"
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                ref={(el) => { if (el) inputRefs.current[index] = el }}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                required
              />

            ))}

          </div>

          <button className="w-full py-2.5 bg-indigo-600 text-white rounded-full">
            Verify OTP
          </button>

        </form>

      )}

      {/* NEW PASSWORD */}

      {isOtpSubmitted && (

        <form
          onSubmit={onSubmitPassword}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >

          <h1 className="text-white text-2xl text-center mb-4">
            Set New Password
          </h1>

          <div className="mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">

            <img src={assets.lock_icon} className="w-4 h-4" />

            <input
              type="password"
              placeholder="New Password"
              className="bg-transparent outline-none text-white w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

          </div>

          <button className="w-full py-2.5 bg-indigo-600 text-white rounded-full">
            Reset Password
          </button>

        </form>

      )}

    </div>

  );

};

export default ResetPassword;