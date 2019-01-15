<template>
  <div id="app">
    <div id="colors-picker">
      <h1>Выбор цветов</h1>
      <button 
        :disabled="colorsNumber < 2" 
        @click="clearColorsList"
        class="btn"
      >
        Отчистить
      </button>
      <button class="btn" id="add-btn">Добавить</button>
      <div id="palette">
        <p v-show="colorsNumber < 2">Ни одного цвета пока не выбрано</p>
        <div 
          :key="index"
          v-for="(item, index) in colorsToDisplay"
          :style="{backgroundColor: `rgba(${item.r}, ${item.g}, ${item.b}, ${item.a})`}"
          @click="colorRemove"
          :data-index="index"
          class="color-block">
        </div>
      </div>
      <button 
        :disabled="colorsNumber < 3" 
        @click="startCalc"
        class="btn"
      >
        Выпонить расчет
      </button>
    </div>
    <div id="colors-displayer">
      <h1 class="block-title">Результат</h1>
      <div id="steps">
        <div
          v-for="(item, index) in iterations" 
          :key="index"
          class="step"
        >
          <p class="step__title">{{ index + 1 }}</p>
          <div
            v-for="(el, index) in item"
            :key="index"
            :style="{backgroundColor: `rgba(${colorsArr[el-1].r}, ${colorsArr[el-1].g}, ${colorsArr[el-1].b}, ${colorsArr[el-1].a})`}"
            class="step__color"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Picker from 'vanilla-picker';
import Node from './modules/Node.js';
import Tree from './modules/Tree.js';

