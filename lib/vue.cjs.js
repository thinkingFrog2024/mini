'use strict';

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
function toDisplayString(val) {
    return String(val);
}
class VNode {
    constructor(type, props = null, children = null) {
        this.component = null;
        this.type = type;
        this.props = props;
        this.children = children;
        this.key = props ? props.key : undefined;
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
    $slots: (i) => i.slots,
    $props: (i) => i.props
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
    if (compiler && !component.render) {
        if (component.template) {
            component.render = compiler(component.template);
        }
    }
    if (component.render) {
        // 给组件实例挂载render函数
        // 但是用户实际上写的不是render函数 而是一个template 但是这里不应该直接使用编译模块的函数 避免造成强耦合关系
        instance.render = component.render;
    }
}
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}
let compiler;
function registerRuntimeCompile(_compiler) {
    compiler = _compiler;
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

function shouldUpdate(newProps, oldProps) {
    console.log(newProps);
    for (const key in newProps) {
        if (newProps[key] != oldProps[key]) {
            return true;
        }
    }
    for (const key in oldProps) {
        if (newProps[key] != oldProps[key]) {
            return true;
        }
    }
    return false;
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

let jobs = [];
let isJobPending = false;
function nextTick(fn) {
    return fn ? Promise.resolve().then(fn) : Promise.resolve();
}
function queueJobs(job) {
    console.log('执行nextTick');
    if (!jobs.includes(job)) {
        jobs.push(job);
    }
    // 使用promise.resolve创建微任务 执行任务队列里面的函数
    queueFlush();
}
function queueFlush() {
    if (isJobPending)
        return;
    isJobPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    let job;
    while (job = jobs.shift()) {
        console.log(job);
        if (job)
            job();
    }
    isJobPending = false;
}

// el:吧真实节点挂载在虚拟节点上面 如果在数组里面的文本虚拟节点也要记录el 就要把createVnode（textNode）函数返回的vnode上面的el绑定上真实节点
// 实现自定义渲染器
function createRender(options) {
    const { append, createElement, patchProps, setContent, removeChilds } = options;
    function render(vnode, container, parent = null) {
        patch(null, vnode, container, parent, null);
    }
    // n1=>old
    // n2->new
    function patch(n1, n2, container, parent, anchor) {
        // 当类型为组件 vnode.type是一个对象 当类型为element 是一个string
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parent, anchor);
                break;
            case TextNode:
                processTextNode(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* SHAPEFLAGS.element */) {
                    console.log(n2);
                    processElememt(n1, n2, container, parent, anchor);
                }
                else if (shapeFlag & 2 /* SHAPEFLAGS.stateful_component */) {
                    processComponent(n1, n2, container, parent, anchor);
                }
        }
    }
    function processFragment(n1, n2, container, parent, anchor) {
        const children = n2.children;
        children.forEach(ele => {
            patch(null, ele, container, parent, anchor);
        });
    }
    function processTextNode(n1, n2, container) {
        const text = document.createTextNode(n2.children);
        // n2=>new n1=>old
        n2.el = text;
        // container.append(text)
        append(text, container);
    }
    function processComponent(n1, n2, container, parent, anchor) {
        // 初始化
        if (!n1) {
            mountComponent(n2, container, parent, anchor);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2, container, parent, achor) {
        const instance = (n2.component = n1.component);
        if (shouldUpdate(n1.props, n2.props)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
        // 更新组件就是再次调用组件的rnder函数得到虚拟节点树 使用新的数据进行渲染 也就是再次执行effect函数里面的逻辑
        // 可以利用effect函数返回的runner 把这个runner挂载在组件的update属性上面 这样在函数里面就可以通过组件实例调用更新逻辑
        // js的对象可以相互引用是因为引用的时候传递的是地址 而不是值
    }
    function processElememt(n1, n2, container, parent, anchor) {
        if (n1) {
            patchElement(n1, n2, container, parent, anchor);
        }
        else {
            mountElement(n2, container, parent, anchor);
        }
    }
    function patchElement(n1, n2, container, parent, anchor) {
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
        updateElementChildren(n1, n2, container, parent, anchor);
    }
    function updateElementProps(newProps, oldProps, el) {
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
    function updateElementChildren(n1, n2, container, parent, anchor) {
        const { shapeFlag } = n1;
        // n1 是div的两个旧的子节点 也就是旧的son组件 和元素
        // 而n2是新的
        const newFlag = n2.shapeFlag;
        const c1 = n1.children;
        const c2 = n2.children;
        const el = n1.el;
        // array=>text
        // text=>text
        if (newFlag & 4 /* SHAPEFLAGS.text_children */) {
            if (shapeFlag & 8 /* SHAPEFLAGS.array_children */) {
                // 移除所有子节点 再设置文本内容 这个移除节点也应该是一个稳定的接口
                unMountedChildren(n1);
                // n1是一个虚拟节点 这个节点上面的children属性挂载了所有的虚拟子节点
                // 虚拟子节点上面挂载了真实子节点
            }
            if (c1 != c2) {
                setContent(c2, el); //inerText这个api会清除元素里面所有的内容 包括子节点
            }
        }
        else {
            if (shapeFlag & 8 /* SHAPEFLAGS.array_children */) {
                // 暴力
                // unMountedChildren(n1)
                // mountChildren(c2,el,parent)
                patchKeyedChildren(c1, c2, el, parent, anchor);
            }
            else {
                setContent(null, container);
                mountChildren(c2, container, parent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parent, parentAnchor) {
        // i指针指向两个数组的第一个节点
        // e1指向c1的最后一个节点
        // e2指向c2的最后一个节点
        // 
        const l2 = c2.length;
        let e1 = c1.length - 1;
        let e2 = l2 - 1;
        let i = 0;
        let moved = false;
        let MaxIndexSoFAr = -1;
        // 左边循环
        while (i <= e1 && i <= e2) {
            // 对比两个节点是否一样
            const n1 = c1[i], n2 = c2[i];
            if (isSameVnode(n1, n2)) {
                // 继续递归对比props等属性
                // 在这里patch了前后的新旧组件 n1是旧的组件虚拟节点 n2是新的组件虚拟节点 组件实例instance挂载在n1上面 
                // 组件实例的挂载 el的挂载 都是在组件初始化的时候进行的
                // 在组件更新的时候 也就是执行instance.update的时候 会在新的虚拟节点上面挂载这些属性 
                // 如果不更新的话 虚拟节点上面这些属性就是null  所以在不执行更新也应该。。。
                // 这里的新的虚拟节点挂载在subTree的children数组里面
                patch(n1, n2, container, parent, parentAnchor);
            }
            else {
                // 发现两个节点不一样 退出循环q
                break;
            }
            i++;
        }
        // 右侧对比 移动e1 e2
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1], n2 = c2[e2];
            if (isSameVnode(n1, n2)) {
                // 继续递归对比props等属性
                patch(n1, n2, container, parent, parentAnchor);
            }
            else {
                // 发现两个节点不一样 退出循环q
                break;
            }
            e1--;
            e2--;
        }
        // 左侧循环找到从左边开始第一个不同的节点 右侧循环找到从右边开始第一个不同的节点
        // 最后得到的i是左边第一个元素的下标 e1 e2是右边第一个不同的元素的下标
        // 当c2的长度比c1常 需要添加新的元素 此时i将会大于e1 小于e2
        // c2比c1长有两种场景：c2前面添加了元素 c2后面添加了元素
        // 添加在后面的时候  i = c1.length e1 = c1.length-1 e2 = c2.length-1
        // 添加在前面的时候 i= 0 e1 = -1 e2是某个正数（这是添加在最前面的情况）
        // 这两种情况都满足判断条件 但是在添加在后面的时候可以直接append 添加在前面的时候需要知道具体位置
        // 
        if (i > e1 && i <= e2) {
            // 计算需要插入的元素的后面一个元素的位置 把找到的元素提供给append函数
            const nextPos = e2 + 1;
            // 如果找到的位置大于等于数组长度 那么就是超出了 这种情况应该是要添加的元素位于数组的末端
            const anchor = nextPos < l2 ? c2[nextPos].el : null;
            while (i <= e2) {
                patch(null, c2[i], container, parent, anchor);
                i++;
            }
        }
        else if (i <= e1 && i > e2) {
            // 删除元素
            removeChilds(c1[i].el);
        }
        else {
            // 中间对比
            const keytoindex = new Map();
            let s1 = i;
            let s2 = i;
            const toBePatched = e2 - s1 + 1; //1
            let patched = 0;
            const newIndexToOldIndexMAp = new Array(toBePatched);
            for (let i = 0; i < toBePatched; i++) {
                newIndexToOldIndexMAp[i] = 0; //此处的0代表没有记录
            }
            // 映射
            for (let i = s1; i <= e2; i++) {
                const next = c2[i];
                keytoindex.set(next.key, i);
            }
            // 遍历旧的节点  
            for (let i = s1; i <= e1; i++) {
                const prev = c1[i];
                let newIndex;
                if (patched > toBePatched) {
                    removeChilds(prev[i]);
                    continue;
                }
                // 用户可能没有设置key
                if (prev.key) {
                    newIndex = keytoindex.get(prev.key);
                }
                else {
                    // 如果没有key 遍历比较是否相等 这会导致时间复杂度上升
                    for (let j = s1; j <= e2; j++) {
                        if (isSameVnode(prev, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                // 遍历完成之后如果index等于undefined的话 证明这个节点在新节点里面不存在 应该删除
                if (!newIndex) {
                    removeChilds(prev.el);
                }
                else {
                    if (newIndex > MaxIndexSoFAr) {
                        MaxIndexSoFAr = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    // 这里是更新逻辑 比较新旧节点 不需要锚点
                    // 逻辑走到这里确定某个节点在新的节点里面存在了 记录新旧节点位置映射也应该在这里记录
                    patch(prev, c2[newIndex], container, parent, null);
                    newIndexToOldIndexMAp[newIndex - s2] = i + 1; //因为0具有特殊意义 所以这里的i要确定不等于0
                    patched++;
                }
                // 优化点：如果新的节点里面的所有节点都被对比过了 但是老节点里面还有元素没有经过对比 那么应该删除
                // 处理交换位置：最长递增子序列算法：找到一条最长的排列稳定的节点 在这个序列里面的节点不移动
                // 以此减少移动次数
                const increasingSequence = moved ? getSequence(newIndexToOldIndexMAp) : [];
                // 移动位置的时候需要把元素插在某个锚点之前 这就需要锚点必须是一个稳定的元素
                // 为了确保这个元素 需要逆序进行遍历
                // 这个for循环i走的是新旧映射 j走的是最长序列 
                // 新旧映射里面的元素如果属于最长序列 那么不移动
                let j = increasingSequence.length - 1;
                for (let i = toBePatched - 1; i >= 0; i--) {
                    const nextIndex = i + s2; //i = e2-s2=>nextIndex = e2
                    const nextChild = c2[nextIndex];
                    const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                    // 旧的125436
                    // 新的312465
                    // 映射：401352：newIndextoOldIndexMAp 记录了新旧数组序列号的映射关系  
                    // 由于这个映射关系里面的0代表不存在 所以初始化的时候需要加一
                    // 最长：0135 inscreasingSequence 也就是旧数组里面这些序列号的元素不需要移动
                    // 最少需要移动两次：移动3 5
                    if (newIndexToOldIndexMAp[i] === 0) {
                        patch(null, nextChild, container, parent, anchor);
                    }
                    else if (moved) {
                        if (i != increasingSequence[j]) {
                            // 移动位置
                            // 0 1 2 3 4 5 6
                            //  0 1 s2 = 1
                            //  2 3 4//3 i =2
                            // 5 6
                            append(nextChild, container, anchor);
                        }
                        else {
                            j--;
                        }
                    }
                }
            }
        }
    }
    function isSameVnode(v1, v2) {
        return v1.type == v2.type && v1.key == v2.key;
    }
    function unMountedChildren(node) {
        const { children } = node;
        if (children) {
            children.forEach(c => {
                removeChilds(c.el);
            });
        }
    }
    function mountComponent(vnode, container, parent, anchor) {
        // 把组件实例挂载在虚拟节点上 这样就可以通过虚拟节点调用update函数
        const instance = (vnode.component = createComponentInstance(vnode, parent));
        setupComponent(instance);
        // 组件完成setup开始render 渲染视图
        setupRenderEffect(instance, vnode, container, anchor);
    }
    function mountElement(vnode, container, parent, anchor) {
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
            mountChildren(children, el, parent, anchor);
        }
        // container.append(el)
        append(el, container, anchor);
    }
    function mountChildren(children, el, parent, anchor) {
        children.forEach(ele => {
            // el就是container
            console.log('else-----', ele, 'ele');
            if (typeof ele === 'string') {
                setContent(ele, el);
                return;
            }
            else {
                patch(null, ele, el, parent, anchor);
            }
        });
    }
    function setupRenderEffect(instance, vnode, container, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy, proxy));
                patch(null, subTree, container, instance, null);
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { proxy } = instance;
                // 在获得虚拟节点之前 需要更新组件的props
                // 有点不懂 这里组建的更新是触发依赖进行patch之后再回到这个函数？
                // 这里如果修改的数据和子组件无关 也会引起子组件的更新 造成浪费 
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponnentInstanceBeforeRender(instance, next);
                }
                const subTree = instance.render.call(proxy, proxy);
                const prevTree = instance.subTree;
                patch(prevTree, subTree, container, instance, anchor);
                // 对比逻辑
                // 更新subtree
                // div 元素类型 子节点 一个元素类型 一个组件类型
                instance.subTree = subTree;
            }
        }, {
            schelduler() {
                console.log('执行schelduler');
                queueJobs(instance.update);
            }
        });
    }
    return {
        createApp: createAppApi(render)
    };
}
function updateComponnentInstanceBeforeRender(instance, nextVnode) {
    instance.props = nextVnode.props;
    instance.vnode = nextVnode;
    instance.next = null;
}
function getSequence(arr) {
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
                }
                else {
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

function append(content, container, anchor) {
    // console.log('con',container,content);
    // container.append(content)
    // 这个api可以指定插入的位置 如果锚点为空则在最后插入
    console.log(anchor, 'an', container);
    container.insertBefore(content, anchor || null);
}
function createElement(type) {
    const ele = document.createElement(type);
    return ele;
}
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
    console.log(';kkkkkkkkkkkkk', content);
    el.textContent = content;
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

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    createElementVNode: createVnode,
    createRender: createRender,
    createTextNode: createTextNode,
    getCurrentInstance: getCurrentInstance,
    h: h,
    inject: inject,
    nextTick: nextTick,
    provide: provide,
    registerRuntimeCompile: registerRuntimeCompile,
    renderSlots: renderSlots,
    toDisplayString: toDisplayString
});

function baseParse(content) {
    const context = createParserContext(content);
    return createRoot(parseChildren(context, []));
}
function parseChildren(context, ancestor) {
    const nodes = [];
    let node;
    while (!isEnd(context, ancestor)) {
        const s = context.source;
        if (s.startsWith("{{")) {
            node = parseInterpolation(context);
        }
        else if (s[0] == '<') {
            // 判断是不是元素类型
            if (/[a-z]/i.test(s[1])) {
                node = pareseElement(context, ancestor);
            }
        }
        else {
            node = parseText(context);
        }
        // 如果既不是element类型 也不是插值类型 就当作Text类型处理
        nodes.push(node);
    }
    return nodes;
}
function isEnd(context, ancestor) {
    // 当source没有值   或者需要结束标签</>的时候 停止循环
    const s = context.source;
    //这个处理可以防止在例如：<div><span></div>的情况下进入死循环
    if (s.startsWith('</')) {
        for (let i = 0; i < ancestor.length; i++) {
            const tag = ancestor[i].tag;
            if (s.slice(2, 2 + tag.length) === tag) {
                return true;
            }
        }
    }
    // if(parentTag&&s.startsWith("</"+parentTag+'>')){
    //     return true
    // }
    return !s;
}
function parseText(context) {
    // 遇到插值语法的时候应该停止截取
    let endIndex = context.source.length;
    const endToken = ["{{", "<"];
    let index;
    for (let i = 0; i < endToken.length; i++) {
        index = context.source.indexOf(endToken[i]);
        if (index != -1 && index < endIndex) {
            endIndex = index;
        }
    }
    const content = parseTextData(context, endIndex);
    adviceBy(context, content.length);
    return {
        type: 3 /* NodeTypes.TEXT */,
        content: content
    };
}
function parseTextData(context, length) {
    return context.source.slice(0, length);
}
function pareseElement(context, ancestor) {
    // 解析tag
    // 删除处理完成的代码
    // 这个正则表达式括号里面是捕获内容
    // 返回的数组里面的第一个元素是整个匹配到的内容 在这里是<div
    // 之后的内容是捕获组捕获到的内容 也就是div
    // 处理<div>
    // <div></div>
    // <div><span></div>
    const element = parseTag(context, 0 /* TagType.Start */);
    ancestor.push(element); //div sapn
    // 处理element里面的children 经过parseElement的处理element开头的符号已经被去掉了
    element.children = parseChildren(context, ancestor);
    ancestor.pop();
    // 处理</div>
    // 如果缺少结束标签 比如<div><span></div>
    // 那么</div>会被认为是<span>的结束标签
    // 所以需要验证开始标签 结束标签相同
    startsWithEndTag(context, element);
    return element;
}
function startsWithEndTag(context, element) {
    if (context.source.startsWith('<') && context.source.slice(2, 2 + element.tag.length).toLowerCase() === element.tag.toLowerCase()) {
        parseTag(context, 1 /* TagType.End */);
    }
    else {
        throw Error('缺少结束标签');
    }
}
function parseTag(context, type) {
    const match = /^<\/?([a-z]*)/i.exec(context.source);
    const tag = match[1];
    adviceBy(context, match[0].length);
    adviceBy(context, 1);
    if (type === 0 /* TagType.Start */) {
        return {
            type: 2 /* NodeTypes.ELEMENT */,
            tag: tag
        };
    }
}
function parseInterpolation(context) {
    // {{message}}=>message
    const openDelemeter = "{{";
    const closeDelimeter = "}}";
    const closeIndex = context.source.indexOf(closeDelimeter, openDelemeter.length);
    adviceBy(context, openDelemeter.length);
    const rawContentLength = closeIndex - openDelemeter.length;
    const rawcontent = parseTextData(context, rawContentLength);
    // 删除已经处理的部分
    adviceBy(context, rawContentLength + closeDelimeter.length);
    const content = rawcontent.trim();
    return {
        type: 0 /* NodeTypes.INTERPOLATION */,
        content: {
            type: 1 /* NodeTypes.SYMPLE_EXPRESSION */,
            content: content
        }
    };
}
function createRoot(child) {
    return {
        children: child,
        type: 4 /* NodeTypes.ROOT */
    };
}
function adviceBy(context, length) {
    context.source = context.source.slice(length);
}
function createParserContext(content) {
    return {
        source: content
    };
}

const TODISPLAYSTRING = Symbol('toDisPlayString');
const CREATEELEMENTVNODE = Symbol('createElementVNode');
const helpMapName = {
    [TODISPLAYSTRING]: 'toDisplayString',
    [CREATEELEMENTVNODE]: 'createElementVNode'
};

// 插值生成render函数相比于字符串生成render函数多了一个导入逻辑 返回数据的时候是通过函数调用:toDisplayString(因为从代理对象里面取出的值未必是一个字符串)
function generate(ast) {
    const context = createCodegenContext(); //前导函数
    const { push } = context;
    getFunctionPreamble(ast, context);
    const functionName = 'render'; //函数名
    const args = ['_ctx', '_cache']; //参数数组
    const signature = args.join(','); //数组转成string
    push(`function ${functionName}(${signature}){`); //拼接 
    push('\n');
    push('return ');
    getNode(ast.codegenNode, context); //处理不同类型的节点
    push('}');
    return {
        code: remove(context.code)
    }; //返回code
}
function remove(str) {
    console.log(str[str.length - 1], str[str.length - 2]);
    if (str[str.length - 2] == ',') {
        return str.slice(0, -2) + str.slice(-1);
    }
    return str;
}
function createCodegenContext() {
    const context = {
        code: "",
        push(str) {
            context.code += str;
        },
        helper(key) {
            return `_${helpMapName[key]}`;
        }
    };
    return context;
}
function getNode(node, context) {
    // 处理不同的数据类型
    switch (node.type) {
        case 3 /* NodeTypes.TEXT */:
            genText(node, context);
            break;
        case 2 /* NodeTypes.ELEMENT */:
            genElement(node, context);
            break;
        case 0 /* NodeTypes.INTERPOLATION */:
            genInterpolation(node, context);
            break;
        case 1 /* NodeTypes.SYMPLE_EXPRESSION */:
            genExpression(node, context);
            break;
        case 5 /* NodeTypes.COMPOUND */:
            genCompound(node, context);
            break;
    }
}
function genCompound(node, context) {
    const { children } = node;
    const { push } = context;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (typeof child === 'string') {
            push(child);
        }
        else {
            getNode(child, context);
        }
    }
}
function genElement(node, context) {
    const { push, helper } = context;
    const { tag, children, props } = node;
    const [gtag, gchildren, gprops] = genNullable([tag, children, props]);
    push(`${helper(CREATEELEMENTVNODE)}(${gtag},${gprops},`);
    // push(`${helper(CREATEELEMENTVNODE)}(${tag}),null,"hi," + _toDisplayString(_ctx.message)}`)
    // 处理子节点
    push('[');
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        getNode(child, context);
    }
    push(']');
    push(')');
}
function genNullable(args) {
    return args.map((arg) => arg || "null");
}
function genExpression(node, context) {
    const { push } = context;
    // 这个应该放在transform里面进行处理
    // push('_ctx.')
    push(node.content);
}
function genText(node, context) {
    const { push } = context;
    push(`'${node.content}'`);
}
function genInterpolation(node, context) {
    const { push, helper } = context;
    push(`${helper(TODISPLAYSTRING)}(`);
    getNode(node.content, context);
    push(')');
}
function getFunctionPreamble(ast, context) {
    const { push } = context;
    const vueBinging = 'Vue';
    // 把helpers里面的Symbol映射处理成字符串
    // 处理导入逻辑
    const aliasHelpers = (s) => `${helpMapName[s]}:_${helpMapName[s]}`;
    if (ast.helpers.length > 0) {
        push(`const {${ast.helpers.map(aliasHelpers).join(',')}} = ${vueBinging}`);
    }
    push('\n');
    push('return  ');
}
// const Vue:any = {}
// const {createElementVNode:_createElementVNode,toDisplayString:_toDisplayString} = Vue
// return  function render(_ctx,_cache){
//     return _createElementVNode('div'),null,'hi, '+_toDisplayString(_ctx.message)+_toDisplayString(_ctx.xixi)+'nini',_createElementVNode('span'),null}

