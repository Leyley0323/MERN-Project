function LoggedInName()
{

    function doLogout(event:any) : void
    {
	    event.preventDefault();
	    
	    localStorage.removeItem("user_data")
	    window.location.href = '/';
    };    

    let _ud = localStorage.getItem('user_data');
    let ud = _ud ? JSON.parse(_ud) : null;
    let firstName = ud ? ud.firstName : '';
    let lastName = ud ? ud.lastName : '';

    return(
      <div id="loggedInDiv">
        <span id="userName">Logged In As {firstName} {lastName} </span><br />
        <button type="button" id="logoutButton" className="buttons" 
           onClick={doLogout}> Log Out </button>
      </div>
    );
};

export default LoggedInName;
