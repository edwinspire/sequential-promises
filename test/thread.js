import PromiseSequence from "../src/index.js";

// Función de ejemplo que simula una tarea costosa
function processBlock(block) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Block: ", block);
      resolve({ data: block * 2 });
    }, 2500 + (Math.floor(Math.random() * 1000) + 1));
  });
}

// Lista de datos que queremos procesar
const data = Array.from({ length: 20 }, (_, i) => i + 1); // Genera una matriz de números del 1 al 20

console.log(data);

// Número de bloques en los que deseamos dividir los datos
const numberOfBlocks = 10;

let interval = setInterval(() => {
  console.log("Esta corriendo...");
}, 1000);

const queue = new PromiseSequence();

/*
setInterval(() => {
  queue.push(99);
}, 1000);
*/

queue.thread(processBlock, 5, data);

queue.onFinish = (results) => {
  console.log("on Finish", results);
  clearInterval(interval);
};

data.forEach((param) => {
  queue.push(param);
  console.log("Push item", queue.queue.length);
});
