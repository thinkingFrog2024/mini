import { NodeTypes } from "./ast";
import { CREATEELEMENTVNODE, helpMapName, TODISPLAYSTRING } from "./transforms/runtimeHelp";


// 插值生成render函数相比于字符串生成render函数多了一个导入逻辑 返回数据的时候是通过函数调用:toDisplayString(因为从代理对象里面取出的值未必是一个字符串)

export function generate(ast){
    console.log(ast);
    
    const context = createCodegenContext() //前导函数
    const {push} = context
    getFunctionPreamble(ast,context)
    const functionName = 'render' //函数名
    const args = ['_ctx','_cache'] //参数数组
    const signature = args.join(',') //数组转成string
    push(`function ${functionName}(${signature}){`) //拼接 
    push('return')
    getNode(ast.codegenNode,context) //处理不同类型的节点
    push('}')

    return {
        code:context.code
    } //返回code
}

function createCodegenContext(){
    const context = {
        code:"",
        push(str){
            context.code+=str
        },
        helper(key){
            return `_${helpMapName[key]}`
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
            genElement(node,context)
            break
        case NodeTypes.INTERPOLATION:
            console.log(node)
            
            genInterpolation(node,context)
            break
        case NodeTypes.SYMPLE_EXPRESSION:
            genExpression(node,context)
            break
        case NodeTypes.COMPOUND:
            genCompound(node,context)
            break
    }
    
}

function genCompound(node,context){
    const {children} = node
    const {push} = context
    for(let i = 0;i<children.length;i++){
        const child = children[i]
        if(typeof child === 'string'){
            push(child)
        }else{
            getNode(child,context)
        }
    }
}

function genElement(node,context){
    const {push,helper} = context
    const {tag,children} = node
    push(`${helper(CREATEELEMENTVNODE)}(${tag}),null`)
    // push(`${helper(CREATEELEMENTVNODE)}(${tag}),null,"hi," + _toDisplayString(_ctx.message)}`)
    // 处理子节点
    for(let i = 0;i<children.length;i++){
        const child = children[i]
        getNode(child,context)
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
    push(`'${node.content}'`)
}

function genInterpolation(node,context){
    const {push,helper} = context
    push(`${helper(TODISPLAYSTRING)}(`)
    console.log(node.content);
    
    getNode(node.content,context)
    push(')')
}

function getFunctionPreamble(ast,context){
    const {push} = context
    const vueBinging = 'Vue'
    // 把helpers里面的Symbol映射处理成字符串
    // 处理导入逻辑
    const aliasHelpers = (s)=>`${helpMapName[s]}:_${helpMapName[s]}`
    if(ast.helpers.length>0){
        push(`const {${ast.helpers.map(aliasHelpers).join(',')} = ${vueBinging}}`)
    }
    push('\n')
    push('return  ')
}