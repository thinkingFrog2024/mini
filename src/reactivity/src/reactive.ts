import { mutableHandler,readOnlyHandler,shallowRadOnlyHandler } from "./baseHandlers"
import { ReactiveFlags } from "./reactiveFlags"



export function reactive(raw:Object){
    return createActiveObject(raw,mutableHandler)
}


export function readOnly(raw:Object){
    return createActiveObject(raw,readOnlyHandler)
}

export function shallowReadOnly(raw:Object){
    return createActiveObject(raw,shallowRadOnlyHandler)
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

function createActiveObject(raw:any,handler){
    return new Proxy(raw,handler)
}