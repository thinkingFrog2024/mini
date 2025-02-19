import { effect } from "../src/effect"
import { ref } from "../src/ref"
it('测试ref基本功能',()=>{
    let a = ref(1)
    expect(a.value).toBe(1)
    let b = 1
    let fn = ()=>{
        b++
        const c = a.value
    }
    effect(fn)
    expect(b).toBe(2)
    a.value = 2
    expect(a.value).toBe(2)
    expect(b).toBe(3)
    a.value = 2
    expect(a.value).toBe(2)
    expect(b).toBe(3)
})

it('ref接收对象作为参数',()=>{
    let a = ref({
        b:1
    })
    let num
    let times = 0
    expect(a.value.b).toBe(1)
    let fn = ()=>{
        times++
        num = a.value.b
    }
    effect(fn)
    expect(num).toBe(1)
    a.value.b = 12
    expect(num).toBe(12)
    a.value.b = 12
    expect(times).toBe(2)
    a.value = {
        b:1
    }
    expect(times).toBe(3)
    expect(num).toBe(1)
})
