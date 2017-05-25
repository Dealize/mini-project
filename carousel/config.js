/**
 * 版本规范,0.0.1 第一位迭代的版本，第二位线上修复的版本，第三位测试的版本
 * @type {string}
 */
window.version = '1.1.0';
console.log('版本号：',window.version);
window.debug = false;
requirejs.config({
    baseUrl:'./',
    paths:{
        demo:'./demo',
    },
    shim:{
        // vConsole:{
        //     exports:'vConsole'
        // },
        // commonBridge:{
        //     exports:'commonBridge',
        //     deps:['jsBridge']
        // },
    },
    urlArgs:'v='+version
});
