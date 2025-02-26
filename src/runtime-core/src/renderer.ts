import { effect } from "../../reactivity/src/effect";
import { isObject } from "../../share";
import { SHAPEFLAGS } from "../../share/ShapeFlags";
import { createComponentInstance,setupComponent } from "./component"
import { createAppApi } from "./createApp";
import { Fragment,TextNode } from "./symbol";

// el:吧真实节点挂载在虚拟节点上面 如果在数组里面的文本虚拟节点也要记录el 就要把createVnode（textNode）函数返回的vnode上面的el绑定上真实节点

// 实现自定义渲染器
export function createRender(options){
const{
    append,
    createElement,
    patchProps,
    setContent,
    removeChilds
} = options

function render(vnode,container,parent = null){
    patch(null,vnode,container,parent,null)
}


// n1=>old
// n2->new
function patch(n1,n2,container,parent,anchor){
    // 当类型为组件 vnode.type是一个对象 当类型为element 是一个string
    const {shapeFlag,type} = n2
    switch(type){
        case Fragment:
            processFragment(n1,n2,container,parent,anchor)
            break
        case TextNode:
            processTextNode(n1,n2,container)
            break
        default:
            if(shapeFlag&SHAPEFLAGS.element){
                processElememt(n1,n2,container,parent,anchor)
            }else if(shapeFlag&SHAPEFLAGS.stateful_component){
                processComponent(n1,n2,container,parent)
            }
    }
}

function processFragment(n1,n2,container,parent,anchor){
    const children = n2.children
    children.forEach(ele=>{
        patch(null,ele,container,parent,anchor)
    })
}


function processTextNode(n1,n2,container){
    const text = document.createTextNode(n2.children)
    // n2=>new n1=>old
    n2.el = text
    // container.append(text)
    append(text,container)
    
}

function processComponent(n1,n2,container,parent){
    // 初始化
    mountComponent(n2,container,parent)
}

function processElememt(n1,n2,container,parent,anchor){
    if(n1){
        console.log('更新element');
        patchElement(n1,n2,container,parent,anchor)
    }else{
        console.log('初始化ele');
        mountElement(n2,container,parent,anchor)
    }
}

function patchElement(n1,n2,container,parent,anchor){
    // 更新props
    const oldProps = n1.props||{}
    const newProps = n2.props||{}
    const el = (n2.el = n1.el) 
    // 遍历新props的key 和旧的对比 如果不一样 可能是发生了修改或者添加
    // new old==>setAttr//修改
    // undefined old==>//删除
    // val undefied==>set//添加
    // 遍历旧的 如果不一样 可能是发生了删除
    // old undefied==>remove//删除

    // 添加了新的事件 只能添加 不能删除
    updateElementProps(newProps,oldProps,el)
    updateElementChildren(n1,n2,container,parent,anchor)
}

function updateElementProps(newProps,oldProps,el){
    if(!(oldProps!=newProps)){
        for(let key in newProps){
            if(newProps[key]!=oldProps[key]){
                patchProps(key,oldProps[key],newProps[key],el)
            }
        }
        for(let key in oldProps){
            if(!(key in newProps)){
                patchProps(key,oldProps[key],null,el)
            }
        }
    }
}

function updateElementChildren(n1,n2,container,parent,anchor){
    const {shapeFlag} = n1
    const newFlag = n2.shapeFlag
    const c1 = n1.children
    console.log('c2',n2);
    
    const c2 = n2.children
    const el = n1.el
    console.log('el',el);
    console.log('nel',n2.el);
    
    
    // array=>text
    // text=>text
    if(newFlag&SHAPEFLAGS.text_children){
        if(shapeFlag&SHAPEFLAGS.array_children){
            console.log('1111111');
            
            // 移除所有子节点 再设置文本内容 这个移除节点也应该是一个稳定的接口
            unMountedChildren(n1)
            // n1是一个虚拟节点 这个节点上面的children属性挂载了所有的虚拟子节点
            // 虚拟子节点上面挂载了真实子节点
        }
        if(c1!=c2){
            console.log('22222222');
            
            console.log('文本更新',c2.children);
            setContent(c2,container)
        }
    }else{
        if(shapeFlag&SHAPEFLAGS.array_children){
            console.log(3333333);
            // 暴力
            // unMountedChildren(n1)
            // mountChildren(c2,el,parent)
            console.log('调用更新元素',el);
            
            patchKeyedChildren(c1,c2,el,parent,anchor)

        }else{
            console.log(container,el);
            setContent(null,container)
            mountChildren(c2,container,parent,anchor)
        }
    }

}


function patchKeyedChildren(c1,c2,container,parent,parentAnchor){
    // i指针指向两个数组的第一个节点
    // e1指向c1的最后一个节点
    // e2指向c2的最后一个节点
    const l2 = c2.length
    let e1 = c1.length-1
    let e2 = l2-1
    let i = 0
    let moved = false
    let MaxIndexSoFAr = -1
    // 左边循环
    while(i<=e1&&i<=e2){
        // 对比两个节点是否一样
        const n1  = c1[i],n2 = c2[i]
        if(isSameVnode(n1,n2)){
            // 继续递归对比props等属性
            patch(n1,n2,container,parent,parentAnchor)
        }else{
            // 发现两个节点不一样 退出循环q
            break
        }
        i++
    }
    
    // 右侧对比 移动e1 e2
    while(i<=e1&&i<=e2){
        const n1 = c1[e1], n2 = c2[e2]
        if(isSameVnode(n1,n2)){
            // 继续递归对比props等属性
            patch(n1,n2,container,parent,parentAnchor)
        }else{
            // 发现两个节点不一样 退出循环q
            break
        }
        e1--
        e2--
    }
    // 左侧循环找到从左边开始第一个不同的节点 右侧循环找到从右边开始第一个不同的节点
    // 最后得到的i是左边第一个元素的下标 e1 e2是右边第一个不同的元素的下标
    // 当c2的长度比c1常 需要添加新的元素 此时i将会大于e1 小于e2
    // c2比c1长有两种场景：c2前面添加了元素 c2后面添加了元素
    // 添加在后面的时候  i = c1.length e1 = c1.length-1 e2 = c2.length-1
    // 添加在前面的时候 i= 0 e1 = -1 e2是某个正数（这是添加在最前面的情况）
    // 这两种情况都满足判断条件 但是在添加在后面的时候可以直接append 添加在前面的时候需要知道具体位置
     
    // 


    if(i>e1&&i<=e2){
        // 计算需要插入的元素的后面一个元素的位置 把找到的元素提供给append函数
        const nextPos = e2+1
        // 如果找到的位置大于等于数组长度 那么就是超出了 这种情况应该是要添加的元素位于数组的末端
        const anchor = nextPos<l2?c2[nextPos].el:null
        while(i<=e2){
            patch(null,c2[i],container,parent,anchor)
            i++
        }
    }else if(i<=e1&&i>e2){
        // 删除元素
        removeChilds(c1[i].el)
    }else{
        // debugger
        console.log('中间对比');
        
        // 中间对比
        const keytoindex = new Map()
        let s1 = i
        let s2 = i
        const toBePatched = e2-s1+1 //1
        let patched = 0
        const newIndexToOldIndexMAp = new Array(toBePatched)
        for(let i = 0;i<toBePatched;i++){
            newIndexToOldIndexMAp[i] = 0//此处的0代表没有记录
        }
        // 映射
        for(let i = s1;i<=e2;i++){
            const next = c2[i]
            keytoindex.set(next.key,i)
        }
        // 遍历旧的节点  
        for(let i = s1;i<=e1;i++){
            const prev = c1[i]
            let newIndex
            if(patched>toBePatched){
                removeChilds(prev[i])
                continue
            }
            // 用户可能没有设置key
            if(prev.key){
                newIndex =  keytoindex.get(prev.key)
            }else{
                // 如果没有key 遍历比较是否相等 这会导致时间复杂度上升
                for(let j = s1;j<=e2;j++){
                    if(isSameVnode(prev,c2[j])){
                        newIndex = j
                        break
                    }
                }
            }

            // 遍历完成之后如果index等于undefined的话 证明这个节点在新节点里面不存在 应该删除
            if(!newIndex){
                removeChilds(prev.el)
            }else{
                if(newIndex>MaxIndexSoFAr){
                    MaxIndexSoFAr = newIndex
                }else{
                    moved = true
                }

                // 这里是更新逻辑 比较新旧节点 不需要锚点
                // 逻辑走到这里确定某个节点在新的节点里面存在了 记录新旧节点位置映射也应该在这里记录
                patch(prev,c2[newIndex],container,parent,null)
                newIndexToOldIndexMAp[newIndex-s2] = i+1//因为0具有特殊意义 所以这里的i要确定不等于0
                patched++
            }
            // 优化点：如果新的节点里面的所有节点都被对比过了 但是老节点里面还有元素没有经过对比 那么应该删除
            // 处理交换位置：最长递增子序列算法：找到一条最长的排列稳定的节点 在这个序列里面的节点不移动
            // 以此减少移动次数
            const increasingSequence = moved?getSequence(newIndexToOldIndexMAp):[]
            // 移动位置的时候需要把元素插在某个锚点之前 这就需要锚点必须是一个稳定的元素
            // 为了确保这个元素 需要逆序进行遍历
            // 这个for循环i走的是新旧映射 j走的是最长序列 
            // 新旧映射里面的元素如果属于最长序列 那么不移动
            let j = increasingSequence.length-1
            for(let i = toBePatched-1;i>=0;i--){
                const nextIndex = i+s2//i = e2-s2=>nextIndex = e2
                const nextChild = c2[nextIndex]
                const anchor = nextIndex+1<l2?c2[nextIndex+1].el:null
                console.log('anchor',anchor);
                
                // 旧的125436
                // 新的312465
                // 映射：401352：newIndextoOldIndexMAp 记录了新旧数组序列号的映射关系  
                // 由于这个映射关系里面的0代表不存在 所以初始化的时候需要加一
                // 最长：0135 inscreasingSequence 也就是旧数组里面这些序列号的元素不需要移动
                // 最少需要移动两次：移动3 5
                if(newIndexToOldIndexMAp[i] === 0){
                    patch(null,nextChild,container,parent,anchor)
                }else if(moved){
                    if(i!=increasingSequence[j]){
                        // 移动位置
                        // 0 1 2 3 4 5 6
                        //  0 1 s2 = 1
                        //  2 3 4//3 i =2
                        // 5 6
                        
                        append(nextChild,container,anchor)
                    }else{ 
                        j--
                    }
                }
            }
        }


    }
}
function isSameVnode(v1,v2){
    return v1.type == v2.type&&v1.key == v2.key
}


function unMountedChildren(node){
    const {children} = node
    if(children){
        children.forEach(c => {
            removeChilds(c.el)
        });
    }
}



function mountComponent(vnode,container,parent){
    const instance = createComponentInstance(vnode,parent)
    setupComponent(instance)
    // 组件完成setup开始render 渲染视图
    setupRenderEffect(instance,vnode,container)
}

function mountElement(vnode,container,parent,anchor){
    const {shapeFlag} = vnode
    const el =( vnode.el = createElement(vnode.type))
    const {children,props} = vnode
    for(let key in props){
        patchProps(key,null,props[key],el)    
    }
    
    if(shapeFlag & SHAPEFLAGS.text_children){
        // el.textContent = children
        setContent(children,el)
    }else if(shapeFlag & SHAPEFLAGS.array_children){
        mountChildren(children,el,parent,anchor)
    }
    // container.append(el)
    append(el,container,anchor)
}

function mountChildren(children,el,parent,anchor){
    children.forEach(ele=>{
        // el就是container
        patch(null,ele,el,parent,anchor)
    })
}

function setupRenderEffect(instance,vnode,container){
    effect(()=>{
        console.log('instance.isMounted',instance.isMounted);
        
        if(!instance.isMounted){
            console.log('初始化');
            
            const {proxy} = instance
            const subTree =( instance.subTree =  instance.render.call(proxy))
            patch(null,subTree,container,instance,null)
            vnode.el = subTree.el
            instance.isMounted = true
        }else{
            console.log('更新');
            const {proxy} = instance
            const subTree  =  instance.render.call(proxy)
            const prevTree = instance.subTree
            patch(prevTree,subTree,container,parent,null)
            // 对比逻辑
            // 更新subtree
            instance.subTree = subTree

        }
        
    })
    }
    return{
        createApp:createAppApi(render)
    }
}

function getSequence(arr: number[]): number[] {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
        j = result[result.length - 1];
        if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
            u = c + 1;
        } else {
            v = c;
        }
        }
        if (arrI < arr[result[u]]) {
        if (u > 0) {
            p[i] = result[u - 1];
        }
        result[u] = i;
        }
    }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
    result[u] = v;
    v = p[v];
    }
    return result;
}
