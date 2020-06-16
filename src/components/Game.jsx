import React from 'react';
import {Link} from 'react-router-dom';
import * as io from 'socket.io-client';

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pair: [null,null],
      percent: 50,
      target: 0,
      peek: false,
      gameName: window.location.pathname.replace('/', ''),
      teamTurn: 'blue',
      guess: null,
      turnPoints: 0,
      redPoints: 0,
      bluePoints: 0,
      roomInit: false,
    };

    this.changePercent = this.changePercent.bind(this);
    this.getNextPair = this.getNextPair.bind(this);
    this.guess = this.guess.bind(this);
    this.peek = this.peek.bind(this);
  }

  changePercent(e) {
    var value = e.target.value;
    this.setState({percent: value});
  }

  guess(e) {
    e.preventDefault();
    this.socket.emit('guess', this.state.gameName, this.state.teamTurn, this.state.percent);
  }

  peek(e) {
    if (e) {
      if (!this.state.guess) {
        this.setState(prevState => ({
          peek: !prevState.peek
        }));
        if (e.target.tagName.toLowerCase() === 'p') {
          if (document.getElementById('peek').checked) {
            document.getElementById('peek').checked = false;
          } else {
            document.getElementById('peek').checked = true;
          }
        }
      }
    }
    else if (this.state.peek && !document.getElementById('peek').checked) {
      document.getElementById('peek').checked = true;
      document.getElementById('peek').disabled = true;
    } else if (!this.state.peek) {
      document.getElementById('peek').checked = false;
      document.getElementById('peek').disabled = false;
    }
    return this.state.peek;
  }

  getNextPair(e) {
    e.preventDefault();
    this.setState({peek: false, guess: null, percent: 50, roomInit: false});
    this.socket.emit('nextGame', this.state.gameName);
  }

  componentDidMount() {
    this.setState({isMounted: true, gameName: window.location.pathname.replace('/', '')});

    const hostname = window.location.hostname;
    const port = window.location.port === '3000' ? '5000' : '';
    this.socket = io(`${hostname}:${port}/games`);

    this.socket.emit('join', this.state.gameName);

    this.socket.on('updatedRoomData', (data) => {
      this.setState(
        {
          pair: data.pair, 
          teamTurn: data.teamTurn,
          turnPoints: data.turnPoints,
          bluePoints: data.bluePoints,
          redPoints: data.redPoints,
          peek: data.peek,
          target: data.target,
          guess: data.guess,
          percent: 50,
          roomInit: data.roomInit
        }
      );
      this.peek();
    });

    this.socket.on('reconnect', (data) => {
      this.socket.emit('join', this.state.gameName);
    });
  }

  render() {
    return (
      <div className="App">
        <header>
          <h1><Link to="/">mindmeld</Link></h1>
          <p>Send this link to friends: <Link to={window.location.pathname}>{window.location.href}</Link></p>
        </header>

        <div className="teams">
          <div className="points">
            <span className="blue">{this.state.bluePoints}</span> — <span className="red">{this.state.redPoints}</span>
          </div>
          {this.state.guess && 
            <div className={`turn ${this.state.teamTurn}`}>{this.state.teamTurn} gets {this.state.turnPoints} points</div>
          }
          {!this.state.guess && 
            <div className={`turn ${this.state.teamTurn}`}>{this.state.teamTurn}'s turn</div>
          }
        </div>

        <div>
          <div className="target">
            {this.state.peek &&
              <div>
                <div className="outer" style={{marginLeft: `${this.state.target - 10.5}%`}}></div>
                <div className="middle" style={{marginLeft: `${this.state.target - 5.5}%`}}></div>
                <div className="inner" style={{marginLeft: `${this.state.target - 2.5}%`}}></div>
              </div>
            }
            <input type="range" min="1" max="100" value={this.state.guess? this.state.guess : this.state.percent} onChange={this.changePercent}  className="slider"/>
          </div>
        </div>

        {this.state.pair &&
          <div className="pair">
            <div className="left">&larr; {this.state.pair[0]}</div>
            <div className="right">{this.state.pair[1]} &rarr;</div>
          </div>
        }
        
        <div className="buttons">
          <button className="guess" onClick={this.guess} disabled={false || this.state.guess || this.state.peek || !this.state.roomInit}>
            Guess{this.state.guess && 'ed'} {this.state.guess? this.state.guess : this.state.percent}{this.state.guess && '!'}
          </button>
          <button className="next" onClick={this.getNextPair} disabled={!this.state.roomInit}>Next game</button>
        </div>

        <div className={this.state.guess ? 'peek guessed' : 'peek'}>
          <input id="peek" type="checkbox" className="peek" onChange={this.peek} defaultChecked={this.state.peek} />
          <p className="peek-label" onClick={this.peek}>Peek {this.state.peek && `(Target: ${this.state.target})`}</p>
        </div>

        <p className="chai"><a href="https://buymeacoff.ee/krithix">Buy the developer a chai</a></p>
      </div>
    );
  }
}

export default Game;