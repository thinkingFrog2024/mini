export function createVnode(type,props?,children?){
    const vnode = {
        type,
        props,
        children
    }
    console.log(vnode);
    
    return vnode
}