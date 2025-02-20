import { isObject } from "../../share";
import { createComponentInstance,setupComponent } from "./component"


export function render(vnode,container){
    patch(vnode,container)
}

function patch(vnode,container){
    console.log(vnode);
    // 当类型为组件 vnode.type是一个对象 当类型为element 是一个string
    if(typeof vnode.type === 'string'){
        processElememt(vnode,container)
    }else if(isObject(vnode.type)){
        processComponent(vnode,container)
    }
}


function processComponent(vnode,container){
    // 初始化
    mountComponent(vnode,container)
}

function processElememt(vnode,container){
    // 更新
    mountElement(vnode,container)
}

function mountComponent(vnode,container){
    const instance = createComponentInstance(vnode)
    setupComponent(instance)
    // 组件完成setup开始render 渲染视图
    setupRenderEffect(instance,container)
}

function mountElement(vnode,container){
    const el = document.createElement(vnode.type)
    const {children,props} = vnode
    // 
    for(let key in props){
        el.setAttribute(key,props[key])
    }
    // 
    el.textContent = children
    container.append(children)


}

function setupRenderEffect(instance,container){
    const subTree = instance.render()
    console.log('sub',instance.render);
    
    patch(subTree,container)
}