import { Validator, ValidatorResult } from 'jsonschema'
import { resolve } from "path"
import * as TJS from "typescript-json-schema"

export default function main() {
    var 缓存: { [路径: string]: { [类型名称: string]: any } } = {}

    var r = {
        构建缓存(ts类型文件路径: string) {
            var program = TJS.getProgramFromFiles(
                [resolve(__dirname, ts类型文件路径)],
                { strictNullChecks: true }
            )
            var 文件筛选 = program.getSourceFiles().map(a => a.fileName)
                .filter(a => a == ts类型文件路径.replace(/\\/g, '/') || a == ts类型文件路径.replace(/\//g, '\\'))
            var generator = TJS.buildGenerator(program, { required: true }, 文件筛选)
            if (generator == null) { throw '生成schema失败' }
            var fullSymbolList = generator.getUserSymbols()

            if (缓存[ts类型文件路径] == null) {
                缓存[ts类型文件路径] = {}
            }
            for (var name of fullSymbolList) {
                if (缓存[ts类型文件路径][name] == null) {
                    缓存[ts类型文件路径][name] = JSON.parse(JSON.stringify(generator.getSchemaForSymbol(fullSymbolList[0])))
                }
            }
        },
        验证(ts类型文件路径: string, 类型名称: string, 检查数据: any): ValidatorResult {
            if (缓存[ts类型文件路径] == null || 缓存[ts类型文件路径][类型名称] == null) {
                r.构建缓存(ts类型文件路径)
            }

            var 检查器 = new Validator()
            var 数据验证 = 检查器.validate(检查数据, 缓存[ts类型文件路径][类型名称])

            return 数据验证
        }
    }

    return r
}
