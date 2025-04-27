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
    <div className="bg-slate-300 h-screen flex justify-center">
      <div className="flex flex-col justify-center">
        <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
          <Heading label={"Sign in"} />
          <SubHeading label={"Enter your credentials to access your account"} />
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
          <div className="pt-4">
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
            buttonText={"Sign up"}
            to={"/signup"}
          />
        </div>
      </div>
    </div>
  );
};