function transform(root, options) {
    // 遍历 修改textContent
    const context = createTransformContext(root, options);
    tranverseNode(root, context);
    createRootcodegen(root);
    root.helpers = [...context.helpers.keys()];
}
function createRootcodegen(root) {
    root.codegenNode = root.children[0];
}
function tranverseNode(node, context) {
    const nodeTransform = context.options.nodeTransforms;
    if (nodeTransform) {
        for (let i = 0; i < nodeTransform.length; i++) {
            nodeTransform[i](node, context);
        }
    }
    const { children, type } = node;
    console.log('node', node);
    switch (type) {
        case 0 /* NodeTypes.INTERPOLATION */:
            console.log('iiiiiiiiiiiiii');
            context.helper(TODISPLAYSTRING);
            console.log(context.helper);
            break;
        case 4 /* NodeTypes.ROOT */:
        case 5 /* NodeTypes.COMPOUND */:
        case 2 /* NodeTypes.ELEMENT */:
            tranverseChildren(children, context);
    }
}
function tranverseChildren(children, context) {
    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        tranverseNode(node, context);
    }
}
function createTransformContext(root, options) {
    const context = {
        root,
        options,
        // helper函数接收一个字符串 并且把这个字符串保存在helpers属性里面
        // 这里的处理是接收一个Symbol 把symbol添加到数组里面 
        // 这个是基于类型的处理 应该放在trandform里面
        helper(key) {
            context.helpers.set(key, 1);
        },
        helpers: new Map
    };
    return context;
}

