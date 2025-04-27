export function PasswordStrength({ password }) {
    const calculateStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const getColor = (strength) => {
        switch (strength) {
            case 0:
            case 1:
                return 'bg-red-500';
            case 2:
            case 3:
                return 'bg-yellow-500';
            case 4:
            case 5:
                return 'bg-green-500';
            default:
                return 'bg-gray-200';
        }
    };

    const strength = calculateStrength(password);
    const color = getColor(strength);

    return (
        <div className="mt-1">
            <div className="flex h-2 w-full gap-1">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className={`h-full w-1/5 rounded-full ${
                            i < strength ? color : 'bg-gray-200'
                        }`}
                    />
                ))}
            </div>
            <p className="text-xs mt-1 text-gray-500">
                {strength < 3 && "Password should be at least 8 characters with uppercase, lowercase, numbers, and special characters"}
            </p>
        </div>
    );
}