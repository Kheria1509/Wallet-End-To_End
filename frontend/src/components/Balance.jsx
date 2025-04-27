import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const Balance = () => {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchBalance = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/v1/account/balance");
            setBalance(response.data.balance);
        } catch (error) {
            toast.error("Error fetching balance");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
        // Refresh balance every 15 seconds
        const interval = setInterval(fetchBalance, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
                <div className="text-xl font-semibold">Your Balance</div>
                <button 
                    onClick={fetchBalance}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                >
                    Refresh
                </button>
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-800">
                {loading ? (
                    <div className="text-gray-400">Loading...</div>
                ) : (
                    `₹${balance.toFixed(2)}`
                )}
            </div>
        </div>
    );
}