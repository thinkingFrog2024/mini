import { h } from "./h"

export function initSlots(instance,children){
    instance.slots = children
}

export function renderSlots(slots){
    return h('div',{},Array.isArray(slots)?slots:[slots])
}