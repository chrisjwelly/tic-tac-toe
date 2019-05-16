import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
   return (
      <button className="square" onClick={props.onClick}>
         {props.value}
      </button>
   );
}
  
class Board extends React.Component {
    renderSquare(i) {
       // Note: <Square /> is syntactic sugar for instantiating
       return (
         <Square 
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)}
         />
       );
    }
 
    renderSquaresLoop() {
      let squares = [];
      // Outer loop for the 3 board-rows
      for (let i = 0; i < 3; i++) {
        let columns = [];
        const start = i * 3;
        // Inner loop to create the 3 columns
        for (let j = start; j < start + 3; j++) {
          const currSquare = this.renderSquare(j);
          // The one with {} fails, but why? 
          // columns.push({currSquare});
          columns.push(currSquare);
        }
        squares.push(<div className="board-row">
                       {columns}
                     </div>);
      }
      return squares;
    }

    render() {
      return (
        <div>
          {this.renderSquaresLoop()}
        </div>
      );
    }

    /*
    render() {
      return (
        <div>
          <div className="board-row">
            {this.renderSquare(0)}
            {this.renderSquare(1)}
            {this.renderSquare(2)}
          </div>
          <div className="board-row">
            {this.renderSquare(3)}
            {this.renderSquare(4)}
            {this.renderSquare(5)}
          </div>
          <div className="board-row">
            {this.renderSquare(6)}
            {this.renderSquare(7)}
            {this.renderSquare(8)}
          </div>
        </div>
      );
    }
    */
}
  
class Game extends React.Component {
    handleClick(i) {
       const history = this.state.history.slice(0,
         this.state.stepNumber + 1);
       const current = history[history.length - 1];
       const squares = current.squares.slice();
       if (calculateWinner(squares) || squares[i]) {
          return;
       }
       const col = (i % 3) + 1;
       const row = Math.floor(i / 3) + 1;
       const moveOf = this.state.xIsNext ? 'X' : 'O';
       squares[i] = moveOf;
       this.setState({
          history: history.concat([{
             squares: squares,
             col: col,
             row: row,
             moveOf: moveOf,
          }]),
          stepNumber: history.length,
          xIsNext: !this.state.xIsNext,
       });
    }

    jumpTo(step) {
       this.setState({
          stepNumber: step,
          xIsNext: (step % 2) === 0,
       });
    }

    constructor(props) {
       super(props);
       this.state = {
          history: [{
             squares: Array(9).fill(null),
             // col and row represent the position added
             col: null,
             row: null,
             // moveOf represents which player made the move
             moveOf: null,
          }],
          stepNumber: 0,
          xIsNext: true,
       };
    }

    render() {
      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const winner = calculateWinner(current.squares);
      /* 
      The parameter move is an optional parameter. 
      Here it represents the index of the element in the array
      */
      const moves = history.map((step, move) => {
         const desc = move ?
            `Go to move #${move}: (${step.col}, ${step.row}) done by ${step.moveOf}` :
            "Go to game start";
         return (
            <li key={move}>
               <button
                  onClick={() => this.jumpTo(move)}
                  >
                  {desc}
               </button>
            </li>
         );
      });

      let status;
      if (winner) {
         status = 'Winner: ' + winner;
      } else {
         status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }
  
      return (
        <div className="game">
          <div className="game-board">
            <Board 
             squares={current.squares}
             onClick={(i) => this.handleClick(i)}
            />

          </div>
          <div className="game-info">
            <div>{status}</div>
            <ol>{moves}</ol>
          </div>
        </div>
      );
    }
}
  

function calculateWinner(squares) {
   const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
   ];
   for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
         return squares[a];
      }
   }
   return null;
}
// ========================================
  
ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
  
