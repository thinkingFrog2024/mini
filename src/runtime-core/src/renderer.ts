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
        console.log('处理组件');
        
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
    console.log('组件实例',instance);
    
    // 组件完成setup开始render 渲染视图
    setupRenderEffect(instance,container)
}

function mountElement(vnode,container){
    const el = document.createElement(vnode.type)
    const {children,props} = vnode
    for(let key in props){
        el.setAttribute(key,props[key])
    }
    
    if(typeof children === 'string'){
        el.textContent = children
    }else if(Array.isArray(children)){
        children.forEach(ele=>{
            mountElement(ele,el)
        })
    }
    container.append(el)


}

function setupRenderEffect(instance,container){
    const subTree = instance.render()
    console.log('sub',instance.render);
    
    patch(subTree,container)
}