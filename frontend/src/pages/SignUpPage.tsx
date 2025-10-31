import React from 'react';
import logo from "../assets/logo.png";
import SignUp from '../components/SignUp.tsx';

function SignUpPage() {
        return (
        <div>
        {/* SVG image */}
        <img src={logo} alt="Cheap Cart Logo" width="100" height="100" />
        <SignUp />
        </div>
    );
}

export default SignUpPage;
