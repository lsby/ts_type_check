# ts_type_check

在 ts 中, 运行时检查数据类型.

## 安装

```shell
npm i @lsby/ts_type_check
```

## 使用

先编写类型文件:

```typescript
// data.ts

export interface 请求数据 {
  a: number
  b: number
}
export interface 返回数据 {
  结果: number
}
```

然后编写程序:

```typescript
// index.ts

import path from 'path'
import ts_type_check from '@lsby/ts_type_check'

async function main() {
  var 验证器 = ts_type_check(path.resolve(__dirname, './data.ts'))
  验证器.构建缓存()
  var 结果1 = await 验证器.验证('请求数据', { a: 1, b: 1 })
  console.log(结果1)
  var 结果2 = await 验证器.验证('返回数据', { 结果: 2 })
  console.log(结果2)
}

main()
```

## 注意事项

- 类型声明必须写在单独的文件里.
- 验证前程序会读取类型文件和解析格式描述, 速度较慢, 因此使用了缓存文件.
  - 缓存文件名为`<ts类型文件名>.typeCheck`, 记录类型文件的 md5, 当发现文件变化后会重新生成.
  - 可以在适当的时机调用`构建缓存`函数手动进行缓存.
  - 如果未调用构建缓存, 直接进行验证的话, 会在第一次验证时构建缓存.
- 细节
  - 当调用验证时, 会查看缓存变量中有没有对应的 schema 数据.
  - 若缓存变量中有对应的 schema 数据, 则直接进行验证. (完)
  - 若缓存变量中没有对应的 schema 数据, 则读取 ts 文件和 typeCheck 文件.
  - 若 typeCheck 文件不存在, 则将 ts 文件转换为 typeCheck 文件并保存, 同时将 schema 写入缓存变量, 进行验证. (完)
  - 若 typeCheck 文件存在, 则计算 ts 文件的 md5, 与 typeCheck 文件中记录的 md5 比对.
  - 若哈希匹配, 则读取 typeCheck 文件中的 schema, 写入缓存变量, 进行验证. (完)
  - 若哈希不匹配, 则将 ts 描述转换为 typeCheck 文件并保存, 同时将 schema 写入缓存变量, 进行验证. (完)
- 总结
  - 当缓存变量命中时, 会直接通过内存验证. (纯内存运算)
  - 当缓存文件存在且 ts 类型文件没有修改时, 只会读取缓存过的 schema. (稍慢)
  - 当缓存文件不存在或 ts 类型文件有修改时, 才会进行 schema 的重生成. (最慢)
  - 无论如何, 程序不重启的前提下, 只有第一次使用验证时, 会读取文件, 并有可能重新生成 schema 文件, 之后都是纯内存运算.

## 引用

- https://github.com/YousefED/typescript-json-schema
- https://github.com/tdegrunt/jsonschema
