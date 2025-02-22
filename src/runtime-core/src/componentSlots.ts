import { h } from "./h"

function normalizeSlots (val){
    return Array.isArray(val)?val:[val]
}

export function initSlots(instance,children){
    // instance.slots = children
    // 为了实现具名插槽这里使用对象

    // 实现作用域插槽：slots是一个函数
    const slots = {}
    for(let key in children){
        const value = children[key]
        // slots原本应该是一个虚拟节点 因为h函数的第三个参数是数组 所以应该用数组包裹起来
        // 对于作用域插槽 slots是一个函数 返回一个虚拟节点 
        // 应该先获得这个节点 再包装成函数 
        slots[key] = (props)=>normalizeSlots(value(props))
    }
    instance.slots = slots
}

export function renderSlots(slots,name,prop){
    const slot = slots[name]
    if(slot){
        console.log(slot(prop));
        
    return slot(prop)
    }
}