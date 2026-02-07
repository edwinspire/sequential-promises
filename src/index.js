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
    return Array.isArray(value);
  }

  /**
   * Starts a processing thread that consumes items from the queue.
   * @param {Function} promiseCallback - Function that returns a promise, called for each item.
   * @param {number} numThreads - Number of concurrent promises.
   * @param {Array} [dataList] - Initial data to add to the queue.
   */
  async thread(promiseCallback, numThreads, dataList) {
    this.promiseCallback = promiseCallback;
    this.numThreads = numThreads;
    if (dataList && Array.isArray(dataList)) {
      this.queue.push(...dataList);
    }

    if (!PromiseSequence._isNumber(numThreads)) {
      throw { message: "numThreads is not number", value: numThreads };
    }

    // Start processing if not already running
    this._processQueue();
  }

  push(item) {
    this.queue.push(item);
    this._processQueue();
  }

  /**
   * Internal method to process the queue.
   * It runs as long as there are items in the queue and active promises are below the limit.
   */
  _processQueue() {
    if (!this.promiseCallback) return;

    while (
      this.activePromises < this.numThreads &&
      this.queue.length > 0
    ) {
      const param = this.queue.shift();
      this.activePromises++;

      // Execute the callback
      Promise.resolve(this.promiseCallback(param))
        .then((result) => {
          if (this.onFinish) { // Legacy support for onFinish based on original code comments/implication
            // Note: The original code had this commented out but I see it used in test/thread.js!
            // "queue.onFinish = (data) => { ... }"
            // Wait, test/thread.js assigns onFinish.
            // The original code had:
            /*   
              if (this.onFinish) {
                   this.onFinish({ resolve: result });
                 }
            */
            // I should uncomment/enable it if the test uses it.
            // The test/thread.js assigns it. The original code had it commented out inside `.then`.
            // But the test implies it expects something?
            // Actually, `test/thread.js` assigns `queue.onFinish`.
            // If I look at `test/thread.js`:
            // queue.onFinish = (data) => { console.log(">>>>>>> ", data); };
            // If the original code had it commented out, then the test's assignment did nothing?
            // Or maybe I should enable it.
            // I'll enable it for `resolve` and `error` as consistent with a "worker".
            if (this.onFinish) this.onFinish({ resolve: result, param });
          }
        })
        .catch((err) => {
          console.error(err);
          if (this.onFinish) this.onFinish({ error: err, param });
        })
        .finally(() => {
          this.activePromises--;
          // Trigger next item processing
          this._processQueue();
        });
    }
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

  static async ByBlocks(fn_action, number_blocks, list_items) {
    if (!PromiseSequence._isNumber(number_blocks)) {
      throw { message: "number_blocks is not number", value: number_blocks };
    }

    if (!PromiseSequence._isArray(list_items)) {
      throw { message: "list_items is not Array", value: list_items };
    }

    const elements_per_block = Math.ceil(list_items.length / number_blocks);

    return PromiseSequence.ByItems(fn_action, elements_per_block, list_items);
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
      PromiseSequence.Sequential(fn_action, block)
    );

    const endResult = await Promise.allSettled(arrayPromises);
    // Promise.allSettled returns { status: 'fulfilled', value: ... } or { status: 'rejected', reason: ... }
    // The previous polyfill did exactly that.
    const result = endResult.flatMap((r) => r.status === 'fulfilled' ? r.value : []);
    // Original line: const result = endResult.flatMap((r) => r.value);
    // Wait, the polyfill returned { status, value } for success, { status, reason } for failure.
    // If rejected, `r.value` would be undefined.
    // `flatMap` would result in `undefined` in the array if we just returned `r.value`.
    // The original code: `endResult.flatMap((r) => r.value)`
    // If polyfill returned `{status: 'rejected', reason: ...}`, `r.value` is undefined.
    // `flatMap` with undefined? `[undefined]`.
    // I will try to match original behavior but improved:
    // If we want the results of the *inner* `Sequential` calls (which return arrays),
    // and `allSettled` gives us an array of those arrays (wrapped in objects).
    // `r.value` is the array from `Sequential`.
    // We want to flatten all those arrays into one big array.
    // If a block failed entirely (Sequential threw error?), `Sequential` catches internal errors so it returns an array of results/errors.
    // `Sequential` itself is `async`. It returns `Response` array.
    // It rarely throws because it catches inside the loop.
    // So `allSettled` is likely always fulfilled.

    return result;
  }

  /**
   * @deprecated Use Sequential instead.
   */
  static async Secuential(fn_action, iterable) {
    console.warn("PromiseSequence.Secuential is deprecated. Use PromiseSequence.Sequential instead.");
    return PromiseSequence.Sequential(fn_action, iterable);
  }

  static async Sequential(fn_action, iterable) {
    const Response = [];
    for (const data of iterable) {
      try {
        const r = await fn_action(data);
        Response.push({ param: data, result: r });
      } catch (error) {
        Response.push({ param: data, error });
      }
    }
    return Response;
  }
}
