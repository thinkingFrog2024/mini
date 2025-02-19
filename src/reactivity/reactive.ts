import { mutableHandler,readOnlyHandler } from "./baseHandlers"



export function reactive(raw:Object){
    return createActiveObject(raw,mutableHandler)
}


export function readOnly(raw:Object){
    return createActiveObject(raw,readOnlyHandler)
}

function createActiveObject(raw:any,handler){
    return new Proxy(raw,handler)
}