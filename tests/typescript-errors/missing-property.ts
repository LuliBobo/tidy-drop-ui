interface User {
  id: number;
  name: string;
  email: string;
}

// Missing the email property
const user: User = {
  id: 1,
  name: 'John Doe'
};

console.log(user);