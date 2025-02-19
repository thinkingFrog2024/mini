import { effect } from "../src/effect";
it("effect函数执行",()=>{
    let a
    let b = 10
    const fn = function(){
        a = b+1
    }
    effect(fn)
    expect(a).toBe(11)
})