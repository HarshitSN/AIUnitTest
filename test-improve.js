// This function has several areas that could be improved
function processData(data) {
  let result = [];

  // Inefficient nested loops
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].items.length; j++) {
      if (data[i].items[j].active) {
        result.push({
          id: data[i].id,
          name: data[i].name,
          item: data[i].items[j].name,
          value: data[i].items[j].value * 1.1, // Hardcoded tax
        });
      }
    }
  }

  return result;
}

// Unused variable
const TAX_RATE = 1.1;

// Inefficient string concatenation in loop
function createMessage(items) {
  let message = '';
  for (let i = 0; i < items.length; i++) {
    message += 'Item ' + (i + 1) + ': ' + items[i] + '\n';
  }
  return message;
}

// Callback hell example
function fetchData(callback) {
  setTimeout(() => {
    const data = { id: 1, name: 'Test' };
    setTimeout(() => {
      callback(data);
    }, 100);
  }, 100);
}

// Potential memory leak
const cache = {};
function getData(id) {
  if (!cache[id]) {
    // Simulate API call
    cache[id] = { id, data: 'Some data' };
  }
  return cache[id];
}

// No error handling
function divide(a, b) {
  return a / b;
}
