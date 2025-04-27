import { useState } from "react";
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { SubHeading } from "../components/SubHeading";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    if (!acceptedTerms) {
      toast.error("Please accept the legal agreements");
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-100 to-purple-100 bg-opacity-80">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="flex flex-col justify-center relative z-10">
        <div className="rounded-xl bg-white w-96 text-center p-6 shadow-2xl">
          <Heading label={"Create Account"} />
          <SubHeading label={"Enter your information to create an account"} />
          
          <div className="space-y-4 mt-4">
            <InputBox
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              label={"First Name"}
            />
            <InputBox
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              label={"Last Name"}
            />
            <InputBox
              onChange={(e) => setUserName(e.target.value)}
              placeholder="john@example.com"
              label={"Email"}
              type="email"
            />
            <div>
              <div className="text-sm font-medium text-left py-2">Phone Number</div>
              <PhoneInput
                country={'in'}
                value={phone}
                onChange={setPhone}
                containerClass="w-full"
                inputStyle={{
                  width: '100%',
                  height: '38px',
                  fontSize: '14px',
                  borderRadius: '0.375rem',
                  borderColor: '#E2E8F0'
                }}
              />
            </div>
            <InputBox
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter a strong password"
              label={"Password"}
            />
            
            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 text-left">
                Accept Legal Agreements
              </label>
            </div>
          </div>

          <div className="mt-6">
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
                      phone,
                      acceptedTerms
                    }
                  );
                  localStorage.setItem("token", response.data.token);
                  toast.success("Account created successfully!");
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
              label={loading ? "Creating account..." : "Sign Up"}
              disabled={loading || !acceptedTerms}
            />
          </div>
          
          <BottomWarning
            label={"Already have an account?"}
            buttonText={"Log in"}
            to={"/signin"}
          />
        </div>
      </div>
    </div>
  );
};
