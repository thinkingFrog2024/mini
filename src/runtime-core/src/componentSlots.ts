import { isObject } from "../../share"
import { SHAPEFLAGS } from "../../share/ShapeFlags"
import { h } from "./h"
import { createVnode } from "./vnode"
import { VNode } from "./vnode"


function normalizeSlots (val){
    return Array.isArray(val)?val:[val]
}

export function initSlots(instance,children){
    
    if(instance.vnode.shapeFlag&SHAPEFLAGS.slot_children){
        
        
        if(children instanceof VNode||Array.isArray(children)||typeof children == 'function' ){
            let res = children
            
            if(typeof children === 'function'){
                res = (props)=>normalizeSlots(children(props))
                instance.slots = res
                return
            }
            instance.slots = normalizeSlots(res)
        }else{
            const slots = {}
            for(let key in children){
                const value = children[key]
                // slots原本应该是一个虚拟节点 因为h函数的第三个参数是数组 所以应该用数组包裹起来
                // 对于作用域插槽 slots是一个函数 返回一个虚拟节点 
                // 应该先获得这个节点 再包装成函数 
                if(typeof value === 'function'){
                    slots[key] = (props)=>normalizeSlots(value(props))
                }else{
                    slots[key] = normalizeSlots(value)
                }
            }
            instance.slots = slots
        }
    }
    
    
    // 具名插槽：children是一个对象 对象的属性值是虚拟节点
    // 作用域插槽：对象的属性值是一个函数

}
// 这里的slots可能是数组或者函数
// 如果是默认插槽 直接return createVnode('div',{},slot)
// 如果slots是一个对象 对象属性值是一个数组 
// 对象属性值是一个函数
export function renderSlots(slots,name,prop){
    // const slot = slots[name]
    // if(slot){
    // return createVnode('div',{},slot(prop))
    // }

    if(Array.isArray(slots)){
        
        return createVnode('div',{},slots)
    }else if(isObject(slots)&&name){
        
        const slot = slots[name]
        if(typeof slot === 'function'){
            return createVnode('div',{},slot(prop))
        }else{
            return createVnode('div',{},slot)
        }
    }else if(typeof slots ==='function'){
        console.log('函数');
        
        return createVnode('div',{},slots(prop))
    }
}