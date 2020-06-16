import React from 'react';
import {Link} from 'react-router-dom';
import randomWords from 'random-words';
import Layout from './Layout';

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gameIdentifier: randomWords({exactly: 1, wordsPerString: 2, separator: '-'})
    }
    this.updateGameName = this.updateGameName.bind(this);

  }

  updateGameName(e) {
    e.preventDefault();
    this.setState({gameIdentifier: e.target.value});
  }

  render() {
    return (
      <Layout appName={this.props.appName} developer={this.props.developer} developerUrl={this.props.developerUrl} indexPage>
        <div className="game-generator">
          <p className="intro">A web implementation of the popular party game <a href="https://wavelength.zone">Wavelength</a> to play online with family and friends over Zoom.</p>

          <p>Enter a game identifier and click go to create a new game or join an existing one:</p>

          <input name="game-name" value={this.state.gameIdentifier} onChange={this.updateGameName} />
          <Link className="go" to={`/${this.state.gameIdentifier}`}>Go</Link>
        </div>
        </Layout>
    );
  }
}

export default Index;