import PromiseSequence from "../src/index.js";

// Función de ejemplo que simula una tarea costosa
function processBlock(block) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Block: ", block, new Date());
      resolve({ data: block * 2 });
    }, 1500 + (Math.floor(Math.random() * 1000) + 1));
  });
}

// Lista de datos que queremos procesar
const data = Array.from({ length: 20 }, (_, i) => i + 1); // Genera una matriz de números del 1 al 20

console.log(data);

// Número de bloques en los que deseamos dividir los datos
const numberOfBlocks = 1;

const queue = new PromiseSequence();

setInterval(() => {
  queue.numThreads = queue.numThreads + 1;
}, 1000);

setInterval(() => {
  console.log("------ Agrega data ------");
  Array.from({ length: 20 }, (_, i) => i + 1).forEach((item) => {
    queue.push(item);
  });
}, 5000);

queue.thread(processBlock, numberOfBlocks, data);

queue.onFinish = (data) => {
  console.log(">>>>>>> ", data);
};
