import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Game from './components/Game';
import Index from './components/Index';
import './App.scss';

import socketIOClient from "socket.io-client";
const socket = socketIOClient('http://localhost:5000');

class App extends React.Component {
  render() {    
    return (
      <Router>
        <Switch>
          <Route path="/:game">
            <Game socket={socket} />
          </Route>
          <Route exact path="/">
            <Index />
          </Route>
        </Switch>
      </Router>
    )
  }
}

export default App;
