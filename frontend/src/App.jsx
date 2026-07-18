import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import SecurityCheck from "./pages/SecurityCheck";
import TwoFactorVerify from "./pages/TwoFactorVerify";
import TwoFactorSetup from "./pages/TwoFactorSetup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import SuspiciousLogins from "./pages/SuspiciousLogins";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/security-check" element={<SecurityCheck />} />
        <Route path="/two-factor" element={<TwoFactorVerify />} />
        <Route path="/two-factor-setup" element={<TwoFactorSetup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/suspicious-logins" element={<SuspiciousLogins />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
