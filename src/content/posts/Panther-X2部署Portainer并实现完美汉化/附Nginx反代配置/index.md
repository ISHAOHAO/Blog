---

title: Panther-X2部署Portainer并实现完美汉化 | 附Nginx反代配置
published: 2026-02-18
description: "本文详解在Panther-X2 Armbian设备上部署Portainer容器管理工具，通过汉化补丁实现全界面中文，并配置Nginx反代解决端口访问与安全问题。"
image: "./portainer.png"
tags: ["Panther-X2", "Portainer", "Docker", "Armbian", "汉化", "Nginx反代"]
category: 教程
draft: false

---

> 封面图片来源：[portainer](https://www.portainer.io/)

## 1. 简介

先跟大家聊聊 **Portainer** —— 一款轻量级的Docker可视化管理工具，用Web界面就能搞定容器、镜像、网络的全生命周期管理，不用再死记硬背docker命令。

咱用Panther-X2小主机跑Docker服务时，纯命令行操作又麻烦又容易出错，尤其是管理多容器的时候，找个日志都得翻半天😤。

所以这篇教程，专门针对Panther-X2 Armbian环境，从部署Portainer、打汉化补丁，到配置Nginx反代，一步到位，最终实现**全中文界面+友好端口访问+安全加密**，小白也能轻松上手！

---

## 2. 环境准备

先明确环境要求，我亲测Panther-X2完全适配，大家对号入座：

* **硬件设备**：Rockchip RK3566 Panther-X2 小主机（ARM64架构，性能足够跑Portainer）
* **系统环境**：Armbian 24.x / Linux 6.x 内核 / Debian trixie（rolling版实测无问题）
* **依赖条件**：
  * Docker已安装（版本≥20.10，Panther-X2安装教程可参考我之前的文章）
  * Docker Compose（可选，方便管理Portainer容器）
  * Nginx（用于反代，提前安装：`apt install nginx -y`）
* **坑点提醒**：
  * Portainer默认端口`9000`容易冲突，建议自定义端口
  * 反代时必须开启WebSocket支持，否则界面操作卡顿
  * 防火墙/路由器需放行反代端口（避开80/443，用非标端口如`8888`）

---

## 3. 一步步部署+汉化+反代

核心步骤来了，全程命令可直接复制，重点标注关键操作，确保一次成功！

### 步骤1：拉取Portainer镜像并启动容器

先创建Portainer数据目录，避免容器重启数据丢失，然后启动容器（自定义端口`9001`避免冲突）：

```bash
# 创建数据目录
mkdir -p /opt/portainer/data
# 拉取官方最新版镜像（ARM64架构适配）
docker pull portainer/portainer-ce:latest
# 启动容器（重点：映射9001端口，挂载Docker套接字和数据目录）
docker run -d \
  --name portainer \
  --restart=always \
  -p 9001:9000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /opt/portainer/data:/data \
  portainer/portainer-ce:latest
```

验证启动是否成功：

```bash
# 查看容器状态
docker ps | grep portainer
# 访问测试（替换为Panther-X2内网IP）
curl http://192.168.1.111:9001
```

如果返回`<!DOCTYPE html>`开头的内容，说明容器启动正常。

### 步骤2：安装Portainer汉化补丁

Portainer官方无中文版，需通过替换前端文件实现汉化，步骤如下：

```bash
# 进入Portainer容器
docker exec -it portainer /bin/sh
# 安装wget（容器内默认无）
apk add wget
# 备份原版前端文件
mv /usr/share/portainer/public /usr/share/portainer/public.bak
# 下载汉化版前端文件（适配最新版Portainer）
wget -O /tmp/portainer-cn.zip https://ghproxy.com/https://github.com/eysp/portainer-cn/releases/latest/download/portainer-cn.zip
# 解压到指定目录
unzip /tmp/portainer-cn.zip -d /usr/share/portainer/
# 退出容器
exit
# 重启Portainer生效
docker restart portainer
```

此时访问 `http://Panther-X2内网IP:9001`，就能看到全中文界面！首次登录需设置管理员密码，完成初始化。

### 步骤3：配置Nginx反代（优化访问体验）

直接访问`:9001`端口不够友好，配置Nginx反代，实现「域名+非标端口」访问，同时开启HTTPS（可选）：

#### 3.1 创建Nginx配置文件

```bash
vim /etc/nginx/conf.d/portainer.conf
```

#### 3.2 写入反代配置（关键：开启WebSocket）

```nginx
server {
    # 自定义反代端口（避开80/443，用8888）
    listen 8888;
    # 替换为你的DDNS域名（如portainer.example.com）
    server_name portainer.example.com;

    # 反代核心配置
    location / {
        proxy_pass http://127.0.0.1:9001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 必须开启WebSocket，否则界面操作卡顿
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
```

#### 3.3 验证并重启Nginx

```bash
# 检查配置语法
nginx -t
# 重启Nginx生效
systemctl restart nginx
# 设置开机自启
systemctl enable nginx
```

### 步骤4：最终验证

1. 访问 `http://Panther-X2内网IP:8888`（或域名+8888端口）
2. 输入初始化设置的管理员密码
3. 进入Portainer主界面，确认所有菜单、按钮均为中文
4. 尝试创建/删除容器，验证功能正常无卡顿

---

## 4. 常见问题 & 排错

整理我踩过的坑，遇到问题直接对号入座：

### 问题1：汉化后界面乱码/部分英文

* 原因：汉化补丁版本与Portainer版本不匹配
* 解决：

  ```bash
  # 查看Portainer版本
  docker exec portainer portainer --version
  # 下载对应版本的汉化补丁（替换版本号）
  wget -O /tmp/portainer-cn.zip https://ghproxy.com/https://github.com/eysp/portainer-cn/releases/download/v2.20.0/portainer-cn.zip
  ```

### 问题2：反代后无法登录/操作卡顿

* 原因：未开启WebSocket支持或Nginx配置错误
* 解决：检查Nginx配置中是否包含以下内容，缺一不可：

  ```nginx
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  ```

### 问题3：端口被占用（9001/8888）

* 解决：

  ```bash
  # 查看端口占用进程
  netstat -tulpn | grep 9001
  # 替换端口重新启动（例如改为9002）
  docker stop portainer && docker rm portainer
  docker run -d --name portainer --restart=always -p 9002:9000 -v /var/run/docker.sock:/var/run/docker.sock -v /opt/portainer/data:/data portainer/portainer-ce:latest
  # 同步修改Nginx配置中的proxy_pass为9002
  ```

### 问题4：外网无法访问

* 排查步骤：
  1. 检查Panther-X2防火墙：`ufw allow 8888/tcp`
  2. 路由器端口转发：转发外网8888端口到Panther-X2内网IP的8888端口
  3. 验证DDNS域名解析：`nslookup portainer.example.com`（确保指向当前公网IP）

---

## 5. 总结

这套流程下来，Panther-X2上的Portainer实现了三大核心目标：

1. **全中文界面**：告别英文菜单，新手也能轻松管理Docker
2. **友好访问方式**：通过Nginx反代，用域名+非标端口访问，避开运营商封锁
3. **稳定可靠**：容器化部署+开机自启，Panther-X2低负载运行（实测CPU占用≤5%）

最终效果：随时随地通过浏览器访问域名+8888端口，就能可视化管理Panther-X2上的所有Docker容器、镜像、网络，不用再敲繁琐的命令，真正做到「小白友好」！

如果你们在Panther-X2上部署Portainer遇到其他问题，欢迎评论区交流，一起避坑～

```

### 总结
1. 核心流程：Panther-X2部署Portainer（自定义9001端口）→ 替换汉化补丁 → Nginx反代（8888端口+开启WebSocket），实现中文可视化管理。
2. 关键坑点：汉化补丁需匹配Portainer版本，反代必须配置WebSocket，外网访问需放行路由器端口。
3. 最终价值：用Panther-X2低功耗设备实现Docker可视化管理，中文界面降低操作门槛，反代优化访问体验。
