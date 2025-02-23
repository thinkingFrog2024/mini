import { createRender } from "../runtime-core";
function append(content,container){
    container.append(content)
}

function createElement(type){
    const ele = document.createElement(type)
    
    return ele
}

function patchProps(props,el){
    for(let key in props){
        const ison = (key:string)=>/^on[A-Z]/.test(key)
        if(ison(key)){
            const event = key.slice(2).toLowerCase()
            el.addEventListener(event,props[key])
        }else{
            el.setAttribute(key,props[key])
        }
    }
}

function setContent(content,el){
    el.textContent = content
}

const render:any = createRender({
    append,
    createElement,
    patchProps,
    setContent
})

export function createApp(...args){
    return render.createApp(...args)
}

export * from '../runtime-core'