import { mutableHandler,readOnlyHandler } from "./baseHandlers"



export function reactive(raw:Object){
    return new Proxy(raw,mutableHandler)
}


export function readOnly(raw:Object){
    return new Proxy(raw,readOnlyHandler)
}

