import { createVnode } from "./vnode";
export function h(type,props?,children?){
    console.log('h函数参数ch',children);
    
    return createVnode(type,props,children)
}