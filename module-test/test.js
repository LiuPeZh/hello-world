// const obj = {
//   name: 'obj',
//   val: '1'
// }
let a = '1'

setTimeout(() => {
  // obj.name = 'new obj'
  a = '2'
  console.log('test time: ')
  // console.log(obj)
  console.log(a)
}, 1000)
console.log('test one: ')
// console.log(obj)
console.log(a)

exports.a = a