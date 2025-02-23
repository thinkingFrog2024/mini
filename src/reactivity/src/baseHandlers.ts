import { isObject } from "../../share"
import { track,trigger } from "./effect"
import { reactive, reactiveMap, readOnly, readOnlyMap, shallowReadOnlyMap } from "./reactive"
import { ReactiveFlags } from "./reactiveFlags"
import { isTracking } from "./effect"


function createGetter(isreadOnly = false,shallow = false){
    return function get(target:Object,key:string|symbol,recevier:any){
        // 验证访问reactive的源对象的时候key是否正确 访问上下文是否正确:访问上下文是代理对象
        const isExistInReactiveMap = ()=>
            recevier === reactiveMap.get(target)

        const isExistInReadOnlyeMap = ()=>
            recevier === readOnlyMap.get(target)

        const isExistInShallowReadOnlyeMap = ()=>
            recevier === shallowReadOnlyMap.get(target)





        switch(key){
            case ReactiveFlags.RAW:{
                if(
                    isExistInReactiveMap()||
                    isExistInReadOnlyeMap()||
                    isExistInShallowReadOnlyeMap()
                    ){
                        return target
                    }
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
                if(!isreadOnly){
                    track(target,key)
                }

                const res = Reflect.get(target,key)
                if(shallow){
                    return res
                }else if(isObject(res)){
                    return isreadOnly?readOnly(res):reactive(res)
                }else{
                    return res
                }
            }
        }
    }
}

function createSetter(isreadOnly = false){
    return function set(target:Object,key:string|symbol,val:any,receiver){
        if(!isreadOnly){
            if(target[key]!==val){
                const res = Reflect.set(target,key,val,receiver)
                trigger(target,key)
                return res
            }else{
                return true
            }
            
        }else if(isreadOnly){
            console.warn('禁止修改只读对象')
            return true
        }
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