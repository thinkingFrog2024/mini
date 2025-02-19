import { readOnly } from "../reactive"
it('实现readOnly只读对象',()=>{
    const origin = {
        foo:1
    }
    const observed:any = readOnly(origin)
    expect(observed).not.toBe(origin)
    observed.foo = 5
    expect(observed.foo).toBe(1)
})