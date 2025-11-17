import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from '../components/Login.tsx';
import '../AuthPage.css';

const LoginPage = () =>
{

    return(
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div className="auth-page" style={{ flex: 1 }}>
          <div className="auth-container">
            <Login />
          </div>
        </div>
        <Footer />
      </div>
    );
};

export default LoginPage;
