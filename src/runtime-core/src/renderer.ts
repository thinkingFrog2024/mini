import { isObject } from "../../share";
import { SHAPEFLAGS } from "../../share/ShapeFlags";
import { createComponentInstance,setupComponent } from "./component"


export function render(vnode,container){
    patch(vnode,container)
}

function patch(vnode,container){
    // 当类型为组件 vnode.type是一个对象 当类型为element 是一个string
    const {shapeFlag} = vnode
    if(shapeFlag&SHAPEFLAGS.element){
        processElememt(vnode,container)
    }else if(shapeFlag&SHAPEFLAGS.stateful_component){
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
    const {shapeFlag} = vnode
    const el =( vnode.el = document.createElement(vnode.type))
    console.log(vnode);
    
    const {children,props} = vnode
    for(let key in props){
        const ison = (key:string)=>/^on[A-Z]/.test(key)
        if(ison(key)){
            const event = key.slice(2).toLowerCase()
            el.addEventListener(event,props[key])
        }else{
            el.setAttribute(key,props[key])
        }
    }
    
    if(shapeFlag & SHAPEFLAGS.text_children){
        el.textContent = children
    }else if(shapeFlag & SHAPEFLAGS.array_children){
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