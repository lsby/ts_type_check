import * as tools from "@lsby/js_tools"
import path from "path"
import main from "../dist/"

var 验证器 = main()

describe('基本测试', function () {
    // it('构建缓存', async function () {
    //     this.timeout(9999999)
    //     验证器.构建缓存(path.resolve(__dirname, './data.ts'))
    // })
    it('验证', function () {
        this.timeout(9999999)
        var 结果 = 验证器.验证(path.resolve(__dirname, './data.ts'), '请求数据', { a: 1, b: 1 })
        tools.断言相等(结果.valid, true)
    })
    it('验证', function () {
        this.timeout(9999999)
        var 结果 = 验证器.验证(path.resolve(__dirname, './data.ts'), '请求数据', { a: '1', b: 1 })
        tools.断言相等(结果.valid, false)
    })
})
