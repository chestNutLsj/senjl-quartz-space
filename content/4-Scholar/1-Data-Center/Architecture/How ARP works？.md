---
date: 2024-10-04
tags:
  - ARP
  - Protocols
  - Network
publish: "true"
---
## ARP 的作用

Most computer programs/applications use logical addresses (*IP Addresses*) to send/receive messages. However, the actual communication happens over the Physical Address (*MAC Address*) from layer 2 of the OSI model. So the mission is to get the destination MAC Address which helps communicate with other devices. This is where ARP comes into the picture; **its functionality is to translate IP addresses into physical addresses**.

## ARP 相关的术语

![[How ARP works-ARP-packet.png]]

***Reverse ARP*** is a protocol that is used in LAN by client machines for requesting IP Address from Router’s ARP Table. Whenever a new machine comes, which requires an IP Address for its use. In that case, the machine sends a RARP broadcast packet containing MAC Address in the sender and receiver hardware field.
>客户机用 RARP 从 LAN 的路由器的 ARP 表中请求 IP 地址。
>
>当 LAN 中新添加一个机器时，它只要进行通信就需要获取 IP 地址，此时就需要发送 RARP 广播包（在其发送方和接收方硬件地址域中包含 MAC 地址）

***Proxy ARP*** works to enable devices that are separated into network segments connected through the router in the same IP to resolve IP Address to MAC Address. Proxy ARP is enabled so that the ‘proxy router’ resides with its MAC address in a local network as it is the desired router to which broadcast is addressed. In case, when the sender receives the MAC Address of the Proxy Router, it is going to send the datagram to Proxy Router, which will be sent to the destination device.
>PARP 让通过路由器连接到同一 IP 网段中的设备将 IP 地址解析为 MAC 地址。
>
>启用 PARP 后，proxy router 将以其 MAC 地址驻留在本地网络中，因为它是广播寻址所需的路由器。如果发送方收到代理路由器的 MAC 地址，就会将数据报发送到代理路由器，然后再发送到目标设备。

***Inverse ARP*** uses MAC Address to find the IP Address, it can be simply illustrated as Inverse ARP is just the inverse of ARP. In ATM (Asynchronous Transfer Mode) Networks, Inverse ARP is used by default. Inverse ARP helps in finding Layer-3 Addresses from Layer-2 Addresses.
>IARP 能从 MAC 地址找到 IP 地址。在异步传输模式的网络中，IARP 默认开启。

## 链路层寻址和 ARP

![[60-Link-layer-and-LAN#链路层寻址和 ARP]]

## ARP 欺骗与 ARP 缓存中毒

**ARP Spoofing** is a type of falseness of a device in order to link the attacker’s MAC Address with the IP Address of the computer or server by broadcasting false ARP messages by the hacker. Upon successful establishment of the link, it is used for transferring data to the hacker’s computer. It is simply called Spoofing.
>ARP 欺骗是一种伪造设备的行为，黑客通过广播虚假的 ARP 信息，将攻击者的 MAC 地址与计算机或服务器的 IP 地址连接起来。连接成功建立后，就可以向黑客的计算机传输数据。 这就是所谓的欺骗。

ARP can cause a greater impact on enterprises. ARP Spoofing attacks can facilitate other attacks like:
- [Man-in-the-Middle Attack](https://www.geeksforgeeks.org/mitm-man-in-the-middle-attack-using-arp-poisoning)
- [Denial of Service Attack](https://www.geeksforgeeks.org/deniel-service-prevention)
- [Session Hijacking](https://www.geeksforgeeks.org/session-hijacking)

Local Area Network that uses ARP is not safe in the case of ARP Spoofing, this is simply called as ARP Cache Poisoning.

## ARP 的优劣势

### Advantages of Using ARP

- **Efficient Communication** : ARP helps devices communicate efficiently by translating IP addresses into MAC addresses, allowing seamless communication on a network.
- **Dynamic Network Updates** : ARP dynamically updates its cache with MAC address information, allowing for changes in network topology without manual intervention.
- **Scalability** : ARP scales well with network size, enabling devices to communicate effectively in both small and large networks.
- **Compatibility** : ARP is a standard protocol used across different types of networks, ensuring compatibility and interoperability among various devices and systems.

### Disadvantages of Using ARP

- **Security** : ARP operates at a low level and can be vulnerable to various attacks, such as ARP spoofing, where attackers copy devices on the network to intercept or manipulate data.
- **Broadcast Traffic** : ARP uses broadcast messages to discover MAC addresses, which can lead to increased network congestion, especially in large networks.
- **Limited Security Features** : ARP lacks robust security features, making it challenging to authenticate and verify the identity of devices on the network, leaving it susceptible to attacks.