// import { isObject } from "../../share"
// import { SHAPEFLAGS } from "../../share/ShapeFlags"

// export function createVnode(type,props?,children?){
// if(type === 'div') {

// }   
//     const vnode = {
//         type,
//         props,
//         children,
//         shapeFlag:getShapeFlag(type),
//         el:null
//     }
    
//     if(Array.isArray(children)){
//         vnode.shapeFlag|=SHAPEFLAGS.array_children
//     }else{
//         vnode.shapeFlag|=SHAPEFLAGS.text_children
//     }
//     return vnode
// }

// function getShapeFlag(type){
//     return isObject(type)
//     ?SHAPEFLAGS.stateful_component
//     :SHAPEFLAGS.element
// }

import { isObject } from "../../share";
import { SHAPEFLAGS } from "../../share/ShapeFlags";
import { TextNode } from "./symbol";
export class VNode {
    public type
    public props
    public children
    public el
    public next
    public key
    public shapeFlag
    public component
    constructor(type, props:any = null, children = null) {
        this.component = null
        this.type = type;
        this.props = props;
        this.children = children;
        this.key = props?props.key:undefined
        this.el = null; // 真实 DOM 元素
        this.shapeFlag = this.getShapeFlag(type);

        // 根据 children 的类型设置 shapeFlag
        if (Array.isArray(children)) {
            this.shapeFlag |= SHAPEFLAGS.array_children;
        } else {
            this.shapeFlag |= SHAPEFLAGS.text_children;
        }
        
        if(this.shapeFlag&SHAPEFLAGS.stateful_component&&(typeof this.children ===  'function'||isObject(children)||Array.isArray(children))){
            this.shapeFlag |= SHAPEFLAGS.slot_children
        }
    }

    getShapeFlag(type) {
        return isObject(type)
            ? SHAPEFLAGS.stateful_component
            : SHAPEFLAGS.element;
    }

}

export function createVnode(type, props:any = null, children:any = null ) {
    const vnode = new VNode(type, props, children);
    
    return vnode
}


export function createTextNode (text){
    return createVnode(TextNode,{},text)
}