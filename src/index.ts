import { Validator, ValidatorResult } from 'jsonschema'
import { resolve } from "path"
import fs from "fs"
import md5 from "md5"
import path from "path"
import * as TJS from "typescript-json-schema"

export default function main(opt: { 使用文件缓存: boolean }) {
    var 缓存: { [路径: string]: { [类型名称: string]: any } | null } = {}

    var r = {
        async _构建缓存(ts类型文件路径: string) {
            缓存[ts类型文件路径] = null

            var program = TJS.getProgramFromFiles(
                [resolve(__dirname, ts类型文件路径)],
                { strictNullChecks: true }
            )
            var 文件筛选 = program.getSourceFiles().map(a => a.fileName)
                .filter(a => a == ts类型文件路径.replace(/\\/g, '/') || a == ts类型文件路径.replace(/\//g, '\\'))
            var generator = TJS.buildGenerator(program, { required: true }, 文件筛选)
            if (generator == null) { throw '生成schema失败' }
            var fullSymbolList = generator.getUserSymbols()

            for (var name of fullSymbolList) {
                var json_str = JSON.stringify(generator.getSchemaForSymbol(name))
                if (缓存[ts类型文件路径] == null) { 缓存[ts类型文件路径] = {} }
                缓存[ts类型文件路径]![name] = JSON.parse(json_str)
            }
        },
        async 构建缓存(ts类型文件路径: string) {
            缓存[ts类型文件路径] = null

            if (!opt.使用文件缓存) {
                r._构建缓存(ts类型文件路径)
            } else {
                var 文件缓存路径 = path.resolve(path.dirname(ts类型文件路径), path.basename(ts类型文件路径) + '.typeCheck')
                var 类型文件内容 = (await fs.promises.readFile(path.resolve(ts类型文件路径))).toString()
                var 类型文件哈希 = md5(类型文件内容)
                var 缓存文件内容: { 类型文件哈希: string, 内容: string } | null = null

                var 存在 = await new Promise((res) => { fs.exists(文件缓存路径, (data) => res(data)) })
                if (存在) {
                    缓存文件内容 = JSON.parse((await fs.promises.readFile(文件缓存路径)).toString())
                }
                if (缓存文件内容 != null && 类型文件哈希 == 缓存文件内容.类型文件哈希) {
                    缓存[ts类型文件路径] = JSON.parse(缓存文件内容.内容)
                }
                if (缓存[ts类型文件路径] == null) {
                    r._构建缓存(ts类型文件路径)
                    await fs.promises.writeFile(文件缓存路径, JSON.stringify({ 类型文件哈希, 内容: JSON.stringify(缓存[ts类型文件路径]) }))
                }
            }
        },
        async 验证(ts类型文件路径: string, 类型名称: string, 检查数据: any): Promise<ValidatorResult> {
            if (缓存[ts类型文件路径] == null || 缓存[ts类型文件路径]![类型名称] == null) {
                await r.构建缓存(ts类型文件路径)
            }

            var 检查器 = new Validator()
            var 数据验证 = 检查器.validate(检查数据, 缓存[ts类型文件路径]![类型名称])

            return 数据验证
        }
    }

    return r
}
