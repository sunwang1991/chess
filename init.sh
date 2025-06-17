#! /bin/bash

project=ddrun

start() {
    echo "[检测] node version"
    node -v
    if [ $? -eq 0 ] ;
    then
        echo "[node ok]"
    else 
        echo "[开始安装node]"
        wget https://nodejs.org/dist/v16.13.0/node-v16.13.0-linux-x64.tar.xz
        tar -vxf node-v16.13.0-linux-x64.tar.xz
        mv ./node-v16.13.0-linux-x64 /www/wwwroot/node-v16.13.0-linux-x64
        rm -rf node-v16.13.0-linux-x64.tar.xz
        ln -fs /www/wwwroot/node-v16.13.0-linux-x64/bin/node /usr/local/bin/node
        ln -fs /www/wwwroot/node-v16.13.0-linux-x64/bin/npm /usr/local/bin/npm
        npm install --registry=https://registry.npm.taobao.org
    fi
    
    # echo "[检测] pm2 version"
    # pm2 -v
    # if [ $? -eq 0 ] ;
    # then
    #     echo "[pm2 ok]"
    # else
    #     echo "[开始安装pm2]"
    #     npm install -g pm2
    #     ln -fs /www/wwwroot/node-v16.13.0-linux-x64/bin/pm2 /usr/local/bin/pm2
    #     pm2 -v
    # fi
    
    # echo "[检测] yarn version"
    # yarn -v
    # if [ $? -eq 0 ];
    # then
    #     echo "[yarn ok]"
    # else 
    #     echo "开始安装yarn"
    #     npm install -g pm2
    #     ln -fs /www/wwwroot/node-v16.13.0-linux-x64/bin/yarn /usr/local/bin/yarn
    #     yarn -v
    #     yarn config set registry http://registry.npm.taobao.org/
    # fi

    sudo npm install
   
    echo "[开始] 初始化配置..."
    sudo node ./shell.js

    echo "[服务] 安装依赖"
    cd server
    sudo npm install
    echo "[服务] 开始部署"
    sudo npm run build
    echo "[服务] 启动服务"
    sudo NODE_ENV=prod && pm2 restart ../ecosystem.config.js
    
    echo "[后台] 安装依赖"
    cd ../admin
    sudo npm install
    echo "[后台] 开始部署"
    sudo npm run build

    echo "[完成] 请配置nginx来访问网站"  
    echo "- 访问网站如报错502，请在终端输入pm2 logs --lines 100,查看日志"
    echo "- 如问题无法解决，请加QQ群:882787576，截图询问。" 
}

start