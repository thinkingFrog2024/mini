import { createRender } from "../runtime-core";
function append(content,container,anchor){
    // console.log('con',container,content);
    
    // container.append(content)
    // 这个api可以指定插入的位置 如果锚点为空则在最后插入
    console.log(anchor,'an',container);
    
    container.insertBefore(content,anchor || null)
}

function createElement(type){
    const ele = document.createElement(type)
    return ele
}



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
    console.log(';kkkkkkkkkkkkk',content);
    
    el.textContent = content
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

