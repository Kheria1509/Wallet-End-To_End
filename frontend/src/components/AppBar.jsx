import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

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

        // Close menu when clicking outside
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/signin');
    };

    return (
        <div className="shadow h-14 flex justify-between items-center px-4 relative">
            <Link to="/dashboard" className="text-xl font-semibold hover:text-gray-600">
                PayTM App
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
                <Link to="/dashboard" className="hover:text-gray-600">
                    Dashboard
                </Link>
                <Link to="/recurring" className="hover:text-gray-600">
                    Recurring Transfers
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

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-3">
                <Link to="/profile" className="flex items-center hover:text-gray-600">
                    <Avatar
                        name={`${profile.firstName} ${profile.lastName}`}
                        imageUrl={profile.avatar}
                        size="sm"
                    />
                    <span className="ml-2 font-medium">
                        {loading ? "..." : `Hi, ${profile.firstName}`}
                    </span>
                </Link>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div 
                    ref={menuRef}
                    className="absolute top-full right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50"
                >
                    <div className="px-4 py-2 text-xs text-gray-500">Menu</div>
                    
                    <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Dashboard
                    </Link>
                    
                    <Link
                        to="/recurring"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Recurring Transfers
                    </Link>
                    
                    <Link
                        to="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Notifications
                    </Link>
                    
                    <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Profile Settings
                    </Link>
                    
                    <button
                        onClick={() => {
                            setIsMenuOpen(false);
                            handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};