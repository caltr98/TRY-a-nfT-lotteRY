import React from 'react'

const Header = ({ title, onAdd, showAdd }) => {

  return (
    <header className='header'>
      <h1>TRY LOTTERY</h1>
    </header>
  )
}

Header.defaultProps = {
  title: 'Task Tracker',
}



// CSS in JS
// const headingStyle = {
//   color: 'red',
//   backgroundColor: 'black',
// }

export default Header
