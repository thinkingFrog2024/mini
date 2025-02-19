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
    // console.log(target[ReactiveFlags.IS_READONLY],!!(!undefined))
    // if(target[ReactiveFlags.IS_READONLY] === false){
    //     return true
    // }
    // if(target[ReactiveFlags.IS_READONLY] === true||target[ReactiveFlags.IS_READONLY] = undefined={}){
    //     return false
    // }

    return !!(target[ReactiveFlags.IS_REACTIVE])
}


function createActiveObject(raw:any,handler){
    return new Proxy(raw,handler)
}