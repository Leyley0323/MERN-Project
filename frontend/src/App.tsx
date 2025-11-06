import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import Login from './components/Login.tsx';
import CardPage from './pages/CardPage';
import LoginPage from './pages/LoginPage';
import SignUp from './components/SignUp.tsx';
import SignUpPage from './pages/SignUpPage';
import ShoppingList from './pages/ShoppingList';
import CheckoutPage from './pages/Checkout.tsx';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />   {/* default homepage */}
        <Route path="/Login.tsx" element={<Login />} />
        <Route path="/cards" element={<CardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/SignUp.tsx" element={<SignUp />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/shoppinglist" element={<ShoppingList />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>  
    </Router>
  );
}

export default App;
