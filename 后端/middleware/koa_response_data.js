const path = require('path')
const fileUtils = require('../utils/file_utils')
//处理业务逻辑的中间件，读取某个json文件的数据
module.exports = async (ctx, next) => {
    //根据请求url进行读取
    const url = ctx.request.url
    let filePath = url.replace('/api', '')
    filePath = `../data${filePath}.json`
    filePath = path.join(__dirname, filePath)
    try {
        const ret = await fileUtils.getFileJsonData(filePath)
        ctx.response.body = ret
    } catch (error) {
        const errorMsg = {
            message: '读取失败，没这个',
            status: 404
        }
        ctx.response.body = JSON.stringify(errorMsg)
    }
    await next()
}