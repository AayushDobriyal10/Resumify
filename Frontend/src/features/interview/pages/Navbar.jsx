import React from 'react'
import "../style/home.scss"
const Navbar = () => {


// Placeholder logout function
    const handleLogout = () => {
        // Example: Clear user token, then navigate to login
        localStorage.removeItem('authToken')
        navigate('/login')
    }   

  return (
    <div>
        {/* Top Header */}
            <div className='top-header'>
                <div className='top-header__left'>
                    <h1 className='project-name'>Resumify</h1>
                </div>
                <div className='top-header__right'>
                    <button className='logout-btn' onClick={handleLogout}>Logout</button>
                </div>
            </div>
    </div>
  )
}

export default Navbar