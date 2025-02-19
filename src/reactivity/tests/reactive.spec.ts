
import { reactive } from "../reactive"
it('reactive基本框架',()=>{
    const origin = {
        foo:1
    }
    const observed:any = reactive(origin)
    expect(observed).not.toBe(origin)
    expect(observed.foo).toBe(1)
})