// 在ast的helpers数组里面添加上CREATEELEMENTVNODE 实现导入逻辑
function trandformElement(node, context) {
    if (node.type === 2 /* NodeTypes.ELEMENT */) {
        context.helper(CREATEELEMENTVNODE);
        node.tag = `'${node.tag}'`;
    }
}

function transformExpression(node) {
    // 插值类型=>content=>字符串类型
    if (node.type === 0 /* NodeTypes.INTERPOLATION */) {
        const raw = node.content.content;
        node.content.content = '_ctx.' + raw;
    }
}

function transformText(node) {
    if (node.type == 2 /* NodeTypes.ELEMENT */) {
        // 遍历元素类型的子节点 并且判断子节点的类型
        const { children } = node;
        let Container;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (isText(children[i])) {
                // 遍历这个节点以后的节点 判断是不是text 如果相邻的节点也是text 那么就可以初始化一个容器
                // 这个容器实际上也是一个节点 把后面的所有text类型的节点都添加到这个节点的children里面
                // 并且把添加的节点从原来的children里面删掉
                for (let j = i + 1; j < children.length; j++) {
                    const next = children[j];
                    if (isText(next)) {
                        // 初始化容器 并且把children[i]赋值成这个容器
                        if (!Container) {
                            Container = children[i] = {
                                type: 5 /* NodeTypes.COMPOUND */,
                                children: [child]
                            };
                        }
                        // 添加加号 方便拼接
                        Container.children.push('+');
                        // 向容器添加节点
                        Container.children.push(next);
                        // 删除children里面的节点
                        children.splice(j, 1);
                        // 由于数组里面进行删除 元素减少了 j需要减一
                        j--;
                    }
                    else {
                        // 如果下一个元素不是text bane就应该重置容器 离开当前的循环
                        if (Container) {
                            Container.children.push(',');
                        }
                        Container = null;
                        break;
                    }
                }
            }
        }
    }
}
function isText(node) {
    return node.type === 3 /* NodeTypes.TEXT */ || node.type === 0 /* NodeTypes.INTERPOLATION */;
}

