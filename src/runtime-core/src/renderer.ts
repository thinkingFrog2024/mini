import { effect } from "../../reactivity/src/effect";
import { isObject } from "../../share";
import { SHAPEFLAGS } from "../../share/ShapeFlags";
import { createComponentInstance,setupComponent } from "./component"
import { createAppApi } from "./createApp";
import { Fragment,TextNode } from "./symbol";


// 实现自定义渲染器
export function createRender(options){
const{
    append,
    createElement,
    patchProps,
    setContent
} = options

function render(vnode,container,parent = null){
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
    // container.append(text)
    append(text,container)
    
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
    const el =( vnode.el = createElement(vnode.type))
    const {children,props} = vnode
    // for(let key in props){
    //     const ison = (key:string)=>/^on[A-Z]/.test(key)
    //     if(ison(key)){
    //         const event = key.slice(2).toLowerCase()
    //         el.addEventListener(event,props[key])
    //     }else{
    //         el.setAttribute(key,props[key])
    //     }
    // }
    patchProps(props,el)
    
    if(shapeFlag & SHAPEFLAGS.text_children){
        // el.textContent = children
        setContent(children,el)
    }else if(shapeFlag & SHAPEFLAGS.array_children){
        
        children.forEach(ele=>{
            
            patch(ele,el,parent)
        })
    }
    // container.append(el)
    append(el,container)



}

function setupRenderEffect(instance,vnode,container){
    effect(()=>{
        if(!instance.isMounted){
            console.log('初始化');
            
            const {proxy} = instance
            const subTree =( instance.subTree =  instance.render.call(proxy))
            patch(subTree,container,instance)
            vnode.el = subTree.el
            instance.isMounted = true
        }else{
            console.log('更新');
            
            const {proxy} = instance
            const subTree =( instance.subTree =  instance.render.call(proxy))
            const prevTree = instance.subTree

            // 对比逻辑
            // 更新subtree
            instance.subTree = subTree
        }
        
    })
    }
    return{
        createApp:createAppApi(render)
    }
}