---

title: Panther-X2 盒子 Armbian 原生搭建 WireGuard 教程实现跨网段互通
published: 2026-02-18
description: "记录在 Panther-X2 盒子上通过原生内核部署 WireGuard 的全过程，并解决与主路由 ImmortalWrt 之间的跨网段转发访问难题。"
image: ""
tags: ["Panther-X2", "WireGuard", "ImmortalWrt", "内网穿透", "网络组网"]
category: 运维笔记
draft: false

---

## 为什么折腾这个？

最近在玩 Panther-X2 这款盒子（RK3566），本来想用 Docker 跑 VPN，但发现 Debian 13 (Trixie) 的 nftables 和 Docker 容器的防火墙规则冲突得厉害。既然内核已经是 6.18 了，自带 WireGuard 模块，就没必要在容器里面较劲了，直接原生跑性能更强。

这篇文章记录下我如何通过原生方式搭好 VPN，并利用主路由静态路由彻底解决“跨网段访问”和“端口转发”的坑。

## 1. 硬件状态摸底

开工前先看一眼系统，Panther-X2 的 Armbian 固件现在做得很成熟了：

- **内核**：`6.18.8-current-rockchip64` (内核自带 WireGuard)。

- **系统**：`Debian 13 (Trixie)`。

- **物理网卡**：`end0` (注意：有些固件里叫 eth0，我这里识别为 end0，配置里一定要对上)。

- **网络环境**：主路由 ImmortalWrt (192.168.1.1)，X2 盒子作为 VPN 服务器 (192.168.1.111)。

> ![在`Panther-X2`执行`ip link`截图](./iplink.png)

## 2. 部署 WireGuard 服务端

既然内核支持，咱们直接安装[管理工具](https://github.com/angristan/wireguard-install)。

```bash
# 安装基础包
sudo apt update && sudo apt install -y wireguard qrencode

# 拉取自动化部署脚本（这个脚本可以搞定自动处理密钥生成这些）
wget [https://raw.githubusercontent.com/angristan/wireguard-install/master/wireguard-install.sh](https://raw.githubusercontent.com/angristan/wireguard-install/master/wireguard-install.sh)

chmod +x wireguard-install.sh

sudo ./wireguard-install.sh
```

**几个关键的配置坑点：**

- **Public IP**: 填你的 DDNS 域名或者公网 IP。

- **Interface**: 手动输入 `end0` (别闭眼回车，和前面硬件查到的名字对应就行)。

- **Port**: 默认 `51820` (记得去主路由防火墙开个 UDP 转发，不然家门都进不来)。

- **DNS**: 建议填主路由 IP `192.168.1.1`，这样在外面也能像在家里一样访问局域网设备。

## 3. 跨网段互通

很多人连上 VPN 后发现，虽然能上网，但主路由找不到 VPN 里的设备（10.66.66.x 段）。以前的土办法是在 X2 上写一堆 `nftables` 转发指令，但那玩意儿太难记了，主要是怕过段时间忘了当初改了什么。

**我的方案是：直接在主路由 ImmortalWrt 上加一条静态路由。**

1. 登录 **ImmortalWrt** 后台 -> **网络** -> **路由** -> **静态 IPv4 路由**。

2. 点击 **添加**：

- **对象 (Target)**: `10.66.66.0`

- **子网掩码**: `255.255.255.0`<p style="color: #e53e3e; font-weight: 600; padding: 8px 0;">注意一下，可能有些版本的 ImmortalWrt 没有子网掩码的输入栏，它采用的是 IPv4 CIDR 的书写方式，在对象 (Target) 填写 10.66.66.0/24 就行</p>

- **网关**: `192.168.1.111` (告诉路由器，想找 VPN 里的设备，去找 X2 盒子领路)。

- **接口**: `lan`。

1. **保存并应用**。

## 4. 端口转发

有了静态路由，主路由已经完全“认识” 10.66.66.x 这个段了。如果我想让公网流量直接访问我那台连着 VPN 的远程电脑（假设隧道 IP 为 10.66.66.10）：

1. 直接在 **ImmortalWrt** 的 **端口转发** 页面配置。

2. **内部 IP** 填 `10.66.66.10` 就行，不需要再转给 111 转发二次。

3. **外部端口** 随意，**内网端口** 填你电脑服务的端口（比如 TCP 的 1145）。

就这样，流量会顺着 **主路由 (1.1) -> X2 盒子 (1.111) -> 远程电脑 (10.66.66.10)** 自动流转，全程不需要在命令行里折腾防火墙。

## 5. 经验总结

- **原生才是王道**：对于 VPN 这种底层网络服务，原生内核运行的效率和稳定性远超 Docker，还少了一层 NAT 损耗。

- **图形化管理**：把规则留在路由器的 Web 界面上，比写在黑盒一样的命令行里要靠谱得多，一眼就能看出哪个端口转给了谁。

- **备份建议**：搞定后记得把 `/root/` 下生成的 `.conf` 文件和 `/etc/wireguard/` 整个目录拷出来。哪天系统被我玩挂了，几分钟就能复活~

---

> **免责声明**
> 本文记录的操作过程仅用于技术交流与个人学习环境测试。请确保在法律法规允许的范围内使用相关技术，切勿用于任何非法用途。
