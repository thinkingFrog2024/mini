import { isObject } from "../../share"
import { publicinstanceProxyHandlers } from "./componentPublicInstanceProxy"
import { initProps } from "./componentProps"
import { shallowReadOnly } from "../../reactivity/src/reactive"
import { emit } from './componentEmit'
import { initSlots } from "./componentSlots"
export function createComponentInstance(vnode){
    const component = {
        vnode,
        type:vnode.type,
        setupState:{},
        props:{},
        emit:(event)=>{},
        slots:{}
    }
    component.emit = emit.bind(null,component)
    return component
}



export function setupComponent(instance){
    // init
    initProps(instance,instance.vnode.props)
    initSlots(instance,instance.vnode.children)
    setupStatefulComponent(instance)
}

// 这个函数用于完善组件实例的各项数据
function setupStatefulComponent(instance){
    const component = instance.type
    // 这里proxy代理的变量应该是上下文环境变量
    instance.proxy = new Proxy({_:instance},publicinstanceProxyHandlers)

    const {setup} = component
    if(setup){
        // props是一个浅层只读
        const setupResult = setup(shallowReadOnly(instance.props),{emit:instance.emit})//setup的返回值可能是函数 也可能是对象 
        handleSetupResult(instance,setupResult)
    }
    finishComponentSetup(instance)
}

function handleSetupResult(instance,res){
    // todo:function
    if(isObject(res)){
        
        // 把setup执行结果挂载在组件实例上面
        instance.setupState = res
    }
    finishComponentSetup(instance)
}

function finishComponentSetup(instance){
    const component = instance.type
    if(component.render){
        // 给组件实例挂载render函数
        instance.render = component.render
    }
}