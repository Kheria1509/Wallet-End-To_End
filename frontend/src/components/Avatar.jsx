import { useState } from 'react';

export const Avatar = ({ 
    name, 
    imageUrl = '', 
    size = 'md', 
    onImageChange,
    editable = false 
}) => {
    const [isHovering, setIsHovering] = useState(false);

    const sizeClasses = {
        sm: 'h-8 w-8 text-sm',
        md: 'h-12 w-12 text-base',
        lg: 'h-20 w-20 text-xl'
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return parts[0][0].toUpperCase();
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file && onImageChange) {
            // Convert image to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                onImageChange(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div
            className={`relative rounded-full ${sizeClasses[size]} overflow-hidden`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className={`bg-blue-500 ${sizeClasses[size]} flex items-center justify-center text-white font-medium`}>
                    {getInitials(name)}
                </div>
            )}
            
            {editable && isHovering && (
                <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer">
                    <span className="text-white text-xs">Change</span>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </label>
            )}
        </div>
    );
};