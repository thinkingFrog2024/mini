import { mutableHandler,readOnlyHandler } from "./baseHandlers"
import { ReactiveFlags } from "./reactiveFlags"



export function reactive(raw:Object){
    return createActiveObject(raw,mutableHandler)
}


export function readOnly(raw:Object){
    return createActiveObject(raw,readOnlyHandler)
}


export function isReadOnly(target:any){
    return target[ReactiveFlags.IS_READONLY]
}


export function isReactive(target:any){
    return !target[ReactiveFlags.IS_READONLY]
}


function createActiveObject(raw:any,handler){
    return new Proxy(raw,handler)
}