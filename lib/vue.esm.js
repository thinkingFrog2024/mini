function isObject(val) {
    return Object.prototype.toString.call(val) === '[object Object]';
}

const Fragment = Symbol("Fragment");
const TextNode = Symbol('TextNode');

// import { isObject } from "../../share"
// import { SHAPEFLAGS } from "../../share/ShapeFlags"
// export function createVnode(type,props?,children?){
// if(type === 'div') {
// }   
//     const vnode = {
//         type,
//         props,
//         children,
//         shapeFlag:getShapeFlag(type),
//         el:null
//     }
//     if(Array.isArray(children)){
//         vnode.shapeFlag|=SHAPEFLAGS.array_children
//     }else{
//         vnode.shapeFlag|=SHAPEFLAGS.text_children
//     }
//     return vnode
// }
// function getShapeFlag(type){
//     return isObject(type)
//     ?SHAPEFLAGS.stateful_component
//     :SHAPEFLAGS.element
// }
class VNode {
    constructor(type, props = null, children = null) {
        this.type = type;
        this.props = props;
        this.children = children;
        this.el = null; // 真实 DOM 元素
        this.shapeFlag = this.getShapeFlag(type);
        // 根据 children 的类型设置 shapeFlag
        if (Array.isArray(children)) {
            this.shapeFlag |= 8 /* SHAPEFLAGS.array_children */;
        }
        else {
            this.shapeFlag |= 4 /* SHAPEFLAGS.text_children */;
        }
        if (this.shapeFlag & 2 /* SHAPEFLAGS.stateful_component */ && (typeof this.children === 'function' || isObject(children) || Array.isArray(children))) {
            this.shapeFlag |= 16 /* SHAPEFLAGS.slot_children */;
        }
    }
    getShapeFlag(type) {
        return isObject(type)
            ? 2 /* SHAPEFLAGS.stateful_component */
            : 1 /* SHAPEFLAGS.element */;
    }
}
function createVnode(type, props = null, children = null) {
    const vnode = new VNode(type, props, children);
    return vnode;
}
function createTextNode(text) {
    return createVnode(TextNode, {}, text);
}

