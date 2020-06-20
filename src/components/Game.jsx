import React from 'react';
import * as io from 'socket.io-client';
import Layout from './Layout';

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pair: [null,null],
      percent: 0,
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
    this.setState({peek: false, guess: null, percent: 0, roomInit: false});
    this.socket.emit('nextGame', this.state.gameName);
  }

  componentDidMount() {
    this.setState({isMounted: true, gameName: window.location.pathname.replace('/', '')});

    const hostname = window.location.hostname;
    const port = window.location.port === '3000' ? '5000' : '';
    this.socket = io(`${hostname}:${port}/games`);

    this.socket.emit('join', this.state.gameName);

    this.socket.on('updatedRoomData', (data, fromFn) => {
      this.setState(
        {
          pair: data.pair, 
          teamTurn: data.teamTurn,
          turnPoints: data.turnPoints,
          bluePoints: data.bluePoints,
          redPoints: data.redPoints,
          target: data.target,
          guess: data.guess,
          percent: 0,
          roomInit: data.roomInit
        }
      );
      if (fromFn !== 'join-existing') {
        this.setState({peek: data.peek});
      }
      this.peek();
    });

    this.socket.on('reconnect', (data) => {
      this.socket.emit('join', this.state.gameName);
    });
  }

  render() {
    return (
      <Layout appName={this.props.appName} developer={this.props.developer} developerUrl={this.props.developerUrl}>
        <div className="teams">
          <div className="points">
            <span className="blue">{this.state.bluePoints}</span> — <span className="red">{this.state.redPoints}</span>
          </div>
          {!!this.state.guess ? ( 
            <div className={`turn ${this.state.teamTurn}`}>{this.state.teamTurn} gets {this.state.turnPoints} points</div>
          ) : (
            <div className={`turn ${this.state.teamTurn}`}>{this.state.teamTurn}'s turn</div>
          )}
        </div>

        <div>
          {this.state.pair &&
            <div className="pair">
              <div className="left">&larr; {this.state.pair[0]}</div>
              <div className="right">{this.state.pair[1]} &rarr;</div>
            </div>
          }

          <div className="target">
            {this.state.peek &&
              <div>
                <div className="outer" style={{marginLeft: `${50 + this.state.target - 10.75}%`}}></div>
                <div className="middle" style={{marginLeft: `${50 + this.state.target - 5.75}%`}}></div>
                <div className="inner" style={{marginLeft: `${50 + this.state.target - 2.75}%`}}></div>
              </div>
            }
            <input type="range" list="tickmarks" min="-50" step="1" max="50" value={!!this.state.guess? this.state.guess : this.state.percent} onChange={this.changePercent}  className="slider"/>
          </div>

          <div class="sliderticks">
            <p>-50</p>
            <p>-25</p>
            <p>0</p>
            <p>25</p>
            <p>50</p>
          </div>
        </div>
        
        <div className="buttons">
          <button className="guess" onClick={this.guess} disabled={false || !!this.state.guess || this.state.peek || !this.state.roomInit}>
            Guess{!!this.state.guess && 'ed'} {!!this.state.guess? this.state.guess : this.state.percent}{!!this.state.guess && '!'}
          </button>
          <button className="next" onClick={this.getNextPair} disabled={!this.state.roomInit}>Next game</button>
        </div>

        <div className={!!this.state.guess ? 'peek guessed' : 'peek'}>
          <input id="peek" type="checkbox" className="peek" onChange={this.peek} defaultChecked={this.state.peek} />
          <p className="peek-label" onClick={this.peek}>Peek {this.state.peek && `(Target: ${this.state.target})`}</p>
        </div>
      </Layout>
    );
  }
}

export default Game;