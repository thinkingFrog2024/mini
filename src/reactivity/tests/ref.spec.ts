import { effect } from "../src/effect"
import { isRef, proxyRefs, ref, unRef } from "../src/ref"
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

it("测试isRef unRef",()=>{
    let a  = ref(1)
    let b = 1
    let u ={
        d:1
    }
    let c = ref(u)
    let m = {
        s:1
    }
    expect(isRef(a)).toBe(true)
    expect(isRef(c)).toBe(true)
    expect(isRef(m)).toBe(false)
    expect(isRef(b)).toBe(false)
    expect(unRef(a)).toBe(1)
    expect(unRef(b)).toBe(1)
})

it('测试proxyRef省略.value功能',()=>{
    let obj = {
        a:ref(1),
        c:2
    }
    const p =proxyRefs(obj)
    expect(p.a).toBe(1)
    p.a = ref(3)
    expect(p.a).toBe(3)
    p.a = 4
    expect(p.a).toBe(4)
    p.c = ref(5)
    expect(p.c).toBe(5)
})
