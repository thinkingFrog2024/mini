import { NodeTypes } from "./ast";

export function transform(root,options){
    // 遍历 修改textContent
    console.log(options);
    
    const context = createTransformContext(root,options)

    tranverseNode(root,context)
    createRootcodegen(root)
    root.helpers = [...context.helpers.keys()]
}

function createRootcodegen(root){
    root.codegenNode = root.children[0]
}

function tranverseNode(node,context){
    console.log(node);
    const nodeTransform = context.options.nodeTransforms
    if(nodeTransform){
        for(let i = 0;i<nodeTransform.length;i++){
            nodeTransform[i](node)
        }
    }

    const {children,type} = node

    switch(type){
        case NodeTypes.INTERPOLATION:
            context.helper("toDisplayString")
            break
        case NodeTypes.ELEMENT:
        case NodeTypes.ROOT:
            tranverseChildren(children,context)
            
        default:
            break
    }

}  

function tranverseChildren(children,context){
    for(let i = 0;i<children.length;i++){
        const node = children[i]
        tranverseNode(node,context)
    }
}


function createTransformContext(root,options){
    const context = {
        root,
        options,
        helper(key){
            context.helpers.set(key,1)
        },
        helpers:new Map
    }
    return context
}

