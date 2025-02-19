import { track,trigger } from "./effect"

function createGetter(isreadOnly = false){
    return function get(target:Object,key:string|symbol){
        if(!isreadOnly){
            track(target,key)
        }
        return Reflect.get(target,key)
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
