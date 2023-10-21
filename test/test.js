import PromiseSequence from "../src/index.js";

// Función de ejemplo que simula una tarea costosa
function processBlock(block) {

    console.log('Block: ', block);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(block * 2);
    }, 1000);
  });
}

// Lista de datos que queremos procesar
const data = Array.from({ length: 20 }, (_, i) => i + 1); // Genera una matriz de números del 1 al 20

console.log(data);

// Número de bloques en los que deseamos dividir los datos
const numberOfBlocks = 5;

/*
PromiseSequence.ByBlocks(processBlock, data, numberOfBlocks)
  .then(results => {
    console.log('Resultados finales:', results.flat());
  })
  .catch(error => {
    console.error('Ocurrió un error:', error);
  });
*/

  PromiseSequence.ByItems(processBlock, data, numberOfBlocks)
  .then(results => {
    console.log('Resultados finales:', results.flat());
  })
  .catch(error => {
    console.error('Ocurrió un error:', error);
  });