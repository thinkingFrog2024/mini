import { readOnly,reactive,shallowReadOnly } from "../src/reactive";
it('测试这几个代理的缓存功能',()=>{
    const origin = {
        a:1
    }
    const a = reactive(origin)
    const a1 = reactive(origin)
    const b = readOnly(origin)
    const b1 = readOnly(origin)
    const c = shallowReadOnly(origin)
    const c1 = shallowReadOnly(origin)
    expect(a === a1).toBe(true)
    expect(b === b1).toBe(true)
    expect(c === c1).toBe(true)
})