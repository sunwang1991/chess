# 叮点跑腿小程序 v2-服务器部署教程

### 1.准备工作

请自行安装以下软件

- 安装 nodejs-v16.x.x
- 安装 mysql-v8.x 或 5.7 以上版本
- 安装 redis-v5.x
- 安装 nginx-v1.18.x

### 2.克隆源代码到服务器

```
# 执行克隆
git clone https://gitee.com/landalfyao/ddrun.git
```

结果：
获得一个"ddrun"目录

### 3.安装依赖

- 安装 yarn

```
npm i -g yarn
```

- 安装依赖

```
# 进入文件夹
cd ddrun

# 安装依赖
yarn
```

### 4.修改配置

```
# 拷贝一份config.json.bak文件 并命名为config.json
cp config.json.bak config.json

# 修改文件配置内容
vim config.json

```

- 配置内容详解

```
{
  "name": "叮点跑腿", // 小程序的名称
  "opName": "叮点跑腿后台管理系统", // 后台展示的名称
  "domain": "xxx.xxx.com", // 域名
  "perfix": "http", // 小程序访问的域名前缀
  "serverPort": "8001", // 请确保此端口没有被占用
  "mysql": {
    "host": "xxx.xxx.com", // 本地mysql请填写 127.0.0.1
    "port": 3306,
    "username": "xxx",
    "password": "xxxxxx",
    "database": "ddrunv2",
    "synchronize": true, // 是否同步数据库
    "logging": false,
    "charset": "utf8mb4" // 数据库编码
  },
  "redis": {
    "client": {
      "port": 6379,
      "host": "xxx.xxx.com",
      "password": "xxxxxx",
      "db": 0
    }
  }
}

```

- 修改完后保存即可

#### 4.1 上传微信支付 API 证书

- 上传 微信支付 API 证书 到 cert/目录下 必须包含以下文件且命名参考以下文件
- - apiclient_cert.p12
- - apiclient_cert.pem
- - apiclient_key.pem

### 5.配置 ssl 证书(测试可忽略此步骤)

- 将网站上下载的 ssl 文件.crt,.pem,.csr,.key 复制到 ddrun/ssl/目录下

### 6.部署

```
# linux服务器可以使用shell脚本安装
# 先给权限
sudo chmod a+x init.sh
sudo ./init.sh


# 如果以上安装不行，尝试普通安装，如下：
# 开始部署
yarn install
yarn start

```

- 部署失败解决方案

```
# 如果出现以下情况
【服务构建】 /bin/sh: midway-bin: command not found

# 手动构建服务
cd server
yarn build
cd ..
yarn server-start
```

```
# 如果出现以下情况
【后台构建】 /bin/sh: nuxt: command not found

# 手动构建后台
cd admin
yarn build
```

- 执行完成后将生成 nginx.conf 配置

### 7.nginx 配置

```
# 找到nginx中的nginx.conf并编辑
# 以下为ubuntu系统的默认nginx安装位置，其他系统请自行百度查找
vim /etc/nginx/nginx.conf

```

- 在文件中引入第 6 步生成的 nginx.conf

```
...
http{
   ...

   include /ddrun/nginx.conf;
}
...
```

如果没有 ssl 文件，请不要执行以下操作

- 重启 nginx

### 8.更新代码

```
# 到项目更目录
cd ddrun
# 拉取更新
git pull origin master
# 部署(不会影响数据库和redis)
yarn start
```
