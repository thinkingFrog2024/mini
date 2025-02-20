import { reactive } from "../src/reactive"
import { effect,stop } from "../src/effect"
it("实现stop停止跟踪功能",()=>{
    let a:any = reactive({
        foo:1
    })
    let b:number = 0
    const fn = function(){
        b = a.foo
        return b
    }
    const runner = effect(fn)
    expect(b).toBe(1)
    stop(runner)
    a.foo ++
    expect(b).toBe(1)
    runner()
    expect(b).toBe(2)
    a.foo = 12
    expect(b).toBe(2)
})
it("实现onstop停功能",()=>{
    let a:any = reactive({
        foo:1
    })
    let b:number = 0
    const fn = function(){
        b = a.foo+1
        return b
    }
    let onStop = jest.fn(()=>{
        console.log("执行onstop作为stop的回调函数")
    })
    const runner = effect(fn,{
        onStop
    })
    expect(b).toBe(2)
    stop(runner)
    expect(onStop).toHaveBeenCalled()
})