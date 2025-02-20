import { h } from "./h"

export function initSlots(instance,children){
    // instance.slots = children
    // 为了实现具名插槽这里使用数组
    const slots = {}
    for(let key in children){
        const value = children[key]
        slots[key] = Array.isArray(value)?value:[value]
    }
    instance.slots = slots
}

export function renderSlots(slots,name){
    const slot = slots[name]
    if(slot){
    return h('div',{},slot)
    }
}