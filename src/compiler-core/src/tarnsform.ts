import { NodeTypes } from "./ast";
import { TODISPLAYSTRING } from "./transforms/runtimeHelp";

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
            nodeTransform[i](node,context)
        }
    }

    const {children,type} = node

    switch(type){
        case NodeTypes.INTERPOLATION:
            context.helper(TODISPLAYSTRING)
            break
        case NodeTypes.ELEMENT:
        case NodeTypes.ROOT:
        case NodeTypes.COMPOUND:
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
        
        // helper函数接收一个字符串 并且把这个字符串保存在helpers属性里面
        // 这里的处理是接收一个Symbol 把symbol添加到数组里面 
        // 这个是基于类型的处理 应该放在trandform里面
        helper(key){
            context.helpers.set(key,1)
        },
        helpers:new Map
    }
    return context
}

