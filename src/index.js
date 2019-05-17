import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
   const thisClassName = props.isWinnerSq ? "square winner" : "square";
   return (
      <button className={thisClassName} onClick={props.onClick}>
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
            isWinnerSq= {this.checkWinnerSq(i, this.props.winnerLines)}
            onClick={() => this.props.onClick(i)}
         />
       );
    }

    checkWinnerSq(i, winnerLines) {
      if (winnerLines[0] !== null) {
        // if there is a value
        // j < 3 because winnerLines has 3 values
        let result = false;
        for (let j = 0; j < 3; j++) {
          if (i === winnerLines[j]) {
            // Current index matches one of the winnerLines!
            result = true;
            break;
          }
        }
        return result;
      } else {
        // because still an array of nulls
        return false;
      }
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
          /* Ans: {} are used in jsx element to tell the parser that you want
          to interpret a section in JS. Using {} outside of jsx will be
          interpreted as an object
          */
          // columns.push({currSquare});
          columns.push(currSquare);
        }
        squares.push(<div className="board-row">
                       {columns}
                     </div>);
      }
      return squares;
    }

    /* using a helper function because apparently render() function
    hates loops */
    render() {
      return (
        <div>
          {this.renderSquaresLoop()}
        </div>
      );
    }
}
  
class Game extends React.Component {
    handleClick(i) {
       // maybe consider using constants
       let history = this.state.history.slice(0,
         this.state.stepNumber + 1);
       const current = history[history.length - 1];
       const squares = current.squares.slice();
       // this is to check if there is already a winner or filled the square
       // [0] because function returns array of 3 values (null or 'X' or 'O'
       if (calculateWinnerLines(squares)[0] || squares[i]) {
          return;
       }
       // ensures that the past moves are no longer selected
       history.forEach(obj => obj.currentSelection= false);
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
             // the recent move that you did is selected
             currentSelection: true,
          }]),
          stepNumber: history.length,
          xIsNext: !this.state.xIsNext,
       });
    }

    jumpTo(step) {
       // the brute force method:
       /*
       const history = this.state.history.map((obj, idx) => {
         return {
         squares: obj.squares,
         col: obj.col,
         row: obj.row,
         moveOf: obj.moveOf,
         currentSelection: idx === step,
         };
       });
       */
       // a cleaner method for larger objects
       const history = this.state.history.map((obj, idx) => {
         // the next line creates a deep copy of the previous object
         const newObj = JSON.parse(JSON.stringify(obj));
         newObj.currentSelection = (idx === step);
         return newObj;
       });
       this.setState({
          history: history,
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
             // when game starts, it is emboldened
             currentSelection: true,
          }],
          stepNumber: 0,
          xIsNext: true,
          isAscending: true,
       };
    }

    toggle() {
      this.setState({
        isAscending: !this.state.isAscending,
      });
    }

    render() {
      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const squares = current.squares;
      const winnerLines = calculateWinnerLines(squares);
      // can be 0, 1, or 2; it doesn't matter
      const winner = squares[winnerLines[0]];
      const isAscending = this.state.isAscending;
      /* 
      The parameter move is an optional parameter. 
      Here it represents the index of the element in the array
      */
      const moves = history.map((step, move) => {
         const desc = move ?
            `Go to move #${move}: (${step.col}, ${step.row}) done by ${step.moveOf}` :
            "Go to game start";
         const toReturn = (
            <li key={move}>
               <button
                  onClick={() => this.jumpTo(move)}
                  >
                  {/*Note that the later desc should be without {}*/}
                  {step.currentSelection ? <b>{desc}</b> : desc}
               </button>
            </li>
         );
         return toReturn;
      });
      // Make a new array of moves, but reversed. slice() is important
      const movesReversed = moves.slice().reverse();

      let status;
      const isFullyFilled = history.length === 10; // max 10 moves
      if (winner) {
         status = 'Winner: ' + winner;
      } else if (isFullyFilled) {
         status = "It's a Draw!";
      } else {
         status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }
  
      const toggler = <button
                        onClick = {() => this.toggle()}
                        >
                        {isAscending
                         ? "Toggle to descending order"
                         : "Toggle to ascending order"
                        }
                      </button>;
      return (
        <div className="game">
          <div className="game-board">
            <Board 
             squares={current.squares}
             winnerLines={winnerLines}
             onClick={(i) => this.handleClick(i)}
            />

          </div>
          <div className="game-info">
            <div>{status}</div>
            <div>{toggler}</div>
            {isAscending
             ? <ol>{moves}</ol>
             : <ol reversed>{movesReversed}</ol>
            }
          </div>
        </div>
      );
    }
}
  

function calculateWinnerLines(squares) {
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
         return [a, b, c];
      }
   }
   return [null, null, null];
}
// ========================================
  
ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
  
