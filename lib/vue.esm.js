function isObject(val) {
    return Object.prototype.toString.call(val) === '[object Object]';
}

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}
function setupComponent(instance) {
    // init
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    if (setup) {
        const setupResult = setup(); //setup的返回值可能是函数 也可能是对象 
        handleSetupResult(instance, setupResult);
    }
    finishComponentSetup(instance);
}
function handleSetupResult(instance, res) {
    // todo:function
    if (isObject(res)) {
        // 把setup执行结果挂载在组件实例上面
        instance.setupState = res;
    }
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (component.render) {
        // 给组件实例挂载render函数
        instance.render = component.render;
    }
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    // 当类型为组件 vnode.type是一个对象 当类型为element 是一个string
    if (typeof vnode.type === 'string') {
        processElememt(vnode, container);
    }
    else if (isObject(vnode.type)) {
        console.log('处理组件');
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    // 初始化
    mountComponent(vnode, container);
}
function processElememt(vnode, container) {
    // 更新
    mountElement(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    console.log('组件实例', instance);
    // 组件完成setup开始render 渲染视图
    setupRenderEffect(instance, container);
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    const { children, props } = vnode;
    for (let key in props) {
        el.setAttribute(key, props[key]);
    }
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        children.forEach(ele => {
            mountElement(ele, el);
        });
    }
    container.append(el);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    console.log('sub', instance.render);
    patch(subTree, container);
}

function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
}

function createApp(rootComponnet) {
    return {
        mount(rootContainer) {
            // 
            const vnode = createVnode(rootComponnet);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

export { createApp, h };
