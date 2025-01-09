import PromiseSequence from "../src/index.js";
// Lista de datos que queremos procesar
const data = Array.from({ length: 20 }, (_, i) => i + 1); // Genera una matriz de números del 1 al 20

console.log(data);

// Número de bloques en los que deseamos dividir los datos
const numberOfBlocks = 10;

let result = PromiseSequence.ArrayChunk(data, 2)
console.log(result);
