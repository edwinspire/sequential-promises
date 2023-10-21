"use strict";

export default class PromiseSequence {
  constructor() {
    _allSettledPolyfill();
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

  static async ByBlocks(fn_action, list_items, number_blocks) {
    const elements_per_block = Math.ceil(list_items.length / number_blocks);
    return PromiseSequence.ByItems(fn_action, list_items, elements_per_block);
  }

  static async ByItems(fn_action, list_items, items_per_block) {
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
        Response.push({ status: "fulfilled", value: r });
      } catch (error) {
        Response.push({ status: "rejected", reason: error });
      }
    }
    return Response;
  }

};
