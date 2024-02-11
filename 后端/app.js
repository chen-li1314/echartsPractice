//服务器入口文件
const koa = require('koa')
const app = new koa()
const resDurationMiddleware = require('./middleware/koa_response_duration')
app.use(resDurationMiddleware)
const resHeaderMiddleware = require('./middleware/koa_response_header')
app.use(resHeaderMiddleware)
const resDateMiddleware = require('./middleware/koa_response_data')
app.use(resDateMiddleware)
app.listen(8888)

const webSocketService = require('./service/web_socket_service')
//开启服务端的监听，监听客户端的连接
//当其一个客户端连接成功之后，就会对这个客户端进行message事件的监听
webSocketService.listen()