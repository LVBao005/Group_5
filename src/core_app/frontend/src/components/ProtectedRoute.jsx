import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute component - Handles authentication and role-based authorization
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {string[]} props.allowedRoles - List of roles permitted to access this route
 * @returns {React.ReactNode}
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // 1. Not logged in -> Redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Role not allowed -> Redirect to /pos (as per requirements)
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/pos" replace />;
    }

    // 3. Authorized -> Render children
    return children;
};

export default ProtectedRoute;
