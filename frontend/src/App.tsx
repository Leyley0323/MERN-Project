import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ListsPage from './pages/ListsPage';
import CreateListPage from './pages/CreateListPage';
import JoinListPage from './pages/JoinListPage';
import ListDetailPage from './pages/ListDetailPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/lists" element={<ListsPage />} />
        <Route path="/lists/create" element={<CreateListPage />} />
        <Route path="/lists/join" element={<JoinListPage />} />
        <Route path="/lists/:listId" element={<ListDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>  
    </Router>
  );
}

export default App;
