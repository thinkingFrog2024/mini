import { createRender } from "../runtime-core";
function append(content,container){
    container.append(content)
}

function createElement(type){
    const ele = document.createElement(type)
    
    return ele
}

// function patchProps(props,el){
//     for(let key in props){
//         const ison = (key:string)=>/^on[A-Z]/.test(key)
//         if(ison(key)){
//             const event = key.slice(2).toLowerCase()
//             el.addEventListener(event,props[key])
//         }else{
//             el.setAttribute(key,props[key])
//         }
//     }
// }

function patchProps(key,preval,nextVal,el){
    const ison = (key:string)=>/^on[A-Z]/.test(key)
        if(ison(key) && typeof nextVal === 'function'){
            const event = key.slice(2).toLowerCase()
            el.addEventListener(event,nextVal)
        }else if(nextVal === undefined||nextVal === null){
            el.removeAttribute(key)
        }else if(nextVal && !ison(key)){
            el.setAttribute(key,nextVal)
        }

}

function removeChilds(node){
    const parent = node.parentNode
    if(parent){
        parent.removeChild(node)
    }
}

function setContent(content,el){
    const node = document.createTextNode(content)
    // el.textContent = content
    el.append(node)
    
}

const render:any = createRender({
    append,
    createElement,
    patchProps,
    setContent,
    removeChilds
})

export function createApp(...args){
    return render.createApp(...args)
}

export * from '../runtime-core'