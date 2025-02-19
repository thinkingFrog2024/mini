import { isObject } from "../../share"
import { trackEffects,triggerEffects } from "./effect"
import { isTracking } from "./effect"
import { reactive } from "./reactive"
export function ref(value){
    return new RefImpl(value)
}

class RefImpl{
    private _val:any
    private _raw:any
    public deps = new Set()
    public _isRef_ = true
    constructor(val){
        this._val = isObject(val)?reactive(val):val
        this._raw = val
    }
    get value(){
        if(isTracking()){
            trackEffects(this.deps)
        }
        // 如果接收的值是对象 那么_val需要用reactive包裹
        return this._val
    }
    set value(newVal){
        // 如果接受的值是对象 那么this._val是代理对象 而接受的值是原始对象 所以需要保存没有经过代理的原始对象 进行对比
        if(!Object.is(this._raw,newVal)){
            this._val = isObject(newVal)?reactive(newVal):newVal
            this._raw = newVal
            triggerEffects(this.deps)
        }
    }
}

export function isRef(ref){
    return !!ref._isRef_
}

export function unRef(ref){
    return isRef(ref)?ref.value:ref
}