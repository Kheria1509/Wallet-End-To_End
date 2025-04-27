import { useState, useEffect } from "react";
import axios from "axios";

export const Balance = () => {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/v1/account/balance");
                setBalance(response.data.balance);
            } catch (error) {
                console.error("Error fetching balance:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
    }, []);

    return (
        <div className="flex">
            <div className="font-bold text-lg">
                Your Balance
            </div>
            <div className="font-semibold ml-4 text-lg">
                {loading ? "Loading..." : `Rs ${balance.toFixed(2)}`}
            </div>
        </div>
    );
}