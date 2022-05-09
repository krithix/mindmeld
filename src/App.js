import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import Game from './components/Game';
import Index from './components/Index';
import './App.scss';

const appName = "Mindmeld";
const developer = 'krithix';
const developerUrl = 'https://buymeacoff.ee/krithix';

class App extends React.Component {
  render() {    
    return (
      <div>
        <Router>
          <Routes>
            <Route path="/:game" element={<Game appName={appName} developer={developer} developerUrl={developerUrl} />} />

            <Route exact path="/" element={<Index appName={appName} developer={developer} developerUrl={developerUrl} />} />
          </Routes>
        </Router>
      </div>
    )
  }
}

export default App;