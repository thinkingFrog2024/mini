import { effect } from "../../reactivity/src/effect";
import { isObject } from "../../share";
import { SHAPEFLAGS } from "../../share/ShapeFlags";
import { createComponentInstance,setupComponent } from "./component"
import { createAppApi } from "./createApp";
import { Fragment,TextNode } from "./symbol";

// el:吧真实节点挂载在虚拟节点上面 如果在数组里面的文本虚拟节点也要记录el 就要把createVnode（textNode）函数返回的vnode上面的el绑定上真实节点

// 实现自定义渲染器
export function createRender(options){
const{
    append,
    createElement,
    patchProps,
    setContent,
    removeChilds
} = options

function render(vnode,container,parent = null){
    patch(null,vnode,container,parent)
}


// n1=>old
// n2->new
function patch(n1,n2,container,parent){
    // 当类型为组件 vnode.type是一个对象 当类型为element 是一个string
    const {shapeFlag,type} = n2
    switch(type){
        case Fragment:
            processFragment(n1,n2,container,parent)
            break
        case TextNode:
            processTextNode(n1,n2,container)
            break
        default:
            if(shapeFlag&SHAPEFLAGS.element){
                processElememt(n1,n2,container,parent)
            }else if(shapeFlag&SHAPEFLAGS.stateful_component){
                processComponent(n1,n2,container,parent)
            }
    }
}

function processFragment(n1,n2,container,parent){
    const children = n2.children
    children.forEach(ele=>{
        patch(null,ele,container,parent)
    })
}


function processTextNode(n1,n2,container){
    const text = document.createTextNode(n2.children)
    // n2=>new n1=>old
    n2.el = text
    // container.append(text)
    append(text,container)
    
}

function processComponent(n1,n2,container,parent){
    // 初始化
    mountComponent(n2,container,parent)
}

function processElememt(n1,n2,container,parent){
    if(n1){
        console.log('更新element');
        patchElement(n1,n2,container)
    }else{
        console.log('初始化ele');
        mountElement(n2,container,parent)
    }
}

function patchElement(n1,n2,container){
    // 更新props
    const oldProps = n1.props||{}
    const newProps = n2.props||{}
    const el = (n2.el = n1.el) 
    // 遍历新props的key 和旧的对比 如果不一样 可能是发生了修改或者添加
    // new old==>setAttr//修改
    // undefined old==>//删除
    // val undefied==>set//添加
    // 遍历旧的 如果不一样 可能是发生了删除
    // old undefied==>remove//删除

    // 添加了新的事件 只能添加 不能删除
    updateElementProps(newProps,oldProps,el)
    
    updateElementChildren(n1,n2,container)
}

function updateElementProps(newProps,oldProps,el){
    if(!(oldProps!=newProps)){
        for(let key in newProps){
            if(newProps[key]!=oldProps[key]){
                patchProps(key,oldProps[key],newProps[key],el)
            }
        }
        for(let key in oldProps){
            if(!(key in newProps)){
                patchProps(key,oldProps[key],null,el)
            }
        }
    }
}

function updateElementChildren(n1,n2,container){
    const {shapeFlag} = n1
    const newFlag = n2.shapeFlag
    // array=>text
    if(newFlag&SHAPEFLAGS.text_children){
        if(shapeFlag&SHAPEFLAGS.array_children){
            // 移除所有子节点 再设置文本内容 这个移除节点也应该是一个稳定的接口
            unMountedChildren(n1)
            setContent(n2.children,container)
        }
    }
    // text=>array
    
}

function unMountedChildren(node){
    const {children} = node
    if(children){
        children.forEach(c => {
            console.log('c?.el',c.el);
            removeChilds(c.el)
        });
    }
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
    for(let key in props){
        patchProps(key,null,props[key],el)    
    }
    
    if(shapeFlag & SHAPEFLAGS.text_children){
        // el.textContent = children
        setContent(children,el)
    }else if(shapeFlag & SHAPEFLAGS.array_children){
        
        children.forEach(ele=>{
            
            patch(null,ele,el,parent)
        })
    }
    // container.append(el)
    append(el,container)



}

function setupRenderEffect(instance,vnode,container){
    effect(()=>{
        console.log('instance.isMounted',instance.isMounted);
        
        if(!instance.isMounted){
            console.log('初始化');
            
            const {proxy} = instance
            const subTree =( instance.subTree =  instance.render.call(proxy))
            patch(null,subTree,container,instance)
            vnode.el = subTree.el
            instance.isMounted = true
        }else{
            console.log('更新');
            const {proxy} = instance
            const subTree  =  instance.render.call(proxy)
            const prevTree = instance.subTree
            patch(prevTree,subTree,container,parent)
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