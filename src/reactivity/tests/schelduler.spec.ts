import { effect } from "../effect"
import { reactive } from "../reactive"

it('实现reactive的schlduler功能',()=>{
    let a:any = reactive({
        foo:1
    })
    const schelduler = jest.fn(()=>{
        console.log("schelduler");
        
    })
    const fn = function(){
        const b = a.foo
        console.log('执行fn')
        return b
    }
    const runner = effect(fn,{
        schelduler
    })
    expect(schelduler).not.toHaveBeenCalled()
    a.foo = 12
    expect(schelduler).toHaveBeenCalledTimes(1)
    a.foo = 122
    expect(schelduler).toHaveBeenCalledTimes(2)
    runner()
    expect(schelduler).toHaveBeenCalledTimes(2)


})