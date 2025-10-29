import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import Login from './components/Login.tsx';
import CardPage from './pages/CardPage';
import LoginPage from './pages/LoginPage';
import SignUp from './components/SignUp.tsx';
import SignUpPage from './pages/SignUpPage';

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
        <Route path="/signup" element={<SignUp />} />
      </Routes>  
    </Router>
  );
}

export default App;
