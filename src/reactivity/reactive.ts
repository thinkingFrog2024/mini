import { track,trigger } from "./effect"
const handler = {
    get:(target:Object,key:string|symbol)=>{
        track(target,key)
        return Reflect.get(target,key)
    },
    set:(target:Object,key:string|symbol,val:any)=>{
        Reflect.set(target,key,val)
        trigger(target,key)
        return true
    },
}


export function reactive(raw:Object){
    return new Proxy(raw,handler)
}