import Header from '../components/Header';
import Footer from '../components/Footer';
import ResetPassword from '../components/ResetPassword.tsx';
import '../AuthPage.css';

const ResetPasswordPage = () =>
{

    return(
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div className="auth-page" style={{ flex: 1 }}>
          <div className="auth-container">
            <ResetPassword />
          </div>
        </div>
        <Footer />
      </div>
    );
};

export default ResetPasswordPage;
