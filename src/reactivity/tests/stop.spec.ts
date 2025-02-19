import { reactive } from "../reactive"
import { effect,stop } from "../effect"
it("实现stop停止跟踪功能",()=>{
    let a:any = reactive({
        foo:1
    })
    let b:number = 0
    const fn = function(){
        b = a.foo+1
        return b
    }
    const runner = effect(fn)
    expect(b).toBe(2)
    stop(runner)
    a.foo = 12
    expect(b).toBe(2)
    runner()
    expect(b).toBe(13)
})