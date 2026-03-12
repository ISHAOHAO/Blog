---

title: 如何利用 Docker 自建 RustDesk 远程桌面服务和免费的 RustDesk-API 网页管理页面
published: 2026-03-08
description: "本文介绍如何在自有小主机上用 Docker 搭建 RustDesk 远程桌面服务和网页 API 管理服务，并通过 Nginx 提供 HTTPS 安全访问。"
image: "./rustdesk.png"
tags: ["Docker", "RustDesk", "RustDesk-Api", "教程", "指南"]
category: 教程
draft: false

---

> 封面图片来源：[rustdesk.com](https://rustdesk.com/)

## 1. 简介

**RustDesk** 是一款开源自托管远程桌面服务，支持客户端直连或中继模式，延迟低、跨平台、无需依赖第三方服务器。

通过本教程，你可以在自有小主机上搭建 RustDesk 服务，同时通过 Nginx 做 HTTPS 代理，为管理页面提供安全访问。

最终效果：外网通过 HTTPS 访问管理页面，RustDesk 客户端可直连内网服务，内部 API 不直接暴露公网。

---

## 2. 环境准备

### 硬件与系统

* **硬件设备**：Rockchip RK3566 / 任意 Linux 服务器（本示例使用 Panther-X2 小主机）
* **操作系统**：Ubuntu 22.04 或 Debian 12
* **软件依赖**：
  * Docker ≥ 20.x
  * Docker Compose（可选，推荐）
  * Nginx ≥ 1.20（也可用 Docker 运行 Nginx）
* **网络要求**：
  * 局域网或公网访问环境
  * 路由器端口转发：本文端口示例为 `21115~21119`（可根据需要调整）
* **安全注意**：
  * 防火墙需放行相关端口
  * 使用 HTTPS 访问管理页面，内部 API 不直接暴露公网

---

## 3. 一步步安装部署

### 3.1 创建 Docker 网络

```bash
# 创建自定义 Docker 网络，便于容器间固定 IP 通信
docker network create --driver bridge --subnet 172.20.0.0/16 rustdesk_network
```

### 3.2 启动 RustDesk 服务容器

以下提供两种方式：**docker run**（快速启动）和 **docker-compose**（推荐，便于管理）。

#### 方式一：使用 docker run 命令

```bash
# 启动 HBBS（主服务器）
docker run -d --name rustdesk-hbbs \
  --network rustdesk_network --ip 172.20.0.2 \
  -p 21115:21115/tcp \
  -p 21116:21116/tcp -p 21116:21116/udp \
  -p 21118:21118/tcp \
  --restart always \
  rustdesk/rustdesk-server:latest hbbs -k _

# 启动 HBBR（中继服务器）
docker run -d --name rustdesk-hbbr \
  --network rustdesk_network --ip 172.20.0.3 \
  -p 21117:21117/tcp \
  -p 21119:21119/tcp \
  --restart always \
  rustdesk/rustdesk-server:latest hbbr -k _

# 启动 API 服务（管理接口）
docker run -d --name rustdesk-api \
  --network rustdesk_network --ip 172.20.0.4 \
  -p 21114:21114 \
  --restart always \
  -e DB_TYPE=sqlite \
  -e TZ=Asia/Shanghai \
  -e API_URL=https://desk.example.com:21113 \
  -e TRUSTED_PROXIES=* \
  -v rustdesk_api_data:/app/data \
  lejianwen/rustdesk-api:latest ./apimain
```

#### 方式二：使用 docker-compose（推荐）

创建目录并编写 `docker-compose.yml`：

```bash
mkdir -p /opt/rustdesk && cd /opt/rustdesk
nano docker-compose.yml
```

内容如下（请根据实际情况调整环境变量中的域名）：

```yaml
version: '3.8'

networks:
  rustdesk_network:
    name: rustdesk_network
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  rustdesk_data:
    name: rustdesk_data
  rustdesk_api_data:
    name: rustdesk_api_data

services:
  hbbs:
    image: rustdesk/rustdesk-server:latest
    container_name: rustdesk-hbbs
    command: hbbs -k _
    volumes:
      - rustdesk_data:/root
    ports:
      - "21115:21115"
      - "21116:21116"
      - "21116:21116/udp"
      - "21118:21118"
    networks:
      rustdesk_network:
        ipv4_address: 172.20.0.2
    environment:
      - TZ=Asia/Shanghai
    restart: unless-stopped

  hbbr:
    image: rustdesk/rustdesk-server:latest
    container_name: rustdesk-hbbr
    command: hbbr -k _
    volumes:
      - rustdesk_data:/root
    ports:
      - "21117:21117"
      - "21119:21119"
    networks:
      rustdesk_network:
        ipv4_address: 172.20.0.3
    environment:
      - TZ=Asia/Shanghai
    restart: unless-stopped

  rustdesk-api:
    image: lejianwen/rustdesk-api:latest
    container_name: rustdesk-api
    restart: unless-stopped
    ports:
      - "21114:21114"
    volumes:
      - rustdesk_api_data:/app/data
    networks:
      rustdesk_network:
        ipv4_address: 172.20.0.4
    environment:
      - DB_TYPE=sqlite
      - TZ=Asia/Shanghai
      - API_URL=https://desk.example.com:21113   # 替换为你的域名和 HTTPS 端口
      - TRUSTED_PROXIES=*
    depends_on:
      - hbbs
      - hbbr
```

启动服务：

```bash
docker-compose up -d
```

### 3.3 配置 Nginx HTTPS 代理

#### 准备 SSL 证书

将你的 SSL 证书（`fullchain.pem` 和 `private.key`）放置在宿主机的 `/root/SSL/` 目录下（也可自定义路径）。

#### 运行 Nginx 容器（或使用宿主机 Nginx）

这里以 Docker 方式运行 Nginx 为例，便于与 RustDesk 容器网络互通。

创建 Nginx 配置目录：

```bash
mkdir -p /opt/nginx/conf.d /opt/nginx/ssl /opt/nginx/logs
cp /root/SSL/* /opt/nginx/ssl/   # 或使用符号链接
```

创建 Nginx 的 `docker-compose.yml`（`/opt/nginx/docker-compose.yml`）：

```yaml
services:
  nginx:
    image: nginx:latest
    container_name: nginx-proxy
    restart: always
    ports:
      - "80:80"
      - "443:443"
      - "21113:21113"          # 映射 HTTPS 管理端口
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./conf.d:/etc/nginx/conf.d:ro
      - ./logs:/var/log/nginx
      - /root/SSL:/etc/nginx/ssl:ro   # 挂载证书目录
    networks:
      - proxy_network
      - rustdesk_network        # 加入 RustDesk 网络以访问 API 容器

networks:
  proxy_network:
    external: true
  rustdesk_network:
    external: true
```

> 注意：需要预先创建外部网络 `proxy_network`（用于其他服务）和 `rustdesk_network`：
>
> ```bash
> docker network create proxy_network
> docker network create rustdesk_network
> ```

在 `/opt/nginx/conf.d/` 下创建 `rustdesk.conf`：

```nginx
server {
    listen 21113 ssl;
    http2 on;
    server_name desk.example.com;   # 替换为你的域名

    ssl_certificate     /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/private.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://rustdesk-api:21114/;   # 通过容器名访问
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_read_timeout 300s;
    }
}
```

启动 Nginx 容器：

```bash
cd /opt/nginx
docker-compose up -d
```

### 3.4 验证部署

#### 验证容器间通信

```bash
docker exec -it rustdesk-api ping rustdesk-hbbs
docker exec -it rustdesk-api ping rustdesk-hbbr
```

#### 访问管理页面

浏览器打开 `https://desk.example.com:21113`，应显示 RustDesk API 管理页面（首次访问需设置管理员密码，或使用命令行重置）。

#### 获取中继服务器 Key

```bash
docker logs rustdesk-hbbs | grep "Key"
```

记录下 Key，后续配置客户端时需要。

---

## 4. 常见问题与排错

### 容器无法启动

* 检查端口是否被占用：`ss -tulnp | grep 2111`
* 查看容器日志：`docker logs 容器名`

### Nginx 无法启动或报错

* 测试配置：`docker exec nginx-proxy nginx -t`
* 查看错误日志：`docker exec nginx-proxy tail -f /var/log/nginx/error.log`
* 确保证书路径正确（容器内路径，如 `/etc/nginx/ssl/...`）

### HTTPS 无法访问（502 或连接失败）

* 检查 Nginx 容器是否已加入 `rustdesk_network`：`docker network inspect rustdesk_network`
* 确认 Nginx 容器已映射相应端口（如 `21113:21113`）
* 从 Nginx 容器内测试连通性：`docker exec nginx-proxy curl http://rustdesk-api:21114`

### RustDesk 客户端无法连接

* 确认客户端配置的服务器地址、端口、Key 正确
* 检查防火墙是否放行相关端口（21115~21119）

---

## 5. 管理 API 管理员密码

首次登录或需要重置密码时，可使用以下命令：

```bash
docker exec -it rustdesk-api ./apimain reset-admin-pwd 你的新密码
```

默认用户名 `admin`，密码即为你设置的值。

---

## 6. 总结

通过本教程，你成功搭建了：

* RustDesk 内网远程桌面服务（HBBS + HBBR）
* RustDesk-API 网页管理界面
* Nginx HTTPS 代理，安全访问管理页面
* Docker 容器固定 IP，便于服务间通信

最终实现：在小主机上自建远程桌面服务，安全、轻量、易扩展。只需类似方法，你可以添加更多服务并通过 Nginx 统一提供 HTTPS 访问。

> **特别感谢**：本文根据实际部署经验修订，确保步骤准确、无遗漏。如有问题，欢迎留言交流。
