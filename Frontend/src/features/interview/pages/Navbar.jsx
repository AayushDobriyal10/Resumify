import React from 'react'
import "../style/home.scss"
import { useNavigate, Link } from 'react-router'
const Navbar = () => {
    const navigate = useNavigate()

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