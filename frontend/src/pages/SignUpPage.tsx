import PageTitle from '../components/PageTitle.tsx';
import SignUp from '../components/SignUp.tsx';
import '../AuthPage.css';

const SignupPage = () =>
{

    return(
      <div className="auth-page">
        <div className="auth-container">
          <PageTitle />
          <SignUp />
        </div>
      </div>
    );
};

export default SignupPage;