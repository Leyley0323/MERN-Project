import PageTitle from '../components/PageTitle.tsx';
import VerifyEmail from '../components/VerifyEmail.tsx';
import '../AuthPage.css';

const VerifyEmailPage = () =>
{

    return(
      <div className="auth-page">
        <div className="auth-container">
          <PageTitle />
          <VerifyEmail />
        </div>
      </div>
    );
};

export default VerifyEmailPage;
