

let activeEffect :null|ReactiveEffect
class ReactiveEffect{
    private _fn:Function
    schelduler?:Function
    private active:boolean = true
    private onStop?:()=>void
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


const targetMap = new Map()
const effectMap = new Map()
export function track(target:Object,key:string|symbol){
    if(!activeEffect)return
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
    let effects = effectMap.get(activeEffect)
    if(!effects){
        effects = new Set()
        effectMap.set(activeEffect,effects)
    }
    effects.add(dep)
}


export function trigger(target:Object,key:string|symbol){
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)
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
    const depsSet = effectMap.get(effect)
    for(let dep of depsSet){
        dep.delete(effect)
        }
    if(onStop){
        onStop()
        }
    depsSet.length = 0
}