$Env:http_proxy="http://127.0.0.1:7890";
$Env:https_proxy="http://127.0.0.1:7890"


未使用代理的终端：
![[terminal-proxy-false.png]]

在Clash中打开终端代理的情况：
![[terminal-success-proxy-by-clash.png]]

在系统环境变量中添加`http_proxy`和`https_proxy`之后打开的普通终端：
![[terminal-success-after-sysenv.png]]

添加方法：
![[sysenv-proxy-variety.png]]
