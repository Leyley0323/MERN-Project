import Header from '../components/Header';
import Footer from '../components/Footer';
import ForgotPassword from '../components/ForgotPassword.tsx';
import '../AuthPage.css';

const ForgotPasswordPage = () =>
{

    return(
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div className="auth-page" style={{ flex: 1 }}>
          <div className="auth-container">
            <ForgotPassword />
          </div>
        </div>
        <Footer />
      </div>
    );
};

export default ForgotPasswordPage;
