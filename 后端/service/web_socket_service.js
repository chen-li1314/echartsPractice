const WebSocket = require('ws')
const path = require('path')
const fileUtils = require('../utils/file_utils')
//创建websocket服务端的对象，绑定端口号为9998
const wss = new WebSocket.Server({
    port: 9998
})

//服务端开启了监听
module.exports.listen = () => {
    //对客户端的连接事件进行监听
    //client是代表客户端的连接socket对象
    wss.on('connection', client => {
        //对客户端的连接对象进行message事件的监听
        //msg：由客户端发给服务端的数据
        client.on('message',async msg => {
            let payload = JSON.parse(msg)
            console.log('收到客户端发来的消息：',payload)
            const action = payload.action
            if (action === 'getData') {
                let filePath = '../data/' + payload.chartName + '.json'
                filePath = path.join(__dirname,filePath)
                const ret = await fileUtils.getFileJsonData(filePath)
                //需要在服务端获取到基础数据之上，增加data
                payload.data = ret
                client.send(JSON.stringify(payload))
            } else {
                //原封不动的将所获取到的数据转发给每一个处于连接状态的客户端
                //wss.clients 所有客户端的连接
                wss.clients.forEach(client=>{
                    client.send(JSON.stringify(payload))
                })
            }
        })
    })
}
