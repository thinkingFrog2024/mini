

let activeEffect :null|ReactiveEffect
class ReactiveEffect{
    private _fn:Function
    schelduler:Function
    private active:boolean = true
    constructor(fn:Function,options:any){
        this._fn = fn
        this.schelduler = options.schelduler 
    }
    run(){
        activeEffect = this
        const result = this._fn()
        return result
    }
    stop(){
        if(this.active){
            const depsSet = effectMap.get(this)
            for(let dep of depsSet){
                dep.delete(this)
            }
            this.active = false
        }
    }
}

export function effect(fn:Function,options:Object = {}){
    const _effect = new ReactiveEffect(fn,options)
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