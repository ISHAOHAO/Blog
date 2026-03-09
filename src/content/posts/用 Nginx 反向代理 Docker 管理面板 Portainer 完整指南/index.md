---

title: 用 Nginx 反向代理 Docker 管理面板 Portainer 完整指南
published: 2026-03-08
description: "本文详细介绍如何在 ArmBian 系统上使用 Docker Compose 部署 Portainer，并通过 Nginx 反向代理实现通过域名访问，打造干净可扩展的容器管理架构。"
image: "./portainer.jpg"
tags: ["Panther-X2", "Docker", "Portainer", "Nginx", "反向代理", "ArmBian"]
category: 教程
draft: false

---

> 封面图片来源：[portainer](https://www.portainer.io/)

## 1. 简介

**Portainer** 是一个轻量级的 Docker 容器管理面板，通过 Web 界面让你像点外卖一样管理容器、镜像、网络和卷，再也不用背那些长长的 Docker 命令。

**Nginx** 作为高性能的反向代理服务器，可以把多个 Web 服务统一通过域名+80/443端口对外暴露，配合 Portainer 简直是绝配。

本文带你从零开始，在 **Panther-X2 ArmBian** 小主机上部署 Portainer + Nginx 反向代理，最终实现通过 `http://docker.yourdomain.com` 访问管理面板，并且这套架构可以随时扩展更多服务。

---

## 2. 环境准备

先说说我用的环境，配置对号入座就行：

* **硬件设备**：Rockchip RK3566 盒子（Panther-X2，性能够用功耗低，7x24小时开机不心疼）
* **系统环境**：Armbian 24.x / Linux 6.x 内核 / Debian trixie（实测稳定运行）
* **前置要求**：
  * Docker 和 Docker Compose 已安装（没装的话参考 [官方文档](https://docs.docker.com/engine/install/debian/)）
  * 有一个内网域名（比如 `docker.lan.com` 或 `docker.home`），并在路由器做好 DNS 指向
  * 开放 80 端口（用于 Nginx 对外服务）
* **小提醒**：如果你打算外网访问，记得做好安全防护，比如配置 HTTPS 和强密码

---

## 3. 一步步安装部署

### 3.1 创建目录结构

好的架构从清晰的目录开始，我们在 `/opt/docker` 下分别管理 Nginx 和 Portainer：

```bash
# 创建主目录
mkdir -p /opt/docker/{nginx/conf.d,portainer}
cd /opt/docker
```

最终目录结构是这样的：

```bash
/opt/docker/
├── nginx/
│   ├── nginx.conf          # Nginx 主配置
│   └── conf.d/              # 站点配置文件
└── portainer/
    └── docker-compose.yml   # Portainer 服务配置

```

### 3.2 部署 Nginx 反向代理

先配置 Nginx，让它成为所有 Web 服务的统一入口。

**创建 Nginx 主配置文件** `/opt/docker/nginx/nginx.conf`：

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    sendfile on;
    keepalive_timeout 65;

    # 引入所有站点配置，这是扩展性的关键
    include /etc/nginx/conf.d/*.conf;
}
```

**创建 Portainer 的站点配置** `/opt/docker/nginx/conf.d/portainer.conf`：

```nginx
server {
    listen 80;
    server_name docker.yourdomain.com;  # 换成你的域名

    location / {
        proxy_pass http://portainer:9000;  # 通过容器名访问
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 支持 WebSocket（Portainer 的终端功能需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**创建 Nginx 的 Docker Compose 文件** `/opt/docker/nginx/docker-compose.yml`：

```yaml
services:
  nginx:
    image: nginx:latest
    container_name: nginx-proxy
    restart: always
    ports:
      - "80:80"      # HTTP 端口
      - "443:443"    # HTTPS 端口（后续可以配置证书）
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./conf.d:/etc/nginx/conf.d:ro
      - ./logs:/var/log/nginx
    networks:
      - proxy_network

networks:
  proxy_network:
    name: proxy_network
    driver: bridge
```

### 3.3 部署 Portainer

**创建 Portainer 的 Docker Compose 文件** `/opt/docker/portainer/docker-compose.yml`：

```yaml
volumes:
  portainer_data:
    name: portainer_data
    external: true

services:
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    command: -H unix:///var/run/docker.sock
    restart: always
    ports:
      - "8000:8000"  # 边缘计算功能，可选
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    networks:
      - proxy_network

networks:
  proxy_network:
    name: proxy_network
    external: true  # 使用 Nginx 创建的网络
```

### 3.4 启动所有服务

```bash
# 先启动 Nginx（会创建共享网络）
cd /opt/docker/nginx
docker-compose up -d

# 再启动 Portainer（连接到已存在的网络）
cd /opt/docker/portainer
docker-compose up -d

# 查看运行状态
docker ps
```

看到两个容器都在运行，就成功了一大半！

### 3.5 验证部署

```bash
# 测试 Nginx 配置是否正确
curl -H "Host: docker.yourdomain.com" http://localhost

# 或者直接访问
curl http://docker.yourdomain.com
```

打开浏览器访问 `http://docker.yourdomain.com`，如果能看到 Portainer 的初始化页面，恭喜你，部署成功！

---

## 4. 常见问题与排错

### Q1：Nginx 启动失败，日志报错

执行 `docker logs nginx-proxy` 查看具体错误。最常见的是配置文件语法错误，可以用这个命令检查：

```bash
docker exec nginx-proxy nginx -t
```

### Q2：Portainer 无法访问，报 502 Bad Gateway

检查两点：

* Portainer 容器是否正常运行：`docker ps | grep portainer`
* 网络是否连通：`docker network inspect proxy_network` 看两个容器是否都在网络里

### Q3：想添加新的 Web 服务怎么办？

这套架构最棒的地方就是扩展性。假设你要添加 NextCloud：

1. 在新目录 `/opt/docker/nextcloud` 创建 docker-compose.yml，确保：
   * 加入网络 `proxy_network`（`external: true`）
   * 不要映射 80/443 端口
2. 在 `/opt/docker/nginx/conf.d/` 创建 `nextcloud.conf`：

   ```nginx
   server {
       listen 80;
       server_name nextcloud.yourdomain.com;
       location / {
           proxy_pass http://nextcloud:80;
       }
   }
   ```

3. 重新加载 Nginx：`docker exec nginx-proxy nginx -s reload`

### Q4：容器开机不自启？

检查 docker-compose.yml 里是否有 `restart: always`，同时确保 Docker 服务开机自启：

```bash
systemctl enable docker
systemctl is-enabled docker
```

---

## 5. 总结

通过本文的部署，你得到了一个：

* **结构清晰**：Nginx 独立管理所有反向代理配置，Portainer 独立运行，互不干扰
* **易于扩展**：想加新服务只需要加配置文件和 conf.d 配置，不用动现有服务
* **规范统一**：所有 Web 服务统一通过域名+80端口访问，再也不用记那些乱七八糟的端口号

这套架构不仅适用于 Portainer，任何需要 Web 访问的 Docker 服务都可以用这种方式接入。从今天起，你的小主机就变成一个专业的、可扩展的家庭服务器了！

最后提醒一下：生产环境一定要配置 HTTPS（可以用 Let's Encrypt），并设置强密码，安全无小事。
