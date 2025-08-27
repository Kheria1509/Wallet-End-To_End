import { BrowserRouter, Route, Routes, Navigate, useEffect } from "react-router-dom";
import { Signup } from "./pages/Signup";
import { Signin } from "./pages/Signin";
import { Dashboard } from "./pages/Dashboard";
import { SendMoney } from "./pages/SendMoney";
import { Profile } from "./pages/Profile";
import { ForgotPassword } from "./pages/ForgotPassword";
import { RecurringTransfers } from "./pages/RecurringTransfers";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "./context/NotificationContext";
import "./utils/auth"; // Import auth interceptors

// Component to handle URL cleanup
function URLHandler() {
  useEffect(() => {
    // If we're on index.html, redirect to root
    if (window.location.pathname === '/index.html') {
      window.location.replace('/');
    }
  }, []);
  return null;
}

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <URLHandler />
        <Routes>
          <Route path="/" element={<Navigate to="/signin" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/send"
            element={
              <ProtectedRoute>
                <SendMoney />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recurring"
            element={
              <ProtectedRoute>
                <RecurringTransfers />
              </ProtectedRoute>
            }
          />
          {/* Catch-all route for unknown paths */}
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          success: {
            style: {
              background: '#10B981',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: 'white',
            },
          },
        }}
      />
    </NotificationProvider>
  );
}

export default App;