// 插槽是在渲染子组件的时候 传递给h函数的第三个参数 而h函数的第一个参数是组件
// 那么在createVnode的时候 会返回一个类型是组件的虚拟节点
// 而之前的错误就是因为认为类型不应该是组件（也就是对象）而是fragment 导致sahpeFlags错误
// 那么再复习一遍
// 有节点实例 有组件实例
// 如果节点的type是一个对象 而不是一个例如div的字符串 证明这是一个组件
// 然后就会创建组件实例 原来的节点实例会挂载在组件实例的vnode属性上面
// 而这里的插槽可以分为没有位置的默认插槽 有位置的具名插槽 这两种插槽的值可以是 节点 节点数组 或者由函数返回节点或者节点数组
// slots是属于某个组件`的 而不是节点的
function normalizeSlots(val) {
    return Array.isArray(val) ? val : [val];
}
function initSlots(instance, children) {
    console.log(instance.vnode.shapeFlag);
    if (instance.vnode.shapeFlag & 16 /* SHAPEFLAGS.slot_children */) {
        if (children instanceof VNode || Array.isArray(children) || typeof children == 'function') {
            let res = children;
            if (typeof children === 'function') {
                res = (props) => normalizeSlots(children(props));
                instance.slots = res;
                return;
            }
            instance.slots = normalizeSlots(res);
        }
        else {
            const slots = {};
            for (let key in children) {
                const value = children[key];
                // slots原本应该是一个虚拟节点 因为h函数的第三个参数是数组 所以应该用数组包裹起来
                // 对于作用域插槽 slots是一个函数 返回一个虚拟节点 
                // 应该先获得这个节点 再包装成函数 
                if (typeof value === 'function') {
                    slots[key] = (props) => normalizeSlots(value(props));
                }
                else {
                    slots[key] = normalizeSlots(value);
                }
            }
            instance.slots = slots;
        }
    }
    // 具名插槽：children是一个对象 对象的属性值是虚拟节点
    // 作用域插槽：对象的属性值是一个函数
}
// 这里的slots可能是数组或者函数
// 如果是默认插槽 直接return createVnode('div',{},slot)
// 如果slots是一个对象 对象属性值是一个数组 
// 对象属性值是一个函数
function renderSlots(slots, name, prop) {
    if (Array.isArray(slots)) {
        return createVnode(Fragment, {}, slots);
    }
    else if (isObject(slots) && name) {
        const slot = slots[name];
        if (!slot) {
            return;
        }
        if (typeof slot === 'function') {
            console.log('具名函数');
            return createVnode(Fragment, {}, slot(prop));
        }
        else {
            console.log('具名节点');
            return createVnode(Fragment, {}, slot);
        }
    }
    else if (typeof slots === 'function') {
        console.log('函数');
        return createVnode(Fragment, {}, slots(prop));
    }
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

const publicPropertiesMAp = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const publicinstanceProxyHandlers = {
    get({ _: instance }, key) {
        // 如果key在setupState里面 也就是setup函数返回的数据
        const { setupState, props } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        else if (publicPropertiesMAp[key]) {
            return publicPropertiesMAp[key](instance);
        }
        else if (key in props) {
            return props[key];
        }
    }
};

function initProps(instance, props) {
    instance.props = props || {};
}

// activeEffect不为空证明当前有正在运行的函数 那么才有必要触发依赖收集 否则get陷阱只需要返回访问值即可
let activeEffect;
class ReactiveEffect {
    constructor(fn, schelduler) {
        this.schelduler = schelduler;
        // schelduler?:Function
        this.active = true;
        this.deps = new Set();
        this._fn = fn;
    }
    run() {
        // 如果当前函数不处于活跃状态 也就是这个runner被stop了 此时若是继续调用runner 应该只执行函数而不收集依赖
        // 否则调用runner之后 函数会被再次添加到依赖列表
        if (this.active) {
            activeEffect = this;
        }
        const result = this._fn();
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffects(this, this.onStop);
            this.active = false;
        }
    }
}
function effect(fn, options = {}) {
    const schelduler = options.schelduler;
    const _effect = new ReactiveEffect(fn, schelduler);
    Object.assign(_effect, options);
    _effect.run();
    activeEffect = null;
    // call立即执行 bind只是绑定上下文
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
function isTracking() {
    return !!activeEffect;
}
const targetMap = new Map();
function track(target, key) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    if (isTracking()) {
        if (dep.has(activeEffect))
            return;
        dep.add(activeEffect);
        activeEffect.deps.add(dep);
    }
}
function trigger(target, key) {
    // let depsMap = targetMap.get(target)
    // if(!depsMap) return 
    // let dep = depsMap.get(key)
    // triggerEffects(dep)
    // 现在只实现的get和set 但是其实有其他的操作 比如delete 这些操作也有对应的effects需要触发
    // 所以应该初始化两个数组:deps 存放所有的dep effects 遍历deps 把里面的函数解构出来存放在efffects里面
    // 然后把处理好的effect交给triggerEffects处理
    let deps = [];
    // 取出get对应的effects并存放
    let depsMap = targetMap.get(target);
    if (!depsMap)
        return; //注意这里可能是不存在的
    let dep = depsMap.get(key);
    deps.push(dep);
    let effects = [];
    deps.forEach(dep => {
        effects.push(...dep);
    });
    triggerEffects(effects);
}
function triggerEffects(dep) {
    for (let effect of dep) {
        // nextTick就是通过schelduler实现的
        if (effect.schelduler) {
            effect.schelduler();
        }
        else {
            effect.run();
        }
    }
}
function cleanupEffects(effect, onStop) {
    const depsSet = effect.deps;
    for (let dep of depsSet) {
        dep.delete(effect);
    }
    if (onStop) {
        onStop();
    }
    depsSet.length = 0;
}

