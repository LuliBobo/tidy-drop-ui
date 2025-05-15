function add(a: number, b: number): number {
  return a + b;
}

// Type mismatch - string passed to number parameter
const result = add('5', 10);
console.log(result);