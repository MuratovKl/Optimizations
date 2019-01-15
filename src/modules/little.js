import Node from './Node';
import Tree from './Tree';

export default function little(matrix) {
  // setting up tree root
  let solveTree = new Tree(new Node(matrix));
  let curNode = solveTree.root;
  
  while(curNode.matrix.length > 3) {
    curNode.reduceRows();
    curNode.reduceCols();
    let chosen = curNode.chooseElement();
    let vertexArr = curNode.vertices.slice();
    vertexArr.push(chosen.row, chosen.col);
  
    // first child
    let newNode = new Node(
      curNode.cutMatrix(chosen), 
      curNode.bound, 
      vertexArr
    );
    newNode.setInfinity();
    newNode.reduceRows();
    newNode.reduceCols();
    curNode.addChildNode(newNode);
  
    // second child
    newNode = new Node(
      curNode.cloneMatrix(),
      curNode.bound + chosen.value,
      curNode.vertices.slice()
    );
    newNode.modifyMatrix(chosen);
    curNode.addChildNode(newNode);
  
    curNode = solveTree.findNextNode();
  }
  let arcs = curNode.vertices.slice();
  
  for(let i = 1; i < curNode.matrix.length; i++) {
    let index = curNode.matrix[i].indexOf(0);
    if(index !== -1) {
      let row = curNode.matrix[i][0];
      let col = curNode.matrix[0][index];
      arcs.push(row, col);
    }
    
  }
  return arcs;
}