function basecompile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformExpression, trandformElement, transformText]
    });
    const { code } = generate(ast);
    return code;
}
// const Vue:any = {}
// const {createElementVNode:_createElementVNode,toDisplayString:_toDisplayString} = Vue
// function render(_ctx,_cache){
// return _createElementVNode('div'),null,'hi, '+_toDisplayString(_ctx.message)+_toDisplayString(_ctx.xixi)+'nini',_createElementVNode('span'),null}

// export * from './reactivity'
function compileToFunction(template) {
    const code = basecompile(template);
    console.log(code);
    //     const code = `const {createElementVNode:_createElementVNode,toDisplayString:_toDisplayString} = Vue
    // return  function render(_ctx,_cache){
    // console.log(_toDisplayString(_ctx.message))
    // return _createElementVNode('div',null,_toDisplayString(_ctx.message))}`
    const render = new Function("Vue", code)(runtimeDom);
    // console.log(render);
    return render;
}
registerRuntimeCompile(compileToFunction);

exports.createApp = createApp;
exports.createElementVNode = createVnode;
exports.createRender = createRender;
exports.createTextNode = createTextNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.nextTick = nextTick;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.registerRuntimeCompile = registerRuntimeCompile;
exports.renderSlots = renderSlots;
exports.toDisplayString = toDisplayString;
