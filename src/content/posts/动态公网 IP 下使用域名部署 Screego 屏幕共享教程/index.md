---

title: 动态公网 IP 下使用域名部署 Screego 屏幕共享教程
published: 2026-02-26
description: "本文介绍如何在没有 80/443 端口且 IP 动态变化的情况下，利用 Armbian 设备从零搭建高性能 WebRTC 屏幕共享系统。"
image: "./Screego-LOGO.png"
tags: ["Panther-X2", "Linux", "Debian", "Screego"]
category: 教程
draft: false

---

> 封面图片来源：[Screego/server](https://github.com/screego/server/raw/master/docs/logo.png)

## 1. 简介

先跟大家唠唠 **Screego** —— 一款用Go写的自托管屏幕共享工具，基于WebRTC，延迟低、画质清，关键是轻量，不用折腾一堆依赖。

咱家用网络都懂吧？没有固定公网IP，运营商还把80、443端口封得死死的，想搭个私有共享服务，传统方法真的能把人逼疯😭。

所以这篇教程，就是专门给用 **Armbian Panther-X2** 小主机的小伙伴写的，全程用自定义端口+官方原生动态解析，不用瞎写脚本，一步步带你搭好，稳定能用，亲测跑通！

---

## 2. 环境准备

先说说我用的环境，大家对号入座，差不多就行，不用完全一致：

* **硬件设备**：Rockchip RK3566 Armbian 盒子（就是我的Panther-X2，小主机一枚，性能够用不费电）
* **系统环境**：Armbian 24.x / Linux 6.x 内核 / Debian trixie（我用的是Armbian rolling版，实测没问题）
* **网络条件**：
* 有动态公网IPv4（没有的话可以试试frp，不过本文不聊这个）
* 提前弄好DDNS域名（不然IP变了就找不到服务了）
* 路由器支持端口转发（这个是关键，不然外网访问不了）
* **小提醒**：全程用非标端口，避开被封的80/443，省得白折腾

---

## 3. 一步步安装部署

话不多说，直接上干货，每一步都能复制，小白也能跟上！

### 下载与解压

先登录Panther-X2，创建目录、下载Screego，我用的是v1.12.2版本（这个是26年1月新发布的版本，如果使用其他版本替换链接就好，但是要保证有官方原生支持的动态IP解析）：

```bash
mkdir ~/screego && cd ~/screego
wget https://github.com/screego/server/releases/download/v1.12.2/screego_1.12.2_linux_arm64.tar.gz
tar -xvf screego_1.12.2_linux_arm64.tar.gz
```

没啥难度，就是下载解压，等待完成就行，中途别乱按键盘～

### 编写配置文件

新建一个`screego.config`文件，这步最关键，别瞎改！把里面的证书路径和域名，换成你自己的就好：

```ini
# 动态IP自动解析 (把这个`share.example.com`替换成你自己的域名，要注意别把前面的`dns:`删掉了！！！)
SCREEGO_EXTERNAL_IP=dns:share.example.com

# 自定义端口，避开80/443，我用的11451，你们随便换个没被占用的就可以
SCREEGO_SERVER_ADDRESS=0.0.0.0:11451

# 安全密钥，用Linux的OpenSSL生成一个，或者自己随便写一串长字符都可以
SCREEGO_SECRET=XXXXXXXXXXXXXXXXXXXXX

# TLS证书配置，我用Let's Encrypt签的，路径替换成你自己的即可
SCREEGO_SERVER_TLS=true
SCREEGO_TLS_CERT_FILE=/etc/ssl/certs/fullchain.pem
SCREEGO_TLS_KEY_FILE=/etc/ssl/private/privkey.key

# TURN穿透，外网不黑屏全靠它！别改端口，改了容易出问题
SCREEGO_TURN_ADDRESS=0.0.0.0:3478
SCREEGO_TURN_PORT_RANGE=50000:50100

# 清空拦截规则，划重点！我之前踩坑就在这，留空才能解决外网黑屏
SCREEGO_TURN_DENY_PEERS=

# 日志和认证，默认就行，不用动
SCREEGO_LOG_LEVEL=info
SCREEGO_AUTH_MODE=turn
```

### 小吐槽

我最开始在这步栽过坑，加了行内注释，结果启动失败，折腾半天才发现，配置文件里别瞎加多余文字！

---

## 4. 配置 Systemd 服务

为了让Screego开机自启，不用每次手动启动，咱们配置个systemd服务，步骤也很简单：

先创建服务文件`vim /etc/systemd/system/screego.service`：

```ini
[Unit]
Description=Screego Screen Sharing Server
After=network.target

[Service]
Type=simple
WorkingDirectory=/root/screego
ExecStart=/root/screego/screego serve /root/screego/screego.config
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

然后执行这三条命令，启动并设置开机自启：

```bash
systemctl daemon-reload
systemctl enable --now screego
systemctl status screego
```

如果执行完`systemctl status screego`，显示“active (running)”，就说明成了，要是失败，看后面的排错步骤～

---

## 5. 端口转发 (！！！必须配置！！！)

这步千万别漏，不然外网肯定访问不了，我用的OpenWrt路由器，其他路由器操作也差不多，找到“端口转发”功能就行：

| 协议 | 外部端口 | 内部端口 | 内网 IP | 用途 |
| --- | --- | --- | --- | --- |
| TCP | 11451 | 11451 | 192.168.1.111 | 网页访问，就是你打开的链接端口 |
| UDP | 3478 | 3478 | 192.168.1.111 | WebRTC信令，穿透用的 |
| UDP | 50000-50100 | 50000-50100 | 192.168.1.111 | 视频流传输，外网不黑屏的关键 |

### 小提醒

家用路由器一定要重启一下端口转发规则，不然可能不生效，别问我怎么知道的，都是踩坑经验🤣

---

## 6. 常见问题与排错

我把我折腾过程中遇到的坑，都整理在这了，你们遇到问题直接对号入座，省得走弯路：

* **外网黑屏、内网正常**
  99%是UDP端口没开放！重点检查3478和50000-50100这两个UDP端口，路由器和服务器防火墙都要放行，我之前就是漏了防火墙，折腾了半天。

* **启动失败**
  别慌，执行`journalctl -u screego -f`查看实时日志，一般都是配置文件写错了，比如证书路径不对、域名写错了，或者加了多余注释。

* **证书错误**
  没有80端口，别用HTTP-01挑战申请证书，用DNS模式申请Let’s Encrypt，一步到位，不会报错。

* **IP变动无法访问**
  不用慌！咱们配置里用了`dns:域名`，官方会自动解析最新IP，不用写定时脚本，我最开始傻呵呵写了个脚本，后来才发现官方早就支持，纯纯多此一举😂

---

## 7. 总结

折腾完这套流程，只能说一句：真香！

这套方案的优点，我总结一下，都是实打实的：

* 不用80/443端口，完美避开运营商封锁
* 动态公网IP自动适配，不用手动重启服务，不用写脚本
* 内网、外网都能正常用，不黑屏、不卡顿
* 资源占用极低，我这Panther-X2小主机，负载才4%，完全无压力

最终实现：随时随地打开浏览器，输入域名+端口，就能共享屏幕，干净无广告，自己说了算，再也不用依赖第三方工具啦！

如果你们也在折腾Screego，或者Panther-X2小主机，欢迎评论区交流，一起避坑～
