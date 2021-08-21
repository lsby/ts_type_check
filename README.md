# ts_type_check

在ts中, 运行时检查数据类型.

## 安装

```shell
npm i @lsby/ts_type_check
```

## 使用

先编写类型文件:

```typescript
// data.ts

export interface 请求数据 { a: number, b: number }
export interface 返回数据 { 结果: number }
```

然后编写程序:

```typescript
// index.ts

import path from "path"
import ts_type_check from "@lsby/ts_type_check"

async function main() {
    var 验证器 = ts_type_check({ 使用文件缓存: true })
    验证器.构建缓存(path.resolve(__dirname, './data.ts'))
    var 结果 = await 验证器.验证(path.resolve(__dirname, './data.ts'), '请求数据', { a: 1, b: 1 })
    console.log(结果)
}

main()
```

## 注意事项

- 类型声明必须写在单独的文件里.
- 验证前程序会读取类型文件和解析格式描述, 速度较慢, 但可以通过`构建缓存`函数进行缓存.
- 创建验证器时需要配置是否使用文件缓存, 推荐true.
  - 文件缓存将生成`<ts类型文件名>.typeCheck`文件, 会记录ts类型文件的md5, 当发现文件变化后会重新生成.
- 如果未调用构建缓存, 直接进行验证的话, 会在第一次验证时构建缓存.

## 引用

- https://github.com/YousefED/typescript-json-schema
- https://github.com/tdegrunt/jsonschema