function createGetter(isreadOnly = false, shallow = false) {
    return function get(target, key, recevier) {
        // 验证访问reactive的源对象的时候key是否正确 访问上下文是否正确:访问上下文是代理对象
        const isExistInReactiveMap = () => recevier === reactiveMap.get(target);
        const isExistInReadOnlyeMap = () => recevier === readOnlyMap.get(target);
        const isExistInShallowReadOnlyeMap = () => recevier === shallowReadOnlyMap.get(target);
        switch (key) {
            case "__v_raw" /* ReactiveFlags.RAW */: {
                if (isExistInReactiveMap() ||
                    isExistInReadOnlyeMap() ||
                    isExistInShallowReadOnlyeMap()) {
                    return target;
                }
                break;
            }
            case "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */: {
                return !isreadOnly;
            }
            case "__v_isReadonly" /* ReactiveFlags.IS_READONLY */: {
                return isreadOnly;
            }
            default: {
                // 当数据活跃并且当前有正在运行的影响时才需要进行track
                if (!isreadOnly) {
                    track(target, key);
                }
                const res = Reflect.get(target, key);
                if (shallow) {
                    return res;
                }
                else if (isObject(res)) {
                    return isreadOnly ? readOnly(res) : reactive(res);
                }
                else {
                    return res;
                }
            }
        }
    };
}
function createSetter(isreadOnly = false) {
    return function set(target, key, val, receiver) {
        if (!isreadOnly) {
            if (target[key] !== val) {
                const res = Reflect.set(target, key, val, receiver);
                trigger(target, key);
                return res;
            }
            else {
                return true;
            }
        }
        else if (isreadOnly) {
            console.warn('禁止修改只读对象');
            return true;
        }
    };
}
const readOnlyGetter = createGetter(true);
const Getter = createGetter(false);
const readOnlySetter = createSetter(true);
const Setter = createSetter(false);
const shallowRadOnlyGetter = createGetter(true, true);
const mutableHandler = {
    get: Getter,
    set: Setter
};
const readOnlyHandler = {
    get: readOnlyGetter,
    set: readOnlySetter
};
const shallowRadOnlyHandler = Object.assign({}, readOnlyHandler, {
    get: shallowRadOnlyGetter
});

const reactiveMap = new WeakMap();
const readOnlyMap = new WeakMap();
const shallowReadOnlyMap = new WeakMap();
function reactive(raw) {
    return createActiveObject(raw, reactiveMap, mutableHandler);
}
function readOnly(raw) {
    return createActiveObject(raw, readOnlyMap, readOnlyHandler);
}
function shallowReadOnly(raw) {
    return createActiveObject(raw, shallowReadOnlyMap, shallowRadOnlyHandler);
}
function createActiveObject(raw, proxyMap, handler) {
    // 如果需要代理的对象是已经代理过的对象 那么直接返回
    if (proxyMap.get(raw))
        return proxyMap.get(raw);
    const proxy = new Proxy(raw, handler);
    proxyMap.set(raw, proxy);
    return proxy;
}

function emit(instance, event) {
    const { props } = instance;
    // add=>onAdd
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    function toHandlerKey(name) {
        return name ? 'on' + capitalize(name) : "";
    }
    if (props[toHandlerKey(event)]) {
        props[toHandlerKey(event)]();
    }
}

function ref(value) {
    return new RefImpl(value);
}
class RefImpl {
    constructor(val) {
        this.deps = new Set();
        this._isRef_ = true;
        this._val = isObject(val) ? reactive(val) : val;
        this._raw = val;
    }
    get value() {
        trackEffects(this.deps);
        // 如果接收的值是对象 那么_val需要用reactive包裹
        return this._val;
    }
    set value(newVal) {
        console.log('set');
        console.log(Object.is(this._raw, newVal));
        // 如果接受的值是对象 那么this._val是代理对象 而接受的值是原始对象 所以需要保存没有经过代理的原始对象 进行对比
        if (!Object.is(this._raw, newVal)) {
            // 拦截对象修改 
            this._val = isObject(newVal) ? reactive(newVal) : newVal;
            this._raw = newVal;
            triggerEffects(this.deps);
        }
    }
}
function isRef(ref) {
    return !!ref._isRef_;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objWithRef) {
    return new Proxy(objWithRef, {
        get: (target, key, receiver) => {
            return unRef(Reflect.get(target, key, receiver));
        },
        set: (target, key, val, receiver) => {
            // ref normal
            // ref ref
            // n r
            // n n
            if (!isRef(val) && isRef(target[key])) {
                return target[key].value = val;
            }
            else {
                return Reflect.set(target, key, val, receiver);
            }
        }
    });
}

