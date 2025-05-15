interface Rectangle {
  width: number;
  height: number;
}

interface Circle {
  radius: number;
}

// Incompatible types
const shape: Rectangle = { radius: 5 } as Circle;
console.log(shape);