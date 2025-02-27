import { NodeTypes } from "./ast"

const enum TagType{
    Start,
    End
}

export function baseParse(content:string){
    const context = createParserContext(content)

    return createRoot(parseChildren(context))
}

function parseChildren(context){
    const nodes:Array<any>= []
    let node
    const s = context.source
    if(s.startsWith("{{")){
        node = parseInterpolation(context)
    }else if(s[0]=='<'){
        // 判断是不是元素类型
        if(/[a-z]/i.test(s[1])){
            node = pareseElement(context)
        }
    }

    // 如果既不是element类型 也不是插值类型 就当作Text类型处理
    if(!node){
        node = parseText(context)
    }
    nodes.push(node)
    return nodes
}

function parseText(context){
    const content = parseTextData(context,context.source.length)
    adviceBy(context,content.length)
    return{
        type:NodeTypes.TEXT,
        content:content
    }

}


function parseTextData(context,length){
    return context.source.slice(0,length)
}

function pareseElement(context){
    // 解析tag
    // 删除处理完成的代码
    // 这个正则表达式括号里面是捕获内容
    // 返回的数组里面的第一个元素是整个匹配到的内容 在这里是<div
    // 之后的内容是捕获组捕获到的内容 也就是div

    // 处理<div>
    const element = parseTag(context,TagType.Start)
    // 处理</div>
    parseTag(context,TagType.End)

    return element
}

function parseTag(context,type){
    const match:any = /^<\/?([a-z]*)/i.exec(context.source)
    console.log(context.source)
    const tag = match[1]
    adviceBy(context,match[0].length)
    adviceBy(context,1)
    if(type === TagType.Start){
        return {
            type:NodeTypes.ELEMENT,
            tag:tag
        }
    }
}

function parseInterpolation(context){

// {{message}}=>message
    const openDelemeter = "{{"
    const closeDelimeter = "}}"


    const closeIndex = context.source.indexOf(closeDelimeter,openDelemeter.length)
    adviceBy(context,(openDelemeter.length))
    
    const rawContentLength = closeIndex - openDelemeter.length
    const rawcontent = parseTextData(context,rawContentLength)
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