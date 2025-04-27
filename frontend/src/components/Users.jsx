import { useEffect, useState } from "react";
import { Button } from "./Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3000/api/v1/user/bulk?filter=${filter}`
        );
        setUsers(response.data.user);
      } catch (error) {
        toast.error("Error fetching users");
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to avoid too many requests while typing
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filter]);

  if (loading) {
    return (
      <div className="mt-6">
        <div className="font-bold text-lg mb-4">Users</div>
        <div className="text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <>
      <div className="font-bold mt-6 text-lg">Users</div>
      <div className="my-2">
        <input
          onChange={(e) => {
            setFilter(e.target.value);
          }}
          value={filter}
          type="text"
          placeholder="Search users..."
          className="w-full px-2 py-1 border rounded border-slate-200"
        />
      </div>
      <div className="space-y-2">
        {users.length === 0 ? (
          <div className="text-gray-600">No users found</div>
        ) : (
          users.map((user) => <User key={user._id} user={user} />)
        )}
      </div>
    </>
  );
};

function User({ user }) {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center items-center">
          <div className="text-xl">{user.firstName[0].toUpperCase()}</div>
        </div>
        <div className="ml-4">
          <div className="font-medium">
            {user.firstName} {user.lastName}
          </div>
        </div>
      </div>

      <Button
        onClick={() => {
          navigate(`/send?id=${user._id}&name=${user.firstName}`);
        }}
        label={"Send Money"}
      />
    </div>
  );
}
