# chenguang-agent-platform

#### 介绍
《辰光Agent平台》是企业内部整合、管理各种大模型与Agent的基础平台

#### 软件架构
软件架构说明


#### 安装教程

```sh
# 创建环境
conda create -n chenguang python=3.13
# 激活环境
conda activate chenguang

# 安装依赖
pip install -r requirements.txt
```


## 指定端口启动
```
uvicorn src.main:app --port 8080 --reload
```

## env配置
把 .env.example 复制一份 叫 .env ，修改为自己的信息即可

#### 使用说明

1.  xxxx
2.  xxxx
3.  xxxx

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request