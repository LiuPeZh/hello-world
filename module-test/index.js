const test = require('./test')

console.log('index one: ')
console.log(test)
setTimeout(() => {
  console.log('index time: ')
  console.log(test)
}, 1500)