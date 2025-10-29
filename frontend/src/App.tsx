import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import Login from './components/Login.tsx';
import CardPage from './pages/CardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />   {/* default homepage */}
        <Route path="/Login.tsx" element={<Login />} />
        <Route path="/cards" element={<CardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>  
    </Router>
  );
}

export default App;
