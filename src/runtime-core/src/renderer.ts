import { createComponentInstance,setupComponent } from "./component"
export function render(vnode,container){
    patch(vnode,container)
}

function patch(vnode,container){
    processComponent(vnode,container)
}


function processComponent(vnode,container){
    mountComponent(vnode,container)
}

function mountComponent(vnode,container){
    const instance = createComponentInstance(vnode)
    setupComponent(instance)
    // 组件完成setup开始render 渲染视图
    setupRenderEffect(instance,container)
}

function setupRenderEffect(instance,container){
    const subTree = instance.render()
    patch(subTree,container)
}