import { effect } from "../src/effect"
import { reactive } from "../src/reactive"

it('effect的runner功能',()=>{
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
    expect(runner()).toBe(2)

})