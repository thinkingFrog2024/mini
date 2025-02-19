
// activeEffect不为空证明当前有正在运行的函数 那么才有必要触发依赖收集 否则get陷阱只需要返回访问值即可
let activeEffect :null|ReactiveEffect
class ReactiveEffect{
    private _fn:Function
    schelduler?:Function
    private active:boolean = true
    private onStop?:()=>void
    deps = new Set()
    constructor(fn:Function,options:any){
        this._fn = fn
    }
    run(){
        activeEffect = this
        const result = this._fn()
        return result
    }
    stop(){
        if(this.active){
            cleanupEffects(this,this.onStop)
            this.active = false
        }
    }
}

export function effect(fn:Function,options:Object = {}){
    const _effect = new ReactiveEffect(fn,options)
    Object.assign(_effect,options)
    _effect.run()
    activeEffect = null
    // call立即执行 bind只是绑定上下文
    const runner:any = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

export function isTracking(){
    return !!activeEffect
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
    trackEffects(dep)
    // dep.add(activeEffect)
    // let effects = effectMap.get(activeEffect)
    // if(!effects){
    //     effects = new Set()
    //     effectMap.set(activeEffect,effects)
    // }
    // effects.add(dep)
}

export function trackEffects(dep){
    if(dep.has(activeEffect))return
    dep.add(activeEffect)
    activeEffect!.deps.add(dep)
}

export function trigger(target:Object,key:string|symbol){
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)
    triggerEffects(dep)
}

export function triggerEffects(dep){
    for(let effect of dep){
        if(effect.schelduler){
            effect.schelduler()
        }else{
            effect.run()
        }
    }
}

export function stop(runner){
    const effect = runner.effect.stop()
}

function cleanupEffects(effect,onStop){
    const depsSet = effect.deps
    for(let dep of depsSet){
        dep.delete(effect)
        }
    if(onStop){
        onStop()
        }
    depsSet.length = 0
}