function createComponentInstance(vnode, parents) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: (event) => { },
        slots: {},
        // 如果当前组件没有注入的内容 就把provides设置成父级的provides
        provides: parents ? parents.provides : {},
        parents,
        isMounted: false,
        subTree: null
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // init
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
let currentInstance = null;
// 这个函数用于完善组件实例的各项数据
function setupStatefulComponent(instance) {
    const component = instance.type;
    // 这里proxy代理的变量应该是上下文环境变量
    instance.proxy = new Proxy({ _: instance }, publicinstanceProxyHandlers);
    const { setup } = component;
    if (setup) {
        // props是一个浅层只读
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadOnly(instance.props), { emit: instance.emit }); //setup的返回值可能是函数 也可能是对象 
        handleSetupResult(instance, setupResult);
    }
    finishComponentSetup(instance);
}
function handleSetupResult(instance, res) {
    // todo:function
    if (isObject(res)) {
        // 把setup执行结果挂载在组件实例上面
        instance.setupState = proxyRefs(res);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (component.render) {
        // 给组件实例挂载render函数
        instance.render = component.render;
    }
}
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    const instance = getCurrentInstance();
    let { provides, parent } = instance;
    if (instance) {
        // 为了支持跨层级provide 把当前组件的provides的原型设置成父级的provides属性
        if (parent && provides === parent.provides) {
            provides = instance.provides = Object.create(parent.provides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultVal) {
    const instance = getCurrentInstance();
    const { parents } = instance;
    if (parents) {
        return parents.provides[key] ? parents.provides[key] : typeof defaultVal === 'function' ? defaultVal() : defaultVal;
    }
}

// import { render } from "./renderer"
function createAppApi(render) {
    return function createApp(rootComponnet) {
        return {
            mount(rootContainer) {
                // 
                const vnode = createVnode(rootComponnet);
                render(vnode, rootContainer);
            }
        };
    };
}

// el:吧真实节点挂载在虚拟节点上面 如果在数组里面的文本虚拟节点也要记录el 就要把createVnode（textNode）函数返回的vnode上面的el绑定上真实节点
// 实现自定义渲染器
function createRender(options) {
    const { append, createElement, patchProps, setContent, removeChilds } = options;
    function render(vnode, container, parent = null) {
        patch(null, vnode, container, parent);
    }
    // n1=>old
    // n2->new
    function patch(n1, n2, container, parent) {
        // 当类型为组件 vnode.type是一个对象 当类型为element 是一个string
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parent);
                break;
            case TextNode:
                processTextNode(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* SHAPEFLAGS.element */) {
                    processElememt(n1, n2, container, parent);
                }
                else if (shapeFlag & 2 /* SHAPEFLAGS.stateful_component */) {
                    processComponent(n1, n2, container, parent);
                }
        }
    }
    function processFragment(n1, n2, container, parent) {
        const children = n2.children;
        children.forEach(ele => {
            patch(null, ele, container, parent);
        });
    }
    function processTextNode(n1, n2, container) {
        const text = document.createTextNode(n2.children);
        // n2=>new n1=>old
        n2.el = text;
        // container.append(text)
        append(text, container);
    }
    function processComponent(n1, n2, container, parent) {
        // 初始化
        mountComponent(n2, container, parent);
    }
    function processElememt(n1, n2, container, parent) {
        if (n1) {
            console.log('更新element');
            patchElement(n1, n2, container);
        }
        else {
            console.log('初始化ele');
            mountElement(n2, container, parent);
        }
    }
    function patchElement(n1, n2, container) {
        // 更新props
        const oldProps = n1.props || {};
        const newProps = n2.props || {};
        const el = (n2.el = n1.el);
        // 遍历新props的key 和旧的对比 如果不一样 可能是发生了修改或者添加
        // new old==>setAttr//修改
        // undefined old==>//删除
        // val undefied==>set//添加
        // 遍历旧的 如果不一样 可能是发生了删除
        // old undefied==>remove//删除
        // 添加了新的事件 只能添加 不能删除
        updateElementProps(newProps, oldProps, el);
        updateElementChildren(n1, n2, container);
    }
    function updateElementProps(newProps, oldProps, el) {
        if (!(oldProps != newProps)) {
            for (let key in newProps) {
                if (newProps[key] != oldProps[key]) {
                    patchProps(key, oldProps[key], newProps[key], el);
                }
            }
            for (let key in oldProps) {
                if (!(key in newProps)) {
                    patchProps(key, oldProps[key], null, el);
                }
            }
        }
    }
    function updateElementChildren(n1, n2, container) {
        const { shapeFlag } = n1;
        const newFlag = n2.shapeFlag;
        // array=>text
        if (newFlag & 4 /* SHAPEFLAGS.text_children */) {
            if (shapeFlag & 8 /* SHAPEFLAGS.array_children */) {
                // 移除所有子节点 再设置文本内容 这个移除节点也应该是一个稳定的接口
                unMountedChildren(n1);
                setContent(n2.children, container);
            }
        }
        // text=>array
    }
    function unMountedChildren(node) {
        const { children } = node;
        if (children) {
            children.forEach(c => {
                console.log('c?.el', c.el);
                removeChilds(c.el);
            });
        }
    }
    function mountComponent(vnode, container, parent) {
        const instance = createComponentInstance(vnode, parent);
        setupComponent(instance);
        // 组件完成setup开始render 渲染视图
        setupRenderEffect(instance, vnode, container);
    }
    function mountElement(vnode, container, parent) {
        const { shapeFlag } = vnode;
        const el = (vnode.el = createElement(vnode.type));
        const { children, props } = vnode;
        for (let key in props) {
            patchProps(key, null, props[key], el);
        }
        if (shapeFlag & 4 /* SHAPEFLAGS.text_children */) {
            // el.textContent = children
            setContent(children, el);
        }
        else if (shapeFlag & 8 /* SHAPEFLAGS.array_children */) {
            children.forEach(ele => {
                patch(null, ele, el, parent);
            });
        }
        // container.append(el)
        append(el, container);
    }
    function setupRenderEffect(instance, vnode, container) {
        effect(() => {
            console.log('instance.isMounted', instance.isMounted);
            if (!instance.isMounted) {
                console.log('初始化');
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance);
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log('更新');
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevTree = instance.subTree;
                patch(prevTree, subTree, container, parent);
                // 对比逻辑
                // 更新subtree
                instance.subTree = subTree;
            }
        });
    }
    return {
        createApp: createAppApi(render)
    };
}

