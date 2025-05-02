import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Avatar } from "./Avatar";
import { NotificationBell } from "./NotificationBell";
import axios from "axios";

export const Appbar = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        avatar: ""
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/v1/user/profile");
                setProfile(response.data);
            } catch (error) {
                console.error("Error fetching user profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/signin');
    };

    return (
        <div className="shadow h-14 flex justify-between items-center px-4">
            <Link to="/dashboard" className="text-xl font-semibold hover:text-gray-600">
                PayTM App
            </Link>
            
            <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="hover:text-gray-600">
                    Dashboard
                </Link>
                <NotificationBell />
                <Link to="/profile" className="flex items-center hover:text-gray-600">
                    <Avatar
                        name={`${profile.firstName} ${profile.lastName}`}
                        imageUrl={profile.avatar}
                        size="sm"
                    />
                    <span className="ml-2 font-medium">
                        {loading ? "Loading..." : `Hi, ${profile.firstName}`}
                    </span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 font-medium"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};