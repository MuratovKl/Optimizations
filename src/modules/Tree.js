export default class Tree {
  constructor(_root) {
    this.root = _root;
  }
  findNextNode() {
    let curBound = Infinity;
    let curNode, nextNode;
    let queue = [this.root];
    while(queue.length !== 0) {
      curNode = queue.shift();
      if(!curNode.processed && curNode.bound <= curBound) {
        curBound = curNode.bound;
        nextNode = curNode;
      }
      if(curNode.children.length) {
        queue.push(curNode.children[0]);
        queue.push(curNode.children[1]);
      }
    }
    return nextNode;
  }
}