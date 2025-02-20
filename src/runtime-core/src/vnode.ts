import { isObject } from "../../share"
import { SHAPEFLAGS } from "../../share/ShapeFlags"

export function createVnode(type,props?,children?){
if(type === 'div') {

}   
    const vnode = {
        type,
        props,
        children,
        shapeFlag:getShapeFlag(type),
        el:null
    }
    
    if(Array.isArray(children)){
        vnode.shapeFlag|=SHAPEFLAGS.array_children
    }else{
        vnode.shapeFlag|=SHAPEFLAGS.text_children
    }
    return vnode
}

function getShapeFlag(type){
    return isObject(type)
    ?SHAPEFLAGS.stateful_component
    :SHAPEFLAGS.element
}