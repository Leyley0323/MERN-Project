import PageTitle from '../components/PageTitle.tsx';
import Login from '../components/Login.tsx';
import '../AuthPage.css';

const LoginPage = () =>
{

    return(
      <div className="auth-page">
        <div className="auth-container">
          <PageTitle />
          <Login />
        </div>
      </div>
    );
};

export default LoginPage;
