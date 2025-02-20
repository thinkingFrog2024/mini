
// 计算属性：接收一个函数 在函数里面依赖的值改变的时候重新执行

import { ReactiveEffect, trackEffects, triggerEffects } from "./effect"

// 和effect功能相似 但是computed在数据更新却没有.value的时候 不会执行
class ComputedImpl{
    private getter:any
    public dep:any = new Set()
    private _dirty:boolean = false
    private _value:any
    private _effect:any
    constructor(getter){
        this.getter = getter
        this._effect = new ReactiveEffect(getter,
            ()=>{
                if(this._dirty){
                    this._dirty = false
                    triggerEffects(this.dep)
                }
            }
        )
    }
    get value(){
        trackEffects(this.dep)
        if(this._dirty){
            return this._value
        }else{
            this._dirty = true
            return this._effect.run()
        }
    }
}

export function computed(getter){
    return new ComputedImpl(getter)
}