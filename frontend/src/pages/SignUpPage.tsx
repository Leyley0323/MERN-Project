import Header from '../components/Header';
import Footer from '../components/Footer';
import SignUp from '../components/SignUp.tsx';
import '../AuthPage.css';

const SignupPage = () =>
{

    return(
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div className="auth-page" style={{ flex: 1 }}>
          <div className="auth-container">
            <SignUp />
          </div>
        </div>
        <Footer />
      </div>
    );
};

export default SignupPage;