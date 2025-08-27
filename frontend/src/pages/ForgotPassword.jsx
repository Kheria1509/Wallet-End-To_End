import { useState } from "react";
import { Heading } from "../components/Heading";
import { SubHeading } from "../components/SubHeading";
import { InputBox } from "../components/InputBox";
import { Button } from "../components/Button";
import { BottomWarning } from "../components/BottomWarning";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getEndpointUrl } from "../config/api";

export const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestReset = async () => {
        if (!email.includes("@")) {
            toast.error("Please enter a valid email address");
            return;
        }

        try {
            setLoading(true);
            await axios.post(getEndpointUrl('USER_REQUEST_RESET'), { email });
            toast.success("Reset code sent to your email");
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send reset code");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!otp || !newPassword) {
            toast.error("Please fill in all fields");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        try {
            setLoading(true);
            await axios.post(getEndpointUrl('USER_RESET_PASSWORD'), {
                email,
                otp,
                newPassword,
            });
            toast.success("Password reset successful!");
            navigate("/signin");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-100 to-purple-100 bg-opacity-80">
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
            <div className="flex flex-col justify-center relative z-10">
                <div className="rounded-xl bg-white w-96 text-center p-6 shadow-2xl">
                    <Heading label={"Reset Password"} />
                    <SubHeading
                        label={
                            step === 1
                                ? "Enter your email to receive a reset code"
                                : "Enter the code sent to your email"
                        }
                    />

                    <div className="space-y-4 mt-4">
                        {step === 1 ? (
                            <>
                                <InputBox
                                    label="Email"
                                    placeholder="Enter your email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Button
                                    onClick={handleRequestReset}
                                    label={loading ? "Sending..." : "Send Reset Code"}
                                    disabled={loading}
                                />
                            </>
                        ) : (
                            <>
                                <InputBox
                                    label="Reset Code"
                                    placeholder="Enter the code from your email"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                                <InputBox
                                    label="New Password"
                                    placeholder="Enter your new password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <Button
                                    onClick={handleResetPassword}
                                    label={loading ? "Resetting..." : "Reset Password"}
                                    disabled={loading}
                                />
                            </>
                        )}
                    </div>

                    <BottomWarning
                        label="Remember your password?"
                        buttonText="Sign In"
                        to="/signin"
                    />
                </div>
            </div>
        </div>
    );
};
