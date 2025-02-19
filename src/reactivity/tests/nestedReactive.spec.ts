import { isReactive, isReadOnly, reactive, readOnly } from "../src/reactive"

it('实现reactive的嵌套转换',()=>{
    let origin = {
        foo:{
            a:{
                b:1
            }
        }
    }
    let observed = reactive(origin)
    let robserved = readOnly(origin)

    expect(isReactive(observed)).toBe(true)
    expect(isReactive(observed.foo)).toBe(true)
    expect(isReactive(observed.foo.a)).toBe(true)
    expect(isReactive(observed.foo.a.b)).toBe(false)
    expect(isReadOnly(robserved)).toBe(true)
    expect(isReadOnly(robserved.foo)).toBe(true)
    expect(isReadOnly(robserved.foo.a)).toBe(true)
    expect(isReadOnly(robserved.foo.a.b)).toBe(false)

})