import { useState, useEffect } from "react";
import { Appbar } from "../components/AppBar";
import { InputBox } from "../components/InputBox";
import { Button } from "../components/Button";
import { Avatar } from "../components/Avatar";
import axios from "axios";
import toast from "react-hot-toast";

export const Profile = () => {
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        username: "",
        phone: "",
        avatar: ""
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/v1/user/profile");
            setProfile(response.data);
        } catch (error) {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (imageBase64) => {
        setProfile(prev => ({ ...prev, avatar: imageBase64 }));
        if (!isEditing) {
            setIsEditing(true);
        }
    };

    const handleUpdate = async () => {
        try {
            setUpdating(true);
            const updateData = {
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
                avatar: profile.avatar
            };

            if (currentPassword && newPassword) {
                updateData.currentPassword = currentPassword;
                updateData.password = newPassword;
            }

            await axios.put("http://localhost:3000/api/v1/user/profile", updateData);
            toast.success("Profile updated successfully");
            setIsEditing(false);
            setCurrentPassword("");
            setNewPassword("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Appbar />
                <div className="max-w-2xl mx-auto mt-8 px-4">
                    <div className="text-center">Loading profile...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Appbar />
            <div className="max-w-2xl mx-auto mt-8 px-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">Profile Settings</h1>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-blue-600 hover:text-blue-700"
                        >
                            {isEditing ? "Cancel" : "Edit"}
                        </button>
                    </div>

                    <div className="flex flex-col items-center mb-8">
                        <Avatar
                            name={`${profile.firstName} ${profile.lastName}`}
                            imageUrl={profile.avatar}
                            size="lg"
                            editable={isEditing}
                            onImageChange={handleAvatarChange}
                        />
                        <div className="mt-2 text-sm text-gray-600">
                            {isEditing ? "Click avatar to change" : ""}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputBox
                                label="First Name"
                                value={profile.firstName}
                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                disabled={!isEditing}
                                required
                            />
                            <InputBox
                                label="Last Name"
                                value={profile.lastName}
                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                disabled={!isEditing}
                                required
                            />
                            <InputBox
                                label="Email"
                                value={profile.username}
                                disabled={true}
                                type="email"
                            />
                            <InputBox
                                label="Phone"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                disabled={!isEditing}
                                required
                            />
                        </div>

                        {isEditing && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                                <div className="space-y-4">
                                    <InputBox
                                        label="Current Password"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                    />
                                    <InputBox
                                        label="New Password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                </div>
                            </div>
                        )}

                        {isEditing && (
                            <div className="mt-6">
                                <Button
                                    onClick={handleUpdate}
                                    label={updating ? "Updating..." : "Save Changes"}
                                    disabled={updating}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};