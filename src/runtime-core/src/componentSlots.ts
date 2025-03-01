import { isObject } from "../../share"
import { SHAPEFLAGS } from "../../share/ShapeFlags"
import { h } from "./h"
import { createVnode } from "./vnode"
import { VNode } from "./vnode"
import { Fragment } from "./symbol"



// 插槽是在渲染子组件的时候 传递给h函数的第三个参数 而h函数的第一个参数是组件
// 那么在createVnode的时候 会返回一个类型是组件的虚拟节点
// 而之前的错误就是因为认为类型不应该是组件（也就是对象）而是fragment 导致sahpeFlags错误
// 有节点实例 有组件实例
// 如果节点的type是一个对象 而不是一个例如div的字符串 证明这是一个组件
// 然后就会创建组件实例 原来的节点实例会挂载在组件实例的vnode属性上面
// 而这里的插槽可以分为没有位置的默认插槽 有位置的具名插槽 这两种插槽的值可以是 节点 节点数组 或者由函数返回节点或者节点数
// slots是属于某个组件`的 而不是节点的
function normalizeSlots(val) {
    return Array.isArray(val) ? val : [val]
}

export function initSlots(instance, children) {
    if (instance.vnode.shapeFlag & SHAPEFLAGS.slot_children) {
        if (children instanceof VNode || Array.isArray(children) || typeof children == 'function') {
            let res = children
            if (typeof children === 'function') {
                res = (props) => normalizeSlots(children(props))
                instance.slots = res
                return
            }
            instance.slots = normalizeSlots(res)
        } else {
            const slots = {}
            for (let key in children) {
                const value = children[key]
                // slots原本应该是一个虚拟节点 因为h函数的第三个参数是数组 所以应该用数组包裹起来
                // 对于作用域插槽 slots是一个函数 返回一个虚拟节点 
                // 应该先获得这个节点 再包装成函数 
                if (typeof value === 'function') {
                    slots[key] = (props) => normalizeSlots(value(props))
                } else {
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
export function renderSlots(slots, name, prop) {
    if (Array.isArray(slots)) {

        return createVnode(Fragment, {}, slots)
    } else if (isObject(slots) && name) {

        const slot = slots[name]
        if (!slot) {
            return
        }

        if (typeof slot === 'function') {

            return createVnode(Fragment, {}, slot(prop))
        } else {

            return createVnode(Fragment, {}, slot)
        }
    } else if (typeof slots === 'function') {

        return createVnode(Fragment, {}, slots(prop))
    }
}