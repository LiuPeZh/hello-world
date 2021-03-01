class ListNode {
  constructor(val) {
    this.val = val
    this.next = null
  }
  static appendTail(head, val) {
    while (head.next) {
      head = head.next
    }
    head.next = new ListNode(val)
  }
  static delete(head, val) {
    while (head) {
      if (head.val === val) {

      }
    }
  }
  static init(arr) {
    let p = new ListNode(0)
    let head = p
    for (let i = 0; i < arr.length; i++) {
      p.next = new ListNode(arr[i])
      p = p.next
    }
    return head.next
  }
}


function segmentList(list, x) {
  let smallHead = new ListNode(0)
  let largeHead = new ListNode(0)
  let small = smallHead
  let large = largeHead
  while(list.next) {
    if (list.val <= x) {
      small.next = list
      small = small.next
    } else {
      large.next = list
      large = large.next
    }
    list = list.next
  }
  small.next = largeHead
  return smallHead.next
}
