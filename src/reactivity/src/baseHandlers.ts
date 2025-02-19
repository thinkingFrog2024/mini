import { isObject } from "../../share"
import { track,trigger } from "./effect"
import { reactive, readOnly } from "./reactive"
import { ReactiveFlags } from "./reactiveFlags"
import { isTracking } from "./effect"


function createGetter(isreadOnly = false,shallow = false){
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
                // 当数据活跃并且当前有正在运行的影响时才需要进行track
                if(!isreadOnly&&isTracking()){
                    track(target,key)
                }

                const res = Reflect.get(target,key)
                if(shallow){
                    return res
                }

                
                if(isObject(res)){
                    return isreadOnly?readOnly(res):reactive(res)
                }else{
                    return res
                }
            }
        }
    }
}

function createSetter(isreadOnly = false){
    return function set(target:Object,key:string|symbol,val:any){
        if(!isreadOnly&&target[key]!==val){
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
const shallowRadOnlyGetter = createGetter(true,true)

export const mutableHandler = {
    get:Getter,
    set:Setter
}
export const readOnlyHandler = {
    get:readOnlyGetter,
    set:readOnlySetter
}

export const shallowRadOnlyHandler = Object.assign({},readOnlyHandler,{
    get:shallowRadOnlyGetter
})