import { NodeTypes } from "../ast";

export function transformText(node){
    if(node.type == NodeTypes.ELEMENT){
        // 遍历元素类型的子节点 并且判断子节点的类型
        const {children} = node
        let Container
        for(let i = 0;i<children.length;i++){
            const child = children[i]
            
            if(isText(children[i])){
                // 遍历这个节点以后的节点 判断是不是text 如果相邻的节点也是text 那么就可以初始化一个容器
                // 这个容器实际上也是一个节点 把后面的所有text类型的节点都添加到这个节点的children里面
                // 并且把添加的节点从原来的children里面删掉
                for(let j = i+1;j<children.length;j++){
                    const next = children[j]
                    if(isText(next)){
                        // 初始化容器 并且把children[i]赋值成这个容器
                        if(!Container){
                            Container = children[i] = {
                                type:NodeTypes.COMPOUND,
                                children:[child]
                            }
                        }
                        // 添加加号 方便拼接
                        Container.children.push('+')
                        // 向容器添加节点
                        Container.children.push(next)
                        // 删除children里面的节点
                        children.splice(j,1)
                        
                        // 由于数组里面进行删除 元素减少了 j需要减一
                        j--
                    }else{
                        // 如果下一个元素不是text bane就应该重置容器 离开当前的循环
                        Container.children.push(',')
                        Container = null
                        break
                    }
                }
            }
        }
    }
}

function isText(node){
    return node.type ===NodeTypes.TEXT||node.type === NodeTypes.INTERPOLATION
}