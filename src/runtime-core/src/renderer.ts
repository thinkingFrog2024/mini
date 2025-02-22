import { isObject } from "../../share";
import { SHAPEFLAGS } from "../../share/ShapeFlags";
import { createComponentInstance,setupComponent } from "./component"
import { Fragment,TextNode } from "./symbol";

export function render(vnode,container,parent = null){
    patch(vnode,container,parent)
}

function patch(vnode,container,parent){
    // 当类型为组件 vnode.type是一个对象 当类型为element 是一个string
    const {shapeFlag,type} = vnode
    switch(type){
        case Fragment:
            processFragment(vnode,container,parent)
            break
        case TextNode:
            processTextNode(vnode,container)
            break
        default:
            if(shapeFlag&SHAPEFLAGS.element){
                processElememt(vnode,container,parent)
            }else if(shapeFlag&SHAPEFLAGS.stateful_component){
                processComponent(vnode,container,parent)
            }
    }
}

function processFragment(vnode,container,parent){
    const children = vnode.children
    children.forEach(ele=>{
        patch(ele,container,parent)
    })
}


function processTextNode(vnode,container){
    const text = document.createTextNode(vnode.children)
    container.append(text)
}

function processComponent(vnode,container,parent){
    // 初始化
    mountComponent(vnode,container,parent)
}

function processElememt(vnode,container,parent){
    // 更新
    mountElement(vnode,container,parent)
}

function mountComponent(vnode,container,parent){
    const instance = createComponentInstance(vnode,parent)
    setupComponent(instance)
    // 组件完成setup开始render 渲染视图
    setupRenderEffect(instance,vnode,container)
}

function mountElement(vnode,container,parent){
    const {shapeFlag} = vnode
    const el =( vnode.el = document.createElement(vnode.type))
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
        console.log('children',children,vnode);
        
        children.forEach(ele=>{
            
            patch(ele,el,parent)
        })
    }
    container.append(el)


}

function setupRenderEffect(instance,vnode,container){
    const {proxy} = instance
    const subTree = instance.render.call(proxy)
    patch(subTree,container,instance)
    vnode.el = subTree.el
    
}