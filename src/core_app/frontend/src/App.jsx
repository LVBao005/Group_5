import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import POS from './pages/POS';
import Inventory from './pages/Inventory';

import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-background">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* STAFF & ADMIN accessible routes */}
                    <Route
                        path="/pos"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                                <POS />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/invoices"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                                <Invoices />
                            </ProtectedRoute>
                        }
                    />

                    {/* ADMIN only routes */}
                    <Route
                        path="/inventory"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <Inventory />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
