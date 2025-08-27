import { useState, useEffect } from "react";
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { SubHeading } from "../components/SubHeading";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getEndpointUrl } from "../config/api";

export const Signin = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved credentials
    const savedUsername = localStorage.getItem("remembered_username");
    if (savedUsername) {
      setUserName(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const validateInputs = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Email is required";
    } else if (!username.includes("@")) {
      newErrors.username = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      const response = await axios.post(getEndpointUrl('USER_SIGNIN'), {
        username,
        password,
      });

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("remembered_username", username);
      } else {
        localStorage.removeItem("remembered_username");
      }

      localStorage.setItem("token", response.data.token);

      // Get and store user ID
      const profileResponse = await axios.get(getEndpointUrl('USER_PROFILE'), {
        headers: {
          Authorization: "Bearer " + response.data.token,
        },
      });
      localStorage.setItem("userId", profileResponse.data._id);

      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Too many login attempts. Please try again later.");
      } else {
        const errorMessage =
          error.response?.data?.message ||
          (error.code === "ERR_NETWORK"
            ? "Unable to connect to server. Please try again."
            : "Invalid email or password");
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-100 to-purple-100 bg-opacity-80">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="flex flex-col justify-center relative z-10">
        <div className="rounded-xl bg-white w-96 text-center p-6 shadow-2xl">
          <Heading label={"Sign in"} />
          <SubHeading label={"Enter your credentials to access your account"} />

          <div className="space-y-4 mt-4">
            <div>
              <InputBox
                onChange={(e) => {
                  setUserName(e.target.value);
                  if (errors.username) {
                    setErrors({ ...errors, username: "" });
                  }
                }}
                value={username}
                placeholder="aman@example.com"
                label={"Email"}
                type="email"
              />
              {errors.username && (
                <div className="text-red-500 text-sm text-left mt-1">
                  {errors.username}
                </div>
              )}
            </div>

            <div>
              <InputBox
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors({ ...errors, password: "" });
                  }
                }}
                value={password}
                placeholder="Enter your password"
                label={"Password"}
                type="password"
              />
              {errors.password && (
                <div className="text-red-500 text-sm text-left mt-1">
                  {errors.password}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 text-sm text-gray-600"
                >
                  Remember me
                </label>
              </div>
              <button
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={handleSubmit}
              label={loading ? "Signing in..." : "Sign in"}
              disabled={loading}
            />
          </div>

          <BottomWarning
            label={"Don't have an account?"}
            buttonText={"Create Account"}
            to={"/signup"}
          />
        </div>
      </div>
    </div>
  );
};
