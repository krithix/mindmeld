import React from 'react';
import {Link} from 'react-router-dom';

const Layout = (props) => {
  return (
    <div className={props.indexPage? 'App Index' : 'App'}>
      <header>
        <h1><Link to="/">{props.appName}</Link></h1>
        {!props.indexPage && 
          <p>Send this link to friends: <Link to={window.location.pathname}>{window.location.href}</Link></p>
        }
      </header>

      {props.children}

      <p className="chai"><a href={props.developerUrl}>Buy the developer a chai</a></p>
    </div>
  )
}
export default Layout;