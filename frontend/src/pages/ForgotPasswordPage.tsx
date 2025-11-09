import PageTitle from '../components/PageTitle.tsx';
import ForgotPassword from '../components/ForgotPassword.tsx';
import '../AuthPage.css';

const ForgotPasswordPage = () =>
{

    return(
      <div className="auth-page">
        <div className="auth-container">
          <PageTitle />
          <ForgotPassword />
        </div>
      </div>
    );
};

export default ForgotPasswordPage;
