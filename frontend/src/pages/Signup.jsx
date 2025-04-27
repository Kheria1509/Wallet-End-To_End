import { useState } from "react";
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { SubHeading } from "../components/SubHeading";
import { PasswordStrength } from "../components/PasswordStrength";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateInputs = () => {
    if (!firstName.trim()) {
      toast.error("First name is required");
      return false;
    }
    if (!lastName.trim()) {
      toast.error("Last name is required");
      return false;
    }
    if (!username.trim() || !username.includes("@")) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }
    return true;
  };

  return (
    <div className="bg-slate-300 h-screen flex justify-center">
      <div className="flex flex-col justify-center">
        <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
          <Heading label={"Sign up"} />
          <SubHeading label={"Enter your information to create an account"} />
          <InputBox
            onChange={(e) => {
              setFirstName(e.target.value);
            }}
            placeholder="John"
            label={"First Name"}
          />
          <InputBox
            onChange={(e) => {
              setLastName(e.target.value);
            }}
            placeholder="Doe"
            label={"Last Name"}
          />
          <InputBox
            onChange={(e) => {
              setUserName(e.target.value);
            }}
            placeholder="john@example.com"
            label={"Email"}
          />
          <div className="mb-4">
            <InputBox
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              type="password"
              placeholder="Enter a strong password"
              label={"Password"}
            />
            <PasswordStrength password={password} />
          </div>
          <div className="pt-4">
            <Button
              onClick={async () => {
                if (!validateInputs()) return;
                
                try {
                  setLoading(true);
                  const response = await axios.post(
                    "http://localhost:3000/api/v1/user/signup",
                    {
                      username,
                      password,
                      firstName,
                      lastName,
                    },
                    {
                      headers: {
                        'Content-Type': 'application/json'
                      }
                    }
                  );
                  localStorage.setItem("token", response.data.token);
                  toast.success("Signup successful!");
                  navigate("/dashboard");
                } catch (error) {
                  const errorMessage = error.response?.data?.message || 
                    (error.code === 'ERR_NETWORK' ? 
                      "Unable to connect to server. Please try again." : 
                      "Signup failed. Please try again.");
                  toast.error(errorMessage);
                } finally {
                  setLoading(false);
                }
              }}
              label={loading ? "Creating account..." : "Sign up"}
              disabled={loading}
            />
          </div>
          <BottomWarning
            label={"Already have an account?"}
            buttonText={"Sign in"}
            to={"/signin"}
          />
        </div>
      </div>
    </div>
  );
};
