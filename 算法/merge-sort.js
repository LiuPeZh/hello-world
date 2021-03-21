function mergeSort(arr) {
  let res = [] 
  
  if (!arr.length || arr.length === 1) {
    return arr
  }

  let middle = parseInt(arr.length / 2)

  return mergeArr(
    mergeSort(arr.slice(0, middle)),
    mergeSort(arr.slice(middle, arr.length))
  )
  
}

function mergeArr(arr1, arr2) {
  let len1 = arr1.length
  let len2 = arr2.length
  if (!len1) {
    return arr2
  }
  if (!len2) {
    return arr1
  }
  let t = []
  let i = 0
  let j = 0
  while (i < len1 && j < len2) {
    if (arr1[i] > arr2[j]) {
      t.push(arr2[j])
      j++
    } else {
      t.push(arr1[i])
      i++
    }
  }
  if (i < len1) {
    t = t.concat(arr1.slice(i))
  }
  if (j < len2) {
    t = t.concat(arr2.slice(j))
  }
  return t
}