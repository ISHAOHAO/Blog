---

title: 如何利用 Docker 自建 RustDesk 远程桌面服务和免费的RustDesk-API的网页管理页面
published: 2026-03-08
description: "本文介绍如何在自有小主机上用 Docker 搭建 RustDesk 远程桌面服务和网页API管理服务，并通过 Nginx 提供API管理服务的 HTTPS 访问。"
image: "./rustdesk.png"
tags: ["Docker", "RustDesk", "RustDesk-Api","教程", "指南"]
category: 教程
draft: false

---

> 封面图片来源：[rustdesk.com](https://rustdesk.com/)

## 1. 简介

**RustDesk** 是一款开源自托管远程桌面服务，支持客户端直连或中继模式，延迟低、跨平台、无需第三方服务器。  

通过本教程，你可以在自有小主机上搭建 RustDesk 服务，同时通过 Nginx 做 HTTPS 代理，为管理页面提供安全访问。  

最终效果：外网访问 HTTPS 页面查看管理 API，RustDesk 客户端可直连内网服务，无需暴露 HTTP API。

---

## 2. 环境准备

### 硬件与系统

* **硬件设备**：Rockchip RK3566 / 或任意 Linux 服务器（本示例使用 Panther-X2 小主机）  
* **操作系统**：Ubuntu 22.04 或 Debian 12  
* **软件依赖**：
  * Docker ≥ 20.x
  * Docker Compose（可选）
  * Nginx ≥ 1.20  
* **网络要求**：
  * 局域网或公网访问环境
  * 路由器端口转发：本文端口示例为 21110~21117（可替换）  
* **安全注意**：
  * SELinux、UFW、防火墙需确保相关端口开放
  * 使用 HTTPS 访问管理页面，内部 API 不直接暴露公网

---

## 3. 一步步安装部署

### 创建 Docker 网络

```bash
# 创建自定义 Docker 网络，保证固定 IP 分配
docker network create --driver bridge --subnet 172.21.0.0/16 rustdesk-local
````

### 启动 RustDesk 容器

```bash
# 启动 HBBS（主服务器）
docker run -d --name rustdesk-hbbs \
  --network rustdesk-local --ip 172.21.0.2 \
  -p 21111:21111/tcp \
  -p 21112:21112/udp \
  rustdesk/rustdesk-server:latest hbbs -k _

# 启动 HBBR（中继服务器）
docker run -d --name rustdesk-hbbr \
  --network rustdesk-local --ip 172.21.0.3 \
  -p 21113:21113/tcp \
  -p 21113:21113/udp \
  rustdesk/rustdesk-server:latest hbbr -k _

# 启动 API 服务（管理接口）
docker run -d --name rustdesk-api \
  --network rustdesk-local --ip 172.21.0.4 \
  -p 0.0.0.0:21114:21114 \
  lejianwen/rustdesk-api:latest ./apimain
```

### 配置 Nginx HTTPS 代理

`/etc/nginx/conf.d/desk.conf` 示例：

```nginx
server {
    listen 21115 ssl http2;
    server_name desk.example.com;

    ssl_certificate      /root/SSL/fullchain.pem;
    ssl_certificate_key  /root/SSL/private.key;

    # 将所有请求转发到 RustDesk API 容器
    location / {
        proxy_pass http://172.21.0.4:21114/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }
}
```

> 注意：
>
> * `desk.example.com` 替换为你的域名
> * `21115` 可换成你想要的 HTTPS 端口
> * 内部 API 端口仍保持 21114，不直接暴露公网

### 测试 Nginx 配置并重载

```bash
nginx -t
systemctl reload nginx
```

访问：

```
https://desk.example.com:21115/
```

应该可以打开 RustDesk 管理页面。

### 验证容器间通信

```bash
docker exec -it rustdesk-api sh
ping rustdesk-hbbs
ping rustdesk-hbbr
```

> 如果能 ping 通，说明 Docker 网络和容器固定 IP 配置成功。

---

## 4. 常见问题与排错

* **容器无法启动**

  * 检查端口是否被占用：`ss -tulnp | grep 2111`
  * 容器日志：`docker logs rustdesk-hbbs` / `docker logs rustdesk-hbbr` / `docker logs rustdesk-api`

* **Nginx 启动失败**

  * 检查 `nginx -t` 输出
  * `http2` 必须跟在 `listen` 指令后，不能单独一行

* **外网访问 HTTPS 页面失败**

  * 确认路由器端口转发规则正确
  * 防火墙放行 HTTPS 端口

* **RustDesk 客户端无法连通**

  * 确认 Docker 容器间通信正常
  * 确认 HBBS/HBBR 映射的 TCP/UDP 端口已放行

---

## 5. 总结

通过本教程，你可以快速搭建：

* RustDesk 内网远程桌面服务
* Nginx 代理提供 HTTPS 访问管理页面
* Docker 容器固定 IP，方便 API 和服务交互
* 外网访问安全、内部 API 不直接暴露

最终实现：在小主机上自建远程桌面服务，安全、轻量、易扩展，只需添加 `.conf` 文件即可扩展其他服务，管理页面通过 HTTPS 安全访问。
