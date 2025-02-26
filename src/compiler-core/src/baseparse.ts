import { NodeTypes } from "./ast"

export function baseParse(content:string){
    const context = createParserContext(content)

    return createRoot(parseChildren(context))
}

function parseChildren(context){
    const nodes:Array<any>= []
    let node
    if(context.source.startsWith("{{")){
        node = parseInterpolation(context)
    }
    nodes.push(node)
    return nodes
}

function parseInterpolation(context){

// {{message}}=>message
    const openDelemeter = "{{"
    const closeDelimeter = "}}"


    const closeIndex = context.source.indexOf(closeDelimeter,openDelemeter.length)
    adviceBy(context,(openDelemeter.length))
    
    const rawContentLength = closeIndex - openDelemeter.length
    const rawcontent = context.source.slice(0,rawContentLength)
    // 删除已经处理的部分
    adviceBy(context,(rawContentLength+closeDelimeter.length))
    const content = rawcontent.trim()
    return {
        type:NodeTypes.INTERPOLATION,
        content:{
            type:NodeTypes.SYMPLE_EXPRESSION,
            content:content
        }
    }
}

function createRoot(child){
    return {
        children:child
    }
}

function adviceBy(context:any,length:number){
    context.source = context.source.slice(length)
}

function createParserContext(content){
    return{
        source:content
    }
}