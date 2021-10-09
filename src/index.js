"use strict";

module.exports = class PromiseSequence {
  constructor() {
    _allSettledPolyfill();
  }

  static ArrayChunk(myArray, chunk_size) {
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];
    chunk_size = parseInt(chunk_size);

    for (index = 0; index < arrayLength; index += chunk_size) {
      let myChunk = myArray.slice(index, index + chunk_size);
      // Do something if you want with the group
      tempArray.push(myChunk);
    }

    return tempArray;
  }

  static _allSettledPolyfill() {
    if (!Promise.allSettled) {
      Promise.allSettled = (promises) =>
        Promise.all(
          promises.map((promise, i) =>
            promise
              .then((value) => ({
                status: "fulfilled",
                value,
              }))
              .catch((reason) => ({
                status: "rejected",
                reason,
              }))
          )
        );
    }
  }

  static ByBlocks(fn_action, list_items, number_blocks) {
    let elements_per_block = Math.ceil(list_items.length / number_blocks);
    return PromiseSequence.ByItems(fn_action, list_items, elements_per_block);
  }

  static ByItems(fn_action, list_items, items_per_block) {
    PromiseSequence._allSettledPolyfill();
    return new Promise((resolve, reject) => {
      let blocks = PromiseSequence.ArrayChunk(list_items, items_per_block);
      let arrayPromises = blocks.map((block) => {
        return PromiseSequence.Secuential(fn_action, block);
      });

      Promise.allSettled(arrayPromises).then((endResult) => {
        let result = endResult.map((r) => {
          return r.value;
        });
        resolve(result.flat());
      });
    });
  }

  static Secuential(fn_action, iterable) {
    return new Promise(async (resolve, reject) => {
      let Response = [];
      for (const data of iterable) {
        try {
          let r = await fn_action(data);
          Response.push({ status: "fulfilled", value: r });
        } catch (error) {
          Response.push({ status: "rejected", reason: error });
        }
      }
      resolve(Response);
    });
  }
};
