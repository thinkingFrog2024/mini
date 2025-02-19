import { isReactive, reactive } from "../src/reactive"

it('实现reactive的嵌套转换',()=>{
    let origin = {
        foo:{
            a:{
                b:1
            }
        }
    }
    let observed = reactive(origin)
    expect(isReactive(observed)).toBe(true)
    expect(isReactive(observed.foo)).toBe(true)
    expect(isReactive(observed.foo.a)).toBe(true)
    expect(isReactive(observed.foo.a.b)).toBe(false)

})