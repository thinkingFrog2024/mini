import { mutableHandler,readOnlyHandler,shallowRadOnlyHandler } from "./baseHandlers"
import { ReactiveFlags } from "./reactiveFlags"


export const reactiveMap = new WeakMap()
export const readOnlyMap = new WeakMap()
export const shallowReadOnlyMap = new WeakMap()



export function reactive(raw:Object){
    return createActiveObject(raw,reactiveMap,mutableHandler)
}


export function readOnly(raw:Object){
    return createActiveObject(raw,readOnlyMap,readOnlyHandler)
}

export function shallowReadOnly(raw:Object){
    return createActiveObject(raw,shallowReadOnlyMap,shallowRadOnlyHandler)
}

export function isReadOnly(target:any){
    return !!target[ReactiveFlags.IS_READONLY]
}


export function isReactive(target:any){
    return !!(target[ReactiveFlags.IS_REACTIVE])
}

export function isProxy(target:any){
    return isReactive(target)||isReadOnly(target)
}

function createActiveObject(raw:any,proxyMap,handler){
    // 如果需要代理的对象是已经代理过的对象 那么直接返回
    if(proxyMap.get(raw))return proxyMap.get(raw)
    const proxy = new Proxy(raw,handler)
    proxyMap.set(raw,proxy)
    return proxy
}