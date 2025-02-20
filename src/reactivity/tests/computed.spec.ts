import { reactive } from "../src/reactive"
import { computed } from "../src/computed"
it('测试computed',()=>{
    const user = reactive({
        age:1
    })
    const fn = jest.fn(()=>{
        return user.age
    })
    const age = computed(fn)
    expect(fn).not.toHaveBeenCalled()
    let a = age.value
    expect(a).toBe(1)
    let b = age.value
    expect(fn).toHaveBeenCalledTimes(1)
    user.age = 2
    expect(fn).toHaveBeenCalledTimes(1)
    b = age.value
    expect(fn).toHaveBeenCalledTimes(2)
    expect(b).toBe(2)
})