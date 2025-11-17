import Header from '../components/Header';
import Footer from '../components/Footer';
import VerifyEmail from '../components/VerifyEmail.tsx';
import '../AuthPage.css';

const VerifyEmailPage = () =>
{

    return(
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div className="auth-page" style={{ flex: 1 }}>
          <div className="auth-container">
            <VerifyEmail />
          </div>
        </div>
        <Footer />
      </div>
    );
};

export default VerifyEmailPage;
