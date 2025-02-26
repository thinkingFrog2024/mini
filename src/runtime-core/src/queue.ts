
let jobs:Array<any> = []
let isJobPending = false


export function nextTick(fn){
    
    return fn?Promise.resolve().then(fn):Promise.resolve()
}

export function queueJobs(job){
    console.log('执行nextTick');
    
    if(!jobs.includes(job)){
        
        jobs.push(job)
    }
    // 使用promise.resolve创建微任务 执行任务队列里面的函数
    queueFlush()
}

function queueFlush(){
    
    if(isJobPending)return
    isJobPending = true
    nextTick(flushJobs)
}

function flushJobs(){
    let job
        while(job = jobs.shift()){
            console.log(job);
            
            if(job)job()
            
        }
    isJobPending = false
}