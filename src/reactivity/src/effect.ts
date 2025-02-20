
// activeEffect不为空证明当前有正在运行的函数 那么才有必要触发依赖收集 否则get陷阱只需要返回访问值即可
let activeEffect :null|ReactiveEffect
export class ReactiveEffect{
    private _fn:Function
    // schelduler?:Function
    private active:boolean = true
    public onStop?:()=>void
    deps = new Set()
    constructor(fn:Function,public schelduler?){
        this._fn = fn
    }
    run(){
        // 如果当前函数不处于活跃状态 也就是这个runner被stop了 此时若是继续调用runner 应该只执行函数而不收集依赖
        // 否则调用runner之后 函数会被再次添加到依赖列表
        if(this.active){
            activeEffect = this
        }
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

export function effect(fn:Function,options:any = {}){
    const schelduler = options.schelduler
    const _effect = new ReactiveEffect(fn,schelduler)
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
}

export function trackEffects(dep){
    if(isTracking()){
        if(dep.has(activeEffect))return
        dep.add(activeEffect)
        activeEffect!.deps.add(dep)
    }
}

export function trigger(target:Object,key:string|symbol){
    // let depsMap = targetMap.get(target)
    // if(!depsMap) return 
    // let dep = depsMap.get(key)
    // triggerEffects(dep)

    // 现在只实现的get和set 但是其实有其他的操作 比如delete 这些操作也有对应的effects需要触发
    // 所以应该初始化两个数组:deps 存放所有的dep effects 遍历deps 把里面的函数解构出来存放在efffects里面
    // 然后把处理好的effect交给triggerEffects处理
    let deps:Array<any> = []

    // 取出get对应的effects并存放
    let depsMap = targetMap.get(target)
    if(!depsMap) return //注意这里可能是不存在的
    let dep = depsMap.get(key)
    deps.push(dep)

    let effects:Array<any> = []
    deps.forEach(dep=>{
        effects.push(...dep)
    })
    triggerEffects(effects)
}

export function triggerEffects(dep){
    for(let effect of dep){
        console.log(effect.schelduler);
        
        // nextTick就是通过schelduler实现的
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