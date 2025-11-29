import { useEffect, useState } from 'react';

export interface Admin {
    id: string;
    name: string;
    role: string;
}

/**
 * Hook to manage admin user data
 * Returns dummy admin data and saves it to localStorage
 */
export const useAdmin = () => {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if admin data exists in localStorage
        const storedAdmin = localStorage.getItem('adminUser');

        if (storedAdmin) {
            // Use existing admin data
            setAdmin(JSON.parse(storedAdmin));
        } else {
            // Create dummy admin data
            const dummyAdmin: Admin = {
                id: 'admin-1',
                name: 'Admin User',
                role: 'admin',
            };

            // Save to localStorage
            localStorage.setItem('adminUser', JSON.stringify(dummyAdmin));
            setAdmin(dummyAdmin);
        }

        setIsLoading(false);
    }, []);

    const updateAdmin = (updatedAdmin: Partial<Admin>) => {
        if (admin) {
            const newAdmin = { ...admin, ...updatedAdmin };
            setAdmin(newAdmin);
            localStorage.setItem('adminUser', JSON.stringify(newAdmin));
        }
    };

    const clearAdmin = () => {
        setAdmin(null);
        localStorage.removeItem('adminUser');
    };

    return {
        admin,
        isLoading,
        updateAdmin,
        clearAdmin,
    };
};
