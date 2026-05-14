import React from 'react'
import "../style/home.scss"
import { useNavigate, Link } from 'react-router'
const Navbar = () => {
    const navigate = useNavigate()


// Placeholder logout function
    const handleLogout = () => {
        // // Example: Clear user token, then navigate to login
        // localStorage.removeItem('authToken')
        // navigate('/login')
        <Link to={"/login"} >Login</Link>
    }   


  return (
    <div>
        {/* Top Header */}
            <div className='top-header'>
                <div className='top-header__left'>
                    <h1 className='project-name'>Resumify</h1>
                </div>
                <div className='top-header__right'>
                    {/* <button className='logout-btn' onClick={handleLogout}>Logout</button> */}
                    <p ><Link to={"/login"} id='logout-text'>Logout</Link> </p>
                </div>
            </div>
    </div>
  )
}

export default Navbar