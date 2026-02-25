---

title: 在动态公网 IP 环境下部署高性能 Screego 屏幕共享服务
published: 2026-02-25
description: "本文介绍如何在没有 80/443 端口且 IP 动态变化的情况下，利用 Armbian 设备从零搭建高性能 WebRTC 屏幕共享系统。"
image: "./Screego-LOGO.png"
tags: ["Panther-X2", "Linux", "Debian", "Screego"]
category: 教程
draft: false

------

> 封面图片来源：[Screego/](https://github.com/screego/server/raw/master/docs/logo.png)

## 1. 简介

**Screego** 是一款基于 Go 语言开发的自托管、高性能屏幕共享服务，它利用 WebRTC 技术实现低延迟、高清画质的实时共享。

在没有固定公网 IP 且 ISP 封锁了 80/443 端口的家庭网络环境下，传统的部署方式往往难以行通。本文将带你通过“自定义端口 + 动态 IP 自动同步脚本”的方案，在 Armbian 设备上搭建一个生产环境可用的 Screego 服务，最终实现随时随地通过域名进行流畅的屏幕共享。

---

## 2. 环境准备

* **硬件设备**：基于 Rockchip RK3566 的 Armbian Linux 盒子（Panther-X2）。
* **系统环境**：Armbian 24.x (Linux 6.x 内核) / Debian trixie。
* **网络条件**：
  * 拥有公网 IPv4（动态地址）/ 如果没有可以尝试使用各第三方的frp服务。
  * 已配置 DDNS（如 DDNS-GO）。
  * **关键点**：需要路由支持端口转发（Port Forwarding）。
* **安全注意**：需提前规划好非标端口（如 `8443` 用于 HTTPS，`3478` 用于 WebRTC 信令）。

---

## 3. 一步步安装部署

### 下载与解压

首先，进入设备下载适用于 ARM64 架构的二进制文件（这里我们使用26年1月1日发布的最新1.12.2版本）：

```bash
mkdir ~/screego && cd ~/screego
wget [https://github.com/screego/server/releases/download/v1.12.2/screego_1.12.2_linux_arm64.tar.gz](https://github.com/screego/server/releases/download/v1.12.2/screego_1.12.2_linux_arm64.tar.gz)
tar -xvf screego_1.12.2_linux_arm64.tar.gz

```

### 编写配置文件

创建 `screego.config`，注意替换你的 **SSL 证书路径** 和 **虚拟域名**：

```ini
# 基础运行配置
SCREEGO_SERVER_ADDRESS=0.0.0.0:8443
SCREEGO_SECRET=A_Random_Long_String_For_Security

# TLS 证书配置 
# 使用已有证书，如果没有证书的话，搜索下怎么获取SSL证书，这里就不过多阐述了
SCREEGO_TLS=true
SCREEGO_TLS_CERT_FILE=/etc/ssl/certs/fullchain.pem
SCREEGO_TLS_KEY_FILE=/etc/ssl/private/privkey.key

# WebRTC 穿透配置
SCREEGO_TURN_ADDRESS=0.0.0.0:3478
SCREEGO_TURN_PORT_RANGE=50000:50100

# 注意：SCREEGO_EXTERNAL_IP 将由启动脚本动态注入，此处无需手动填写固定值

```

### 解决动态 IP 的问题：自动同步脚本

由于公网 IP 会变动，我们编写一个监控脚本 `check_ip.sh`，当发现域名解析地址变化时自动重启服务。

```bash
#!/bin/bash
DOMAIN="share.example.com" # 这里填写你的域名
IP_FILE="/tmp/screego_last_ip"
CURRENT_IP=$(dig +short $DOMAIN | tail -n1)

if [ -z "$CURRENT_IP" ]; then exit 0; fi

LAST_IP=$(cat $IP_FILE 2>/dev/null)

if [ "$CURRENT_IP" != "$LAST_IP" ]; then
    echo "IP Changed: $LAST_IP -> $CURRENT_IP. Restarting Screego..."
    echo "$CURRENT_IP" > $IP_FILE
    systemctl restart screego
fi

```

### 配置 Systemd 后台运行

创建服务文件 `/etc/systemd/system/screego.service`，实现开机自启与动态 IP 注入：

```ini
[Unit]
Description=Screego Screen Sharing Server
After=network.target

[Service]
Type=simple
WorkingDirectory=/root/screego
# 启动前清理旧 IP 记录并获取当前最新解析 IP
ExecStartPre=/usr/bin/rm -f /tmp/screego_last_ip
ExecStart=/bin/bash -c 'export SCREEGO_EXTERNAL_IP=$(dig +short share.example.com | tail -n1); exec /root/screego/screego serve /root/screego/screego.config'
Restart=always

[Install]
WantedBy=multi-user.target

```

---

## 4.开放端口

### 使用你的路由(如OpenWrt)开放以下端口

| 协议 | 外部端口 | 内部端口 | 内部 IP (Panther-X2) | 作用 |
| --- | --- | --- | --- | --- |
| **TCP** | `8443` | `8443` | `192.168.1.124` | 网页访问 |
| **UDP** | `3478` | `3478` | `192.168.1.124` | WebRTC 信令/穿透 |
| **UDP** | `50000-50100` | `50000-50100` | `192.168.1.124` | 媒体传输数据流 |

---

## 5. 常见问题 & 排错

* **无法建立视频连接**：
这是最常见的问题，通常是因为 **UDP** 端口没有开放。需要检查你的路由的端口转发，确保 `3478 (UDP)` 和 `50000-50100 (UDP)` 均正确指向服务器内网 IP。
* **证书报错**：
由于 80 端口被封锁，建议使用 DNS-01 挑战方式申请 Let's Encrypt 证书。
* **启动失败**：
运行 `journalctl -u screego -f` 查看实时日志。如果提示 `invalid SCREEGO_EXTERNAL_IP`，说明 `dig` 命令未能成功解析域名，需安装 `dnsutils` 包。

### 这样就完整了在动态公网 IP 环境下部署 Screego 服务
