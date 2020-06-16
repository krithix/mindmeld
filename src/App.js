import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import Game from './components/Game';
import Index from './components/Index';
import './App.scss';

const appName = "Mindmeld";
const appDescription = "A web implementation of the popular party game Wavelength to play online with family and friends.";
const url = window.location.origin;
const developer = 'krithix';
const developerUrl = 'https://buymeacoff.ee/krithix';

class App extends React.Component {
  render() {    
    return (
      <div>
        <Router>
          <Switch>
            <Route path="/:game">
              <Game appName={appName} developer={developer} developerUrl={developerUrl} />
            </Route>
            <Route exact path="/">
              <Index appName={appName} developer={developer} developerUrl={developerUrl} />
            </Route>
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App;