export default {
  name: 'app',
  components: {
    // ColorBlock
  },
  data() {
    return {
      colorsArr: [{r: 0, g: 0, b: 0, a: 0}],
      iterations:[],
      matrix: [],
      addColor: document.getElementById('add-btn'),
      colorPicker: null
    }
  },
  computed: {
    colorsNumber() {
      return this.colorsArr.length;
    },
    colorsToDisplay() {
      return this.colorsArr.slice(1);
    }
  },
  methods: {
    colorPicked(color) {
      let newColor = {
        r: color._rgba[0],
        g: color._rgba[1],
        b: color._rgba[2],
        a: color._rgba[3]
      };
      if(this.colorsArr.findIndex((el) => el.r === newColor.r 
        && el.g === newColor.g 
        && el.b === newColor.b 
        && el.a === newColor.a) !== -1) {
        alert('Такой цвет уже выбран!');
        return;
      } else {
        this.colorsArr.push(newColor);
      }
    },
    clearColorsList() {
      this.colorsArr = [{r: 0, g: 0, b: 0, a: 0}];
      this.iterations = [];
    },
    colorRemove(event) {
      this.colorsArr.splice(+event.target.dataset.index + 1, 1);
      this.iterations = [];
    },
    calcColorDifference(color1, color2) {
      return Math.abs(color1.r - color2.r) + 
        Math.abs(color1.g - color2.g) + 
        Math.abs(color1.b - color2.b) + 
        Math.abs(color1.a - color2.a);
    },
    buildMatrix() {
      for(let i = 0; i <= this.colorsNumber; i++) {
        this.matrix.push([]);
        this.matrix[0].push(i);
        this.matrix[i][0] = i;
      }
      for(let i = 1; i <= this.colorsNumber; i++) {
        for(let j = i; j <= this.colorsNumber; j++) {
          if(i === j) {
            this.matrix[i][j] = Infinity;
          } else {
            this.matrix[i][j] = this.calcColorDifference(this.colorsArr[i-1], this.colorsArr[j-1]);
            this.matrix[j][i] = this.matrix[i][j];
          }
        }
      }
    },
    buildPathV2(arcs) {
      let minEl = Math.min(...arcs.filter((el, i) => i % 2 === 0));
      let path = arcs.splice(arcs.findIndex((el, i) => el === minEl && i % 2 === 0), 2);
      let lastEl = path[1];
      while(arcs.length) {
        let index = arcs.findIndex((el, i) => el === lastEl && i % 2 === 0);
        if(index !== -1) {
          path.push(arcs.splice(index, 2)[1]);
        } else {
          minEl = Math.min(...arcs.filter((el, i) => i % 2 === 0));
          path.push(...arcs.splice(arcs.findIndex((el, i) => el === minEl && i % 2 === 0), 2));
        }
        lastEl = path[path.length - 1];
      }
      this.iterations.push(path.slice());
    },
    little(matrix) {
      // setting up tree
      let solveTree = new Tree(new Node(matrix));
      let curNode = solveTree.root;
      
      while(curNode.matrix.length > 3) {
        curNode.reduceRows();
        curNode.reduceCols();
        let chosen = curNode.chooseElement();
        let vertexArr = curNode.vertices.slice();
        vertexArr.push(chosen.row, chosen.col);
        this.buildPathV2(vertexArr.slice());

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
      for(let i = 1; i < curNode.matrix.length; i++) {
        let index = curNode.matrix[i].indexOf(0);
        if(index !== -1) {
          let row = curNode.matrix[i][0];
          let col = curNode.matrix[0][index];
          curNode.vertices.push(row, col);
        }
        
      }
      this.buildPathV2(curNode.vertices);
      // console.log(solveTree.root);
    },
    startCalc() {
      this.matrix = [];
      this.iterations = [];
      this.buildMatrix();
      this.little(this.matrix);
    },
    sleep(miliseconds) {
      let currentTime = new Date().getTime();
      while (currentTime + miliseconds >= new Date().getTime());
    }
  },
  mounted() {
    this.colorPicker = new Picker({
      parent: document.getElementById('add-btn'),
      popup: 'right',
      editor: false
    })
    this.colorPicker.onDone = this.colorPicked;
  }
}
</script>

<style lang="scss">
$btnColor: #00b0eb;

  html, body {
    margin: 0;
    padding: 0;
    font-family: Helvetica, sans-serif;
    color: #282828;
  }
  #app {
    display: grid;
    height: 100vh;
    grid-template-columns: 40vw 58vw;
    grid-column-gap: 2vw;
  }
  #colors-picker {
    grid-column: 1 / 2;
    text-align: center;
    background-color: #f6f6f6;
    padding: 10px;
    box-shadow: 5px 0px 8px #d8d8d8;
  }
  #colors-displayer {
    grid-column: 2 / 3;
    text-align: center;
    overflow-y: scroll;
  }

  #palette {
    margin-top: 5vh;
    margin-bottom: 10px;
    padding-top: 10px;
    height: 65vh;
    overflow-y: scroll;
    p {
      font-size: 20px;
    }
  }

  .btn {
    color: #282828;
    border: none;
    outline: none;
    cursor: pointer;
    border-radius: 5px;
    font-size: 20px;
    padding: 5px 10px;
    transition: all 200ms ease;
    background-color: $btnColor;
    &:hover {
      background-color: darken($btnColor, 10);
    }
    &:disabled {
      background-color: lighten($btnColor, 40);
      color: grey;
    }
  }
  #add-btn {
    margin-left: 30px;
  }

  .color-block {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 5px;
    border: 1px solid black;
    margin: 0 20px 20px 0;
    transition: all 200ms ease;
    cursor: pointer;
    &:hover {
      transform: scale(1.1);
      filter: grayscale(100%);
    }
  }
  #steps {
    padding-right: 2vw;
  }
  .step {
    text-align: left;
    &__title {
      padding: 10px 20px;
      font-size: 25px;
      background-color: #ebfaff;
    }
    &__color {
      display: inline-block;
      margin-right: 10px;
      width: 60px;
      height: 60px;
      border: 1px solid black;
      border-radius: 5px;
    }
  }
</style>
