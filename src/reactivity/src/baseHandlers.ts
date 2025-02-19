import { isObject } from "../../share"
import { track,trigger } from "./effect"
import { reactive } from "./reactive"
import { ReactiveFlags } from "./reactiveFlags"


function createGetter(isreadOnly = false){
    return function get(target:Object,key:string|symbol){
        switch(key){
            case ReactiveFlags.RAW:{
                return target
                break
            }
            case ReactiveFlags.IS_REACTIVE:{
                return !isreadOnly
                break
            }
            case ReactiveFlags.IS_READONLY:{
                return isreadOnly
                break
            }
            default:{
                if(!isreadOnly){
                    track(target,key)
                }
                const res = Reflect.get(target,key)
                if(isObject(res)){
                    return reactive(res)
                }else{
                    return res
                }
            }
        }
    }
}

function createSetter(isreadOnly = false){
    return function set(target:Object,key:string|symbol,val:any){
        if(!isreadOnly){
            Reflect.set(target,key,val)
            trigger(target,key)
        }else{
            console.warn('禁止修改只读对象')
        }
        return true
    }
}

const readOnlyGetter = createGetter(true)
const Getter = createGetter(false)
const readOnlySetter = createSetter(true)
const Setter = createSetter(false)

export const mutableHandler = {
    get:Getter,
    set:Setter
}
export const readOnlyHandler = {
    get:readOnlyGetter,
    set:readOnlySetter
}