function append(content, container) {
    container.append(content);
}
function createElement(type) {
    const ele = document.createElement(type);
    return ele;
}
// function patchProps(props,el){
//     for(let key in props){
//         const ison = (key:string)=>/^on[A-Z]/.test(key)
//         if(ison(key)){
//             const event = key.slice(2).toLowerCase()
//             el.addEventListener(event,props[key])
//         }else{
//             el.setAttribute(key,props[key])
//         }
//     }
// }
function patchProps(key, preval, nextVal, el) {
    const ison = (key) => /^on[A-Z]/.test(key);
    if (ison(key) && typeof nextVal === 'function') {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    }
    else if (nextVal === undefined || nextVal === null) {
        el.removeAttribute(key);
    }
    else if (nextVal && !ison(key)) {
        el.setAttribute(key, nextVal);
    }
}
function removeChilds(node) {
    const parent = node.parentNode;
    if (parent) {
        parent.removeChild(node);
    }
}
function setContent(content, el) {
    const node = document.createTextNode(content);
    // el.textContent = content
    el.append(node);
}
const render = createRender({
    append,
    createElement,
    patchProps,
    setContent,
    removeChilds
});
function createApp(...args) {
    return render.createApp(...args);
}

export { createApp, createRender, createTextNode, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots };
