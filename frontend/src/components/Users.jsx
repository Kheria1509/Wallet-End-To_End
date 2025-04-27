import { useEffect, useState } from "react";
import { Button } from "./Button";
import { Avatar } from "./Avatar";
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
                // Filter out the current user from the list
                const currentUserId = localStorage.getItem("userId");
                const filteredUsers = response.data.user.filter(
                    (user) => user._id !== currentUserId
                );
                setUsers(filteredUsers);
            } catch (error) {
                toast.error("Error fetching users");
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
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Users</h2>
                </div>
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-3">
                            <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                            </div>
                            <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-1">Users</h2>
                    <p className="text-sm text-gray-500">Send money to your friends</p>
                </div>
                <div className="bg-blue-50 rounded-full px-4 py-2 text-sm text-blue-600 font-medium">
                    {users.length} {users.length === 1 ? 'user' : 'users'} available
                </div>
            </div>
            
            <div className="relative mb-6 group">
                <input
                    onChange={(e) => setFilter(e.target.value)}
                    value={filter}
                    type="text"
                    placeholder="Search users..."
                    className="w-full px-4 py-3.5 pl-12 pr-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                />
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-blue-500 transition-colors duration-200" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            <div className="space-y-3">
                {users.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-lg mb-2">
                            {filter ? "No users found matching your search" : "No users available"}
                        </p>
                        {filter && (
                            <p className="text-sm text-gray-400">
                                Try searching with a different name
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {users.map((user) => <User key={user._id} user={user} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

function User({ user }) {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <div 
            className="flex justify-between items-center p-4 hover:bg-blue-50/50 rounded-xl transition-all duration-200 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <Avatar
                        name={`${user.firstName} ${user.lastName}`}
                        imageUrl={user.avatar}
                        size="md"
                    />
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {user.firstName} {user.lastName}
                    </div>
                </div>
            </div>

            <button
                onClick={() => navigate(`/send?id=${user._id}&name=${user.firstName}`)}
                className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 ${isHovered ?  '-mr-4 translate-x-4 opacity-0' : '-mr-4 translate-x-4 opacity-0'} transition-all duration-200`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Money
            </button>
        </div>
    );
}
