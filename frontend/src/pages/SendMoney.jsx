import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export const SendMoney = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");
  const name = searchParams.get("name");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Prevent sending money to self by checking URL params
    const currentUserId = localStorage.getItem("userId");
    if (id === currentUserId) {
      toast.error("You cannot send money to yourself");
      navigate("/dashboard");
      return;
    }
  }, [id, navigate]);

  const handleTransfer = async () => {
    try {
      setLoading(true);
      if (!amount || amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      // Double-check that user is not sending to themselves
      const currentUserId = localStorage.getItem("userId");
      if (id === currentUserId) {
        toast.error("You cannot send money to yourself");
        return;
      }

      await axios.post(
        "https://wallet-end-to-end-backend.vercel.app/api/v1/account/transfer",
        {
          to: id,
          amount: parseInt(amount),
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      // Store the current user's ID in localStorage if not already there
      if (!localStorage.getItem("userId")) {
        const response = await axios.get("https://wallet-end-to-end-backend.vercel.app/api/v1/user/profile", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        localStorage.setItem("userId", response.data._id);
      }

      toast.success("Transfer successful!");
      navigate("/dashboard");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        (error.code === "ERR_NETWORK"
          ? "Unable to connect to server. Please try again."
          : "Transfer failed. Please try again.");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center h-screen bg-gray-100">
      <div className="h-full flex flex-col justify-center">
        <div className="border h-min text-card-foreground max-w-md p-4 space-y-8 w-96 bg-white shadow-lg rounded-lg shape">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-3xl font-bold text-center">Send Money</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-2xl text-white">{name[0].toUpperCase()}</span>
              </div>
              <h3 className="text-2xl font-semibold">{name}</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="amount"
                >
                  Amount (in Rs)
                </label>
                <input
                  onChange={(e) => {
                    setAmount(e.target.value);
                  }}
                  type="number"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  id="amount"
                  placeholder="Enter amount"
                />
              </div>
              <button
                onClick={handleTransfer}
                disabled={loading}
                className={`justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 w-full bg-green-500 text-white ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
                }`}
              >
                {loading ? "Processing..." : "Initiate Transfer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
