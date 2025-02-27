import { NodeTypes } from "./ast";




export function generate(ast){
    console.log(ast);
    
    const context = createCodegenContext()
    const {push} = context
    getFunctionPreamble(ast,context)
    const functionName = 'render'
    const args = ['_ctx','_cache']
    const signature = args.join(',')
    push(`function ${functionName}(${signature}){`)

    getNode(ast.codegenNode,context)
    push('}')
    return context.code
}

function createCodegenContext(){
    const context = {
        code:"",
        push(str){
            context.code+=str
        }
    }
    return context
}

function getNode(node,context){
    // 处理不同的数据类型
    switch(node.type){
        case NodeTypes.TEXT:
            genText(node,context)
            break
        case NodeTypes.ELEMENT:
            genExpression(node,context)
            break
        case NodeTypes.INTERPOLATION:
            console.log(node)
            
            genInterpolation(node,context)
            break
        case NodeTypes.SYMPLE_EXPRESSION:
            genExpression(node,context)
            break
                
            
    }
    
}

function genExpression(node,context){
    const {push} = context
    // 这个应该放在transform里面进行处理
    // push('_ctx.')
    push(node.content)
}

function genText(node,context){
    const {push} = context
    push(`return ${node.content}`)
}

function genInterpolation(node,context){
    const {push} = context
    push(`_toDisplayString(`)
    console.log(node.content);
    
    getNode(node.content,context)
    push(')')
}

function getFunctionPreamble(ast,context){
    const {push} = context
    const vueBinging = 'Vue'
    const aliasHelpers = (s)=>`${s}:_${s}`
    if(ast.helpers.length>0){
        push(`const {${ast.helpers.map(aliasHelpers).join(',')} = ${vueBinging}}`)
    }
    push('\n')
    push('return    ')
}