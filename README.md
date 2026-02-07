# Sequential Promises

A lightweight and flexible library to execute promises sequentially or in parallel with concurrency control. Ideal for managing batch processing, API rate limits, or any asynchronous tasks that need thread-like management in a single-threaded Node.js/Browser environment.

## Installation

```bash
npm install @edwinspire/sequential-promises
```

## Usage

Import the class:

```javascript
import PromiseSequence from "@edwinspire/sequential-promises";
```

## API Documentation

### `PromiseSequence` Class

#### `constructor()`
Initializes a new `PromiseSequence` instance.

*   **Properties**:
    *   `numThreads` (number): Default concurrency limit (default: 5).
    *   `queue` (Array): Internal queue of data items to process.
    *   `activePromises` (number): Current count of active executions.
    *   `onFinish` (Function): Optional callback triggered on individual promise resolution or rejection.

---

### Instance Methods

#### `thread(promiseCallback, numThreads, dataList)`
Starts a background worker style process that consumes items from the queue using `numThreads` concurrency. It continues processing as long as items exist in the queue.

*   **Parameters**:
    *   `promiseCallback` (Function): A function that accepts an item and returns a Promise.
        *   signature: `(item) => Promise<any>`
    *   `numThreads` (number): The maximum number of concurrent executions.
    *   `dataList` (Array): (Optional) Initial list of items to add to the queue.
*   **Return**: `Promise<void>` (Resolves when the current synchronous setup is done, but processing runs asynchronously).

**Example**:
```javascript
const seq = new PromiseSequence();

// Define a worker function
const worker = async (item) => {
    console.log("Processing:", item);
    await new Promise(r => setTimeout(r, 1000));
    return item * 2;
};

// Handle per-item completion
seq.onFinish = ({ resolve, error, param }) => {
    if (error) console.error("Failed:", param, error);
    else console.log("Finished:", param, "Result:", resolve);
};

// Start processing 3 items in parallel
seq.thread(worker, 3, [1, 2, 3, 4, 5, 6]);
```

#### `push(item)`
Adds an item to the queue and triggers processing if the active thread count is below the limit. Useful for dynamic workloads where items are added over time.

*   **Parameters**:
    *   `item` (any): The data item to process.

---

### Static Methods

#### `static Sequential(fn_action, iterable)`
Executes a function strictly sequentially (one by one) over a list of items.

*   **Parameters**:
    *   `fn_action` (Function): Function that returns a Promise.
    *   `iterable` (Array): List of items to process.
*   **Return**: `Promise<Array<{param, result}|{param, error}>>`
    *   Returns an array of objects containing the original parameter and either the `result` or `error`.

#### `static ByBlocks(fn_action, number_blocks, list_items)`
Splits the total list of items into a fixed number of blocks and processes each block sequentially relative to itself, but blocks run concurrently.

*   **Parameters**:
    *   `fn_action` (Function): Function that returns a Promise.
    *   `number_blocks` (number): Total number of blocks to divide the data into.
    *   `list_items` (Array): The data array.
*   **Return**: `Promise<Array>` (Flattened array of results).

#### `static ByItems(fn_action, items_per_block, list_items)`
Splits the list into chunks of a specific size (`items_per_block`). Each chunk is processed sequentially within itself, but multiple chunks run concurrently.

*   **Parameters**:
    *   `fn_action` (Function): Function that returns a Promise.
    *   `items_per_block` (number): Size of each chunk.
    *   `list_items` (Array): The data array.
*   **Return**: `Promise<Array>` (Flattened array of results).

#### `static ArrayChunk(myArray, chunk_size)`
Helper utility to split an array into smaller chunks.

*   **Parameters**:
    *   `myArray` (Array): Input array.
    *   `chunk_size` (number): Number of elements per chunk.
*   **Return**: `Array<Array>` (Array of arrays).

## Legacy Helper
*   `static Secuential`: Deprecated alias for `Sequential`.

---

## Technical Notes
*   **Concurrency**: The `thread`, `ByBlocks`, and `ByItems` methods allow concurrent execution up to the specified limits.
*   **Queue Management**: The `thread` method uses an event-driven internal queue. You can push new items at any time.
*   **Error Handling**:
    *   `Sequential` captures errors and returns them in the result object `{ param, error }`.
    *   `thread` passes errors to the `onFinish` callback if defined.
