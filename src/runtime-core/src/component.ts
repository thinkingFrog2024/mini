import { isObject } from "../../share"
export function createComponentInstance(vnode){
    const component = {
        vnode,
        type:vnode.type
    }
    return component
}



export function setupComponent(instance){
    // init
    setupStatefulComponent(instance)
}


function setupStatefulComponent(instance){
    const component = instance.type
    const {setup} = component
    if(setup){
        const setupResult = setup()//setup的返回值可能是函数 也可能是对象 
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
}

function finishComponentSetup(instance){
    const component = instance.type
    if(component.render){
        // 给组件实例挂载render函数
        instance.render = component.render
    }
}