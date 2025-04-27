import { useState } from "react";
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { SubHeading } from "../components/SubHeading";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const Signin = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateInputs = () => {
    if (!username.trim() || !username.includes("@")) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!password) {
      toast.error("Password is required");
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-100 to-purple-100 bg-opacity-80">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="flex flex-col justify-center relative z-10">
        <div className="rounded-xl bg-white w-96 text-center p-6 shadow-2xl">
          <Heading label={"Sign in"} />
          <SubHeading label={"Enter your credentials to access your account"} />
          
          <div className="space-y-4 mt-4">
            <InputBox
              onChange={(e) => {
                setUserName(e.target.value);
              }}
              placeholder="john@example.com"
              label={"Email"}
              type="email"
            />
            <InputBox
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder="Enter your password"
              label={"Password"}
              type="password"
            />
          </div>

          <div className="mt-6">
            <Button 
              onClick={async () => {
                if (!validateInputs()) return;
                
                try {
                  setLoading(true);
                  const response = await axios.post(
                    "http://localhost:3000/api/v1/user/signin",
                    {
                      username,
                      password,
                    },
                    {
                      headers: {
                        'Content-Type': 'application/json'
                      }
                    }
                  );
                  localStorage.setItem("token", response.data.token);
                  toast.success("Login successful!");
                  navigate("/dashboard");
                } catch (error) {
                  if (error.response?.status === 429) {
                    toast.error("Too many login attempts. Please try again later.");
                  } else {
                    const errorMessage = error.response?.data?.message || 
                      (error.code === 'ERR_NETWORK' ? 
                        "Unable to connect to server. Please try again." : 
                        "Invalid email or password");
                    toast.error(errorMessage);
                  }
                } finally {
                  setLoading(false);
                }
              }}
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
