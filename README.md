# PromiseSequence class

The PromiseSequence class allows you to execute a set of promises sequentially or in parallel, depending on the number of threads specified. This is useful for managing asynchronous processes with concurrency constraints, such as HTTP requests, database queries, or any other asynchronous task that must be executed in batches.

### Constructor

`constructor()` 

Initializes an instance of `PromiseSequence` with the following attributes:

- `promiseCallback`: function that will be executed as a promise for each element in the queue.
- `numThreads`: number of promises to be executed in parallel (default is 5).
- `queue`: array of elements for which promises will be executed.
- `results`: array where the results or errors of each promise will be stored.
- `activePromises`: counter of active promises currently running.


### Thread method

    thread(promiseCallback, numThreads, dataList)

Runs the promiseCallback function in parallel for dataList elements, with a maximum of numThreads promises in parallel.

 - Parameters:
	- promiseCallback: function that returns a promise to be executed for each element.
	- numThreads: number of promises in parallel.
	- dataList: list of data on which promiseCallback will be applied.
- Return: A Promise that resolves when all promises have finished.

Example:

    const sequence = new PromiseSequence();
    const processData = (item) => new Promise((resolve) => setTimeout(() => resolve(item * 2), 100));
    
    sequence.thread(processData, 3, [1, 2, 3, 4, 5])
      .then((results) => console.log(results)) // [{ result: 2, param: 1 }, { result: 4, param: 2 }, ...]
      .catch((error) => console.error(error));

### ArrayChunk static method

    static ArrayChunk(myArray, chunk_size)

Divides an array into blocks of size chunk_size.

- Parameters:
	- myArray: array to divide.
	- chunk_size: size of each block.
- Return: array of arrays (blocks).

Example:

    const chunks = PromiseSequence.ArrayChunk([1, 2, 3, 4, 5], 2); console.log(chunks); // [[1, 2], [3, 4], [5]]

### ByBlocks static method

    static async ByBlocks(fn_action, list_items, number_blocks)

Runs an asynchronous function fn_action for each item in list_items, splitting the work into number_blocks blocks.

- Parameters:
	- fn_action: function that returns a promise.
	- list_items: list of data to apply the function.
	- number_blocks: number of blocks to divide the list into.
- Return: a promise that is resolved by results.

Example:

    const results = await PromiseSequence.ByBlocks(async (x) => x * 2, [1, 2, 3, 4, 5], 2);
    console.log(results); // [{param: 1, result: 2}, ...]


### ByItems static method

    static async ByItems(fn_action, list_items, items_per_block) -> Promise<Array>

Splits list_items into blocks of items_per_block elements and runs fn_action on each block.

Example:

    PromiseSequence.ByItems(myAction, [1, 2, 3, 4], 2)
      .then(result => console.log(result));


### Secuential

    static async Secuential(fn_action, iterable) -> Promise<Array>
Executes a function sequentially over an iterable list, so that only one element is processed at a time.

- Parameters:
	- fn_action: Function to execute.
	- iterable: List of elements.
- Example:

    const myAction = async (item) => item * 2;
    PromiseSequence.Secuential(myAction, [1, 2, 3])
      .then(result => console.log(result));

### Complete Use Example

    const dataList = [1, 2, 3, 4, 5];
    const callback = async (item) => item * 2;
    
    const sequence = new PromiseSequence();
    sequence.thread(callback, 2, dataList)
      .then(results => console.log("Results:", results))
      .catch(error => console.error("Error:", error));

This example creates an instance of PromiseSequence and uses the thread method to process each dataList element with the callback, limited to 2 simultaneous threads.


