import { effect } from "../effect";
import { reactive } from "../reactive";
it('依赖收集触发依赖',()=>{
    let a:any = reactive({
        foo:1
    })
    let b
    const fn = function(){
        b = a.foo
    }
    effect(fn)
    expect(b).toBe(1)
    a.foo = 2
    expect(b).toBe(2)
    a.foo = 20
    expect(b).toBe(20)

})