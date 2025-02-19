import { reactive, readOnly,isReadOnly,isReactive } from "../src/reactive"
import { ReactiveFlags } from "../src/reactiveFlags"
it('实现readOnly只读对象',()=>{
    const origin = {
        foo:1
    }
    const observed:any = readOnly(origin)
    expect(observed).not.toBe(origin)
    observed.foo = 5
    expect(observed.foo).toBe(1)
})
it('实现isreadOnly isReactive',()=>{
    const origin = {
        foo:1
    }
    const observed:any = readOnly(origin)
    const reactiveObserved = reactive(origin)
    expect(observed[ReactiveFlags.IS_REACTIVE]).toBe(false)
    expect(observed[ReactiveFlags.IS_READONLY]).toBe(true)
    expect(reactiveObserved[ReactiveFlags.IS_REACTIVE]).toBe(true)
    expect(reactiveObserved[ReactiveFlags.IS_READONLY]).toBe(false)
    expect(isReadOnly(observed)).toBe(true)
    expect(isReactive(observed)).toBe(false)
    expect(isReadOnly(reactiveObserved)).toBe(false)
    expect(isReactive(reactiveObserved)).toBe(true)
})