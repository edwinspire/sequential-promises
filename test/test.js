import PromiseSequence from "../src/index.js";

// Función de ejemplo que simula una tarea costosa
function processBlock(block) {


  return new Promise((resolve) => {

    setTimeout(() => {

      console.log('Block: ', block);
      resolve({ data: block * 2 });
    }, 2500
    + (Math.floor(Math.random() * 1000) + 1)
    );
  });
}


// Lista de datos que queremos procesar
const data = Array.from({ length: 20 }, (_, i) => i + 1); // Genera una matriz de números del 1 al 20

console.log(data);


// Número de bloques en los que deseamos dividir los datos
const numberOfBlocks = 10;


PromiseSequence.ByBlocks(processBlock, data, numberOfBlocks)
  .then(results => {
    console.log('Resultados finales:', results);
  })
  .catch(error => {
    console.error('Ocurrió un error:', error);
  });


/*
  PromiseSequence.ByItems(processBlock, data, numberOfBlocks)
  .then(results => {
    console.log('Resultados finales:', results);
  })
  .catch(error => {
    console.error('Ocurrió un error:', error);
  });
*/


/*
const queue = new PromiseSequence();

queue.thread(processBlock, 5, data).then((r) => {
  console.log(r);
});
*/

/*
queue.onFinish = (results) => {
  console.log(results);
};
*/

/*
data.forEach((param) => {
  queue.push(param);
});
*/

/*
setInterval(() => {

  console.log('Esta corriendo...');  
}, 1000);
*/