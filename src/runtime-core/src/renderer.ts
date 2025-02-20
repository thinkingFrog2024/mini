import { isObject } from "../../share";
import { createComponentInstance,setupComponent } from "./component"


export function render(vnode,container){
    patch(vnode,container)
}

function patch(vnode,container){
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
    setupRenderEffect(instance,vnode,container)
}

function mountElement(vnode,container){

    const el =( vnode.el = document.createElement(vnode.type))
    console.log(vnode);
    
    const {children,props} = vnode
    for(let key in props){
        el.setAttribute(key,props[key])
    }
    
    if(typeof children === 'string'||typeof children === 'number'){
        el.textContent = children
    }else if(Array.isArray(children)){
        children.forEach(ele=>{
            mountElement(ele,el)
        })
    }
    container.append(el)


}

function setupRenderEffect(instance,vnode,container){
    const {proxy} = instance
    const subTree = instance.render.call(proxy)
    patch(subTree,container)
    console.log(instance.vnode);
    
    vnode.el = subTree.el
    console.log('instance.vnode.el',vnode);
    
}