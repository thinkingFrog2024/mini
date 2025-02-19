

let activeEffect :null|ReactiveEffect
class ReactiveEffect{
    private _fn:any
    constructor(fn){
        this._fn = fn
    }
    run(){
        activeEffect = this
        this._fn()
    }
}

export function effect(fn:Function){
    const _effect = new ReactiveEffect(fn)
    _effect.run()
    activeEffect = null
}


const targetMap = new Map()
export function track(target:Object,key:string|symbol){
    let depsMap = targetMap.get(target)
    if(!depsMap){
        depsMap = new Map()
        targetMap.set(target,depsMap)
    }
    let dep = depsMap.get(key)
    if(!dep){
        dep = new Set()
        depsMap.set(key,dep)
    }
    dep.add(activeEffect)
}


export function trigger(target:Object,key:string|symbol){
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)
    for(let effect of dep){
        effect.run()
    }
}