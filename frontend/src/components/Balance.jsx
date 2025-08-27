import { useEffect, useState } from "react";
import axios from "axios";
import { getEndpointUrl } from "../config/api";

export const Balance = () => {
  const [balance, setBalance] = useState(null); // initially null

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          getEndpointUrl('ACCOUNT_BALANCE'),
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBalance(res.data.balance); // assuming { balance: 1000 }
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, []);

  return (
    <div>
      <h2>Wallet Balance</h2>
      {balance !== null ? (
        <p>Your Balance: ₹{balance.toFixed(2)}</p>
      ) : (
        <p>Loading balance...</p>
      )}
    </div>
  );
};

export default Balance;
