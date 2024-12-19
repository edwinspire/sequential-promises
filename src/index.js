"use strict";

export default class PromiseSequence {
  constructor() {
    this.promiseCallback = undefined;
    this.numThreads = 5;
    this.queue = [];
    this.activePromises = 0;
  }

  static _isNumber(value) {
    return typeof value === "number" && !isNaN(value);
  }

  static _isArray(value) {
    return value && Array.isArray(value);
  }

  async thread(promiseCallback, numThreads, dataList) {
    this.promiseCallback = promiseCallback;
    this.numThreads = numThreads;
    this.queue = dataList || [];

    if (!PromiseSequence._isNumber(numThreads)) {
      throw { message: "numThreads is not number", value: numThreads };
    }

    while (true) {
      if (
        this.promiseCallback &&
        this.activePromises < this.numThreads &&
        this.queue.length > 0
      ) {
        const param = this.queue.shift();
        this.activePromises++;
        try {
          //   console.log(">>>>", this.activePromises, this.queue.length);

          this.promiseCallback(param)
            .then((result) => {
              //   console.log(result);
              /*   
           if (this.onFinish) {
                this.onFinish({ resolve: result });
              }
              */
            })
            .catch((err) => {
              console.log(err);
              //              this.onFinish({ error: err });
            })
            .finally(() => {
              //  console.log("Ha finalizado.");
              this.activePromises--;
            });
        } catch (error) {
          console.error("Error al guardar log:", error);
        }
      } else {
        // Pausa para evitar consumo innecesario de CPU
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  push(item) {
    this.queue.push(item);
  }

  static ArrayChunk(myArray, chunk_size) {
    chunk_size = parseInt(chunk_size);
    const tempArray = [];

    for (let index = 0; index < myArray.length; index += chunk_size) {
      const myChunk = myArray.slice(index, index + chunk_size);
      tempArray.push(myChunk);
    }

    return tempArray;
  }

  static async _allSettledPolyfill(promises) {
    return Promise.all(
      promises.map(async (promise) => {
        try {
          const value = await promise;
          return { status: "fulfilled", value };
        } catch (reason) {
          return { status: "rejected", reason };
        }
      })
    );
  }

  static async ByBlocks(fn_action, number_blocks, list_items) {
    if (!PromiseSequence._isNumber(number_blocks)) {
      throw { message: "number_blocks is not number", value: number_blocks };
    }

    if (!PromiseSequence._isArray(list_items)) {
      throw { message: "list_items is not Array", value: list_items };
    }

    const elements_per_block = Math.ceil(list_items.length / number_blocks);

    return PromiseSequence.ByItems(fn_action, list_items, elements_per_block);
  }

  static async ByItems(fn_action, items_per_block, list_items) {
    if (!PromiseSequence._isNumber(items_per_block)) {
      throw {
        message: "items_per_block is not number",
        value: items_per_block,
      };
    }

    if (!PromiseSequence._isArray(list_items)) {
      throw { message: "list_items is not Array", value: list_items };
    }

    const blocks = PromiseSequence.ArrayChunk(list_items, items_per_block);
    const arrayPromises = blocks.map((block) =>
      PromiseSequence.Secuential(fn_action, block)
    );

    const endResult = await PromiseSequence._allSettledPolyfill(arrayPromises);
    const result = endResult.flatMap((r) => r.value);
    return result;
  }

  static async Secuential(fn_action, iterable) {
    const Response = [];
    for (const data of iterable) {
      try {
        const r = await fn_action(data);
        // Response.push({ status: "fulfilled", value: r });
        Response.push({ param: data, result: r });
      } catch (error) {
        // Response.push({ status: "rejected", reason: error });
        Response.push({ param: data, error });
      }
    }
    return Response;
  }
}
