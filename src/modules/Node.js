export default class Node {
  constructor(_matrix, _bound = null, _vertices = []) {
    this.bound = _bound;
    this.processed = false;
    this.vertices = _vertices;
    this.matrix = _matrix;
    this.children = [];
  }

  findRowMin(row) {
    return Math.min(...this.matrix[row].slice(1));
  }

  findColMin(col) {
    let minEl = Infinity;
    for(let i = 1; i < this.matrix.length; i++) {
      if(this.matrix[i][col] < minEl) {
        minEl = this.matrix[i][col];
      }
    }
    return minEl
  }

  reduceRows() {
    this.matrix.forEach((row, i) => {
      if(i !== 0) {
        let minEl = this.findRowMin(i);
        if(minEl === 0) {
          return;
        } else {
          this.bound += minEl;
          for(let i = 1; i < row.length; i++) {
            row[i] -= minEl;
          }
        }
      }
    });
  }

  reduceCols() {
    for(let i = 1; i < this.matrix.length; i++) {
      let minEl = this.findColMin(i);
      if(minEl === 0) continue;
      this.bound += minEl;
      for(let j = 1; j < this.matrix.length; j++) {
        this.matrix[j][i] -= minEl;
      }
    }
  }

  chooseElement() {
    let chosenEl = {
      value: -1,
      row: 0,
      col: 0
    };
    for(let i = 1; i < this.matrix.length; i++) {
      for(let j = 1; j < this.matrix.length; j++) {
        if(this.matrix[i][j] !== 0) continue;  // if element is not 0 then skip
        let value = 0;
        let minCol = Infinity;
        let row = this.matrix[i].slice(1);
        row.splice(j-1, 1); // remove current element
        value += Math.min(...row); // min element in row
        for(let k = 1; k < this.matrix.length; k++) {
          if(k === i) continue; // if current element then skip
          if(this.matrix[k][j] < minCol) {
            minCol = this.matrix[k][j];
          }
        }
        value += minCol;
        if(value > chosenEl.value) {
          chosenEl.value = value;
          chosenEl.row = this.matrix[i][0];
          chosenEl.col = this.matrix[0][j]; 
        }
      }
    }
    return Object.assign({}, chosenEl);
  }

  cloneMatrix() { // deep clone of matrix
    let newMatrix = [];
    for(let i = 0; i < this.matrix.length; i++) {
      newMatrix.push(this.matrix[i].slice());
    }
    return newMatrix;
  }

  cutMatrix(element) { // remove row and column with chosen element
    let newMatrix = this.cloneMatrix();
    let col = this.matrix[0].indexOf(element.col);
    let row;
    for(let i = 0; i < this.matrix.length; i++) {
      if(this.matrix[i][0] === element.row) {
        row = i;
        break;
      }
    }
    newMatrix.splice(row, 1);
    for(let i = 0; i < newMatrix.length; i++) {
      newMatrix[i].splice(col, 1);
    }
    return newMatrix;
  }

  modifyMatrix(element) { //set Infinity to chosen element and remove min el from column and row
    let col = this.matrix[0].indexOf(element.col);
    let row;
    for(let i = 0; i < this.matrix.length; i++) {
      if(this.matrix[i][0] === element.row) {
        row = i;
        break;
      }
    }
    this.matrix[row][col] = Infinity;
    let minRow = this.findRowMin(row);
    let minCol = this.findColMin(col);
    for(let i = 1; i < this.matrix.length; i++) {
      for(let j = 1; j < this.matrix.length; j++) {
        if(row === i) {
          this.matrix[i][j] -= minRow;
        } else if(col === j) {
          this.matrix[i][j] -= minCol;
        }
      }
    }
  }
  
  setInfinity() {
    for(let i = 1; i < this.matrix.length; i++) {
      for(let j = 1; j < this.matrix.length; j++) {
        if(this.matrix[i].find((el) => el === Infinity)) continue;
        let colInf = false;
        for(let k = 1; k < this.matrix.length; k++) {
          if(this.matrix[k][j] == Infinity) {
            colInf = true;
            break;
          }
        }
        if(!colInf) {
          this.matrix[i][j] = Infinity;
        }
      }
    }
  }

  addChildNode(node) {
    this.children.push(node);
    this.processed = true;
  }
}