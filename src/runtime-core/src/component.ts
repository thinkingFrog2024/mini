import { isObject } from "../../share"
import { publicinstanceProxyHandlers } from "./componentPublicInstanceProxy"
import { initProps } from "./componentProps"
import { shallowReadOnly } from "../../reactivity/src/reactive"
import { emit } from './componentEmit'
import { initSlots } from "./componentSlots"
import { proxyRefs } from "../../reactivity"
export function createComponentInstance(vnode,parents){
    const component = {
        vnode,
        type:vnode.type,
        setupState:{},
        props:{},
        emit:(event)=>{},
        slots:{},
        // 如果当前组件没有注入的内容 就把provides设置成父级的provides
        provides:parents?parents.provides:{},
        parents,
        isMounted:false,
        subTree:null
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
let currentInstance  = null
// 这个函数用于完善组件实例的各项数据
function setupStatefulComponent(instance){
    const component = instance.type
    // 这里proxy代理的变量应该是上下文环境变量
    instance.proxy = new Proxy({_:instance},publicinstanceProxyHandlers)

    const {setup} = component
    if(setup){
        // props是一个浅层只读
        setCurrentInstance(instance)
        const setupResult = setup(shallowReadOnly(instance.props),{emit:instance.emit})//setup的返回值可能是函数 也可能是对象 
        handleSetupResult(instance,setupResult)
    }
    finishComponentSetup(instance)
}

function handleSetupResult(instance,res){
    // todo:function
    if(isObject(res)){
        
        // 把setup执行结果挂载在组件实例上面
        instance.setupState = proxyRefs(res)
    }
    finishComponentSetup(instance)
}

function finishComponentSetup(instance){
    const component = instance.type
    if(compiler&&!component.render){
        if(component.template){
            component.render = compiler(component.template)
        }
    }
    if(component.render){
        // 给组件实例挂载render函数
        // 但是用户实际上写的不是render函数 而是一个template 但是这里不应该直接使用编译模块的函数 避免造成强耦合关系
        instance.render = component.render
    }
}


export function getCurrentInstance(){
    return currentInstance
}

function setCurrentInstance(instance){
    currentInstance = instance
}


let compiler
export function registerRuntimeCompile(_compiler){
    compiler = _compiler
}