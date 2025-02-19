import { shallowReadOnly } from "../src/reactive"
import { isReactive,isReadOnly } from "../src/reactive"
it("浅层响应式只读对象",()=>{
    let origin:any = {
        foo:{
            a:{
                b:1
            }
        }
    }
    let observed = shallowReadOnly(origin)

    expect(isReactive(observed)).toBe(false)
    expect(isReactive(observed.foo)).toBe(false)
    expect(isReactive(observed.foo.a)).toBe(false)
    expect(isReactive(observed.foo.a.b)).toBe(false)
    expect(isReadOnly(observed)).toBe(true)
    expect(isReadOnly(observed.foo)).toBe(false)
    expect(isReadOnly(observed.foo.a)).toBe(false)
    expect(isReadOnly(observed.foo.a.b)).toBe(false)
    observed.foo = 1
    expect(observed.foo).not.toBe(1)

})