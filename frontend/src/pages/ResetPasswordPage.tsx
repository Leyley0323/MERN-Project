import PageTitle from '../components/PageTitle.tsx';
import ResetPassword from '../components/ResetPassword.tsx';
import '../AuthPage.css';

const ResetPasswordPage = () =>
{

    return(
      <div className="auth-page">
        <div className="auth-container">
          <PageTitle />
          <ResetPassword />
        </div>
      </div>
    );
};

export default ResetPasswordPage;
