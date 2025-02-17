---

excalidraw-plugin: parsed
tags: [excalidraw]

---
==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠==


# Text Elements
OS管理进程
需要知道的信息 ^TlgaGeO5

进程位置 ^wytsg8in

进程属性 ^4xUUnzzq

取决于内存管理方案 ^S1KeJGHu

最简单（只有内存）：
进程映像保存在连续的内存块中 ^w4wNj0LZ

引入磁盘：
OS需要知道进程在内存和磁盘中的位置 ^McMcA7xq

引入分页和虚存：
进程映像一部分在内存一部分在外存，OS维护进程在每页中的位置 ^REVKDsZO

PCB管理 ^4Xy5iRhx

进程标识信息 ^ozqh7MPi

处理器状态信息 ^SsSpFPXu

进程控制信息 ^PdC1usE1

该进程PID ^Wni81zHk

父进程PID ^0owJu0s0

用户标识符UID ^xhhqZxgB

用户可见寄存器 ^UE2XDXKm

控制与状态寄存器，如PC、运算条件码、中断状态信息 ^BpJRgCOH

栈指针 ^UFcAHb01

调度和状态信息：进程运行状态、优先级、调度信息、等待事件的标识 ^fpCkbi1G

与其他进程关联的数据结构 ^ybgO5aYK

进程间通信 ^QGCWnrZ0

进程访问内存和可执行指令的权限 ^wsqQZCPI

存储管理，包含描述分配给进程的虚存的段表或页表指针 ^PrLLQzqx

资源所有权和使用情况 ^36Qoq7Oz

%%
# Drawing
```json
{
	"type": "excalidraw",
	"version": 2,
	"source": "https://github.com/zsviczian/obsidian-excalidraw-plugin/releases/tag/1.9.18",
	"elements": [
		{
			"type": "rectangle",
			"version": 211,
			"versionNonce": 1537685150,
			"isDeleted": false,
			"id": "sLWd2b91SypXJ2YLj5TUh",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -468.9940946848221,
			"y": 118.96366964473475,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 159,
			"height": 85,
			"seed": 1777238494,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 3
			},
			"boundElements": [
				{
					"type": "text",
					"id": "TlgaGeO5"
				},
				{
					"id": "DFUb164bUIrlY0Bo_7IaD",
					"type": "arrow"
				},
				{
					"id": "0N84MdefUaePyEuRtspK1",
					"type": "arrow"
				}
			],
			"updated": 1690884364444,
			"link": null,
			"locked": false
		},
		{
			"type": "text",
			"version": 222,
			"versionNonce": 2122549826,
			"isDeleted": false,
			"id": "TlgaGeO5",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -459.49404127906035,
			"y": 136.46366964473475,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 139.99989318847656,
			"height": 50,
			"seed": 638159326,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1690884364445,
			"link": null,
			"locked": false,
			"fontSize": 20,
			"fontFamily": 1,
			"text": "OS管理进程\n需要知道的信息",
			"rawText": "OS管理进程\n需要知道的信息",
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "sLWd2b91SypXJ2YLj5TUh",
			"originalText": "OS管理进程\n需要知道的信息",
			"lineHeight": 1.25,
			"baseline": 43
		},
		{
			"type": "rectangle",
			"version": 199,
			"versionNonce": 1245868190,
			"isDeleted": false,
			"id": "G1s2myioruWMFJ4KJfmM1",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -219.99409468482207,
			"y": -33.23633035526524,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 140,
			"height": 67,
			"seed": 469562270,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 3
			},
			"boundElements": [
				{
					"type": "text",
					"id": "wytsg8in"
				},
				{
					"id": "DFUb164bUIrlY0Bo_7IaD",
					"type": "arrow"
				},
				{
					"id": "xyk6nC1ATFDuRjTS-6d33",
					"type": "arrow"
				}
			],
			"updated": 1690884402876,
			"link": null,
			"locked": false
		},
		{
			"type": "text",
			"version": 166,
			"versionNonce": 131920386,
			"isDeleted": false,
			"id": "wytsg8in",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -189.99406416724395,
			"y": -12.236330355265238,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 79.99993896484375,
			"height": 25,
			"seed": 513889630,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1690884364445,
			"link": null,
			"locked": false,
			"fontSize": 20,
			"fontFamily": 1,
			"text": "进程位置",
			"rawText": "进程位置",
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "G1s2myioruWMFJ4KJfmM1",
			"originalText": "进程位置",
			"lineHeight": 1.25,
			"baseline": 18
		},
		{
			"type": "rectangle",
			"version": 217,
			"versionNonce": 899978370,
			"isDeleted": false,
			"id": "AdqVOhOJ-LUzSrz_Xx89V",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -219.99409468482207,
			"y": 371.16366964473474,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 140,
			"height": 67,
			"seed": 926021726,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 3
			},
			"boundElements": [
				{
					"type": "text",
					"id": "4xUUnzzq"
				},
				{
					"id": "0N84MdefUaePyEuRtspK1",
					"type": "arrow"
				},
				{
					"id": "s2jJtPd3oNC-zDCyfCfNQ",
					"type": "arrow"
				}
			],
			"updated": 1690884397852,
			"link": null,
			"locked": false
		},
		{
			"type": "text",
			"version": 204,
			"versionNonce": 959668674,
			"isDeleted": false,
			"id": "4xUUnzzq",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -189.99406416724395,
			"y": 392.16366964473474,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 79.99993896484375,
			"height": 25,
			"seed": 1833909406,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1690884364445,
			"link": null,
			"locked": false,
			"fontSize": 20,
			"fontFamily": 1,
			"text": "进程属性",
			"rawText": "进程属性",
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "AdqVOhOJ-LUzSrz_Xx89V",
			"originalText": "进程属性",
			"lineHeight": 1.25,
			"baseline": 18
		},
		{
			"type": "arrow",
			"version": 699,
			"versionNonce": 1390899297,
			"isDeleted": false,
			"id": "DFUb164bUIrlY0Bo_7IaD",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -356.59377822912586,
			"y": 117.96366964473475,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 135.5996835443038,
			"height": 115.80666666666667,
			"seed": 1454023490,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792670,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "sLWd2b91SypXJ2YLj5TUh",
				"focus": 1.42294902886374e-16,
				"gap": 1
			},
			"endBinding": {
				"elementId": "G1s2myioruWMFJ4KJfmM1",
				"focus": 6.888255954588285e-16,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					86.59968354430379,
					-114.5
				],
				[
					135.5996835443038,
					-115.80666666666667
				]
			]
		},
		{
			"type": "arrow",
			"version": 650,
			"versionNonce": 415075361,
			"isDeleted": false,
			"id": "0N84MdefUaePyEuRtspK1",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -367.83471968482206,
			"y": 204.96366964473475,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 146.840625,
			"height": 197.80666666666667,
			"seed": 672812766,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792671,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "sLWd2b91SypXJ2YLj5TUh",
				"focus": -1.3794172590131373e-16,
				"gap": 1
			},
			"endBinding": {
				"elementId": "AdqVOhOJ-LUzSrz_Xx89V",
				"focus": -6.888255954588285e-16,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					97.84062499999999,
					196.5
				],
				[
					146.840625,
					197.80666666666667
				]
			]
		},
		{
			"type": "arrow",
			"version": 1567,
			"versionNonce": 554678241,
			"isDeleted": false,
			"id": "xyk6nC1ATFDuRjTS-6d33",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -75.76954366784997,
			"y": 3.3176400138348194,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 208.46124893158174,
			"height": 8.881784197001252e-16,
			"seed": 915383618,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [
				{
					"type": "text",
					"id": "S1KeJGHu"
				}
			],
			"updated": 1693560792672,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "G1s2myioruWMFJ4KJfmM1",
				"focus": 0.09116329460000173,
				"gap": 4.2245510169721
			},
			"endBinding": {
				"elementId": "utlXblMe2xBnYGRlWajDE",
				"focus": 0,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					89.21993044227958,
					-8.881784197001252e-16
				],
				[
					208.46124893158174,
					-8.881784197001252e-16
				]
			]
		},
		{
			"type": "text",
			"version": 476,
			"versionNonce": 1707978590,
			"isDeleted": false,
			"id": "S1KeJGHu",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 100.63823279145909,
			"y": -52.78307060759161,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 144.00027465820312,
			"height": 20,
			"seed": 1743461762,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1690884376626,
			"link": null,
			"locked": false,
			"fontSize": 16,
			"fontFamily": 1,
			"text": "取决于内存管理方案",
			"rawText": "取决于内存管理方案",
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "xyk6nC1ATFDuRjTS-6d33",
			"originalText": "取决于内存管理方案",
			"lineHeight": 1.25,
			"baseline": 14
		},
		{
			"type": "rectangle",
			"version": 447,
			"versionNonce": 1789787522,
			"isDeleted": false,
			"id": "x0b0HHuhOTxzfDozRJGav",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 251.7656501195815,
			"y": -148.38235998616517,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 215,
			"height": 86,
			"seed": 1917573314,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 3
			},
			"boundElements": [
				{
					"type": "text",
					"id": "w4wNj0LZ"
				},
				{
					"id": "v4GbTVTuhXjIizRGgG2QE",
					"type": "arrow"
				}
			],
			"updated": 1690884376626,
			"link": null,
			"locked": false
		},
		{
			"type": "text",
			"version": 536,
			"versionNonce": 1566315422,
			"isDeleted": false,
			"id": "w4wNj0LZ",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 259.2657264135268,
			"y": -142.88235998616517,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 199.99984741210938,
			"height": 75,
			"seed": 714567810,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1690884376626,
			"link": null,
			"locked": false,
			"fontSize": 20,
			"fontFamily": 1,
			"text": "最简单（只有内存）：\n进程映像保存在连续的\n内存块中",
			"rawText": "最简单（只有内存）：\n进程映像保存在连续的内存块中",
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "x0b0HHuhOTxzfDozRJGav",
			"originalText": "最简单（只有内存）：\n进程映像保存在连续的内存块中",
			"lineHeight": 1.25,
			"baseline": 68
		},
		{
			"type": "rectangle",
			"version": 708,
			"versionNonce": 978810433,
			"isDeleted": false,
			"id": "E_Hpe2mCoHBPmk-HSGFxs",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 251.76565011958152,
			"y": -39.18235998616518,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 262,
			"height": 85,
			"seed": 1437948510,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 3
			},
			"boundElements": [
				{
					"type": "text",
					"id": "McMcA7xq"
				},
				{
					"id": "50Ab8CMibfYbLknvAPVBZ",
					"type": "arrow"
				}
			],
			"updated": 1693560641573,
			"link": null,
			"locked": false
		},
		{
			"type": "text",
			"version": 809,
			"versionNonce": 244161025,
			"isDeleted": false,
			"id": "McMcA7xq",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 259.4257453344253,
			"y": -34.18235998616518,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 246.6798095703125,
			"height": 75,
			"seed": 1763073694,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1693560641575,
			"link": null,
			"locked": false,
			"fontSize": 20,
			"fontFamily": 1,
			"text": "引入磁盘：\nOS需要知道进程在内存和磁\n盘中的位置",
			"rawText": "引入磁盘：\nOS需要知道进程在内存和磁盘中的位置",
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "E_Hpe2mCoHBPmk-HSGFxs",
			"originalText": "引入磁盘：\nOS需要知道进程在内存和磁盘中的位置",
			"lineHeight": 1.25,
			"baseline": 68
		},
		{
			"type": "rectangle",
			"version": 519,
			"versionNonce": 1756148193,
			"isDeleted": false,
			"id": "3yQ0eh5WJ7-FTt5REnsIG",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 251.76565011958152,
			"y": 69.01764001383481,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 314,
			"height": 85,
			"seed": 1371106562,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 3
			},
			"boundElements": [
				{
					"type": "text",
					"id": "REVKDsZO"
				},
				{
					"id": "km5N-f5enVREkXDns2E8o",
					"type": "arrow"
				}
			],
			"updated": 1693560641577,
			"link": null,
			"locked": false
		},
		{
			"type": "text",
			"version": 672,
			"versionNonce": 339766689,
			"isDeleted": false,
			"id": "REVKDsZO",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 258.7657416723159,
			"y": 74.01764001383481,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 299.99981689453125,
			"height": 75,
			"seed": 667450562,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1693560641579,
			"link": null,
			"locked": false,
			"fontSize": 20,
			"fontFamily": 1,
			"text": "引入分页和虚存：\n进程映像一部分在内存一部分在外\n存，OS维护进程在每页中的位置",
			"rawText": "引入分页和虚存：\n进程映像一部分在内存一部分在外存，OS维护进程在每页中的位置",
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "3yQ0eh5WJ7-FTt5REnsIG",
			"originalText": "引入分页和虚存：\n进程映像一部分在内存一部分在外存，OS维护进程在每页中的位置",
			"lineHeight": 1.25,
			"baseline": 68
		},
		{
			"type": "arrow",
			"version": 322,
			"versionNonce": 1746531233,
			"isDeleted": false,
			"id": "s2jJtPd3oNC-zDCyfCfNQ",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -63.619560496330664,
			"y": 406.9076411357335,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 196.3112657600624,
			"height": 0.8099988781013394,
			"seed": 340837634,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [
				{
					"type": "text",
					"id": "4Xy5iRhx"
				}
			],
			"updated": 1693560792674,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "AdqVOhOJ-LUzSrz_Xx89V",
				"focus": 0.03902891961518818,
				"gap": 16.37453418849141
			},
			"endBinding": {
				"elementId": "DFSjS6t2-AvQiORtlB3ws",
				"focus": -5.412954679203897e-16,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					77.06994727076025,
					0.8099988781012826
				],
				[
					196.3112657600624,
					0.8099988781013394
				]
			]
		},
		{
			"type": "text",
			"version": 50,
			"versionNonce": 1207258178,
			"isDeleted": false,
			"id": "4Xy5iRhx",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 63.37024190181182,
			"y": 313.9239987781908,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 64.51211547851562,
			"height": 20,
			"seed": 1009080194,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1690884376626,
			"link": null,
			"locked": false,
			"fontSize": 16,
			"fontFamily": 1,
			"text": "PCB管理",
			"rawText": "PCB管理",
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "s2jJtPd3oNC-zDCyfCfNQ",
			"originalText": "PCB管理",
			"lineHeight": 1.25,
			"baseline": 14
		},
		{
			"type": "rectangle",
			"version": 396,
			"versionNonce": 1443238110,
			"isDeleted": false,
			"id": "iyL87ectsMrXUN84EVEy2",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 253.69170526373176,
			"y": 251.01764001383486,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 140,
			"height": 67,
			"seed": 1264134174,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 3
			},
			"boundElements": [
				{
					"type": "text",
					"id": "ozqh7MPi"
				},
				{
					"id": "kUD8ASRYd-VO1tp-SYt9G",
					"type": "arrow"
				},
				{
					"id": "BBXIeTGojUul3pLgLktpV",
					"type": "arrow"
				},
				{
					"id": "1PP7EJ4CeWTxWc8lmS3FD",
					"type": "arrow"
				},
				{
					"id": "DlTNYuHJA6phChLbREnSh",
					"type": "arrow"
				}
			],
			"updated": 1690884376626,
			"link": null,
			"locked": false
		},
		{
			"type": "text",
			"version": 401,
			"versionNonce": 29783042,
			"isDeleted": false,
			"id": "ozqh7MPi",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 263.69175104009895,
			"y": 272.01764001383486,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 119.99990844726562,
			"height": 25,
			"seed": 477787230,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1690884376626,
			"link": null,
			"locked": false,
			"fontSize": 20,
			"fontFamily": 1,
			"text": "进程标识信息",
			"rawText": "进程标识信息",
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "iyL87ectsMrXUN84EVEy2",
			"originalText": "进程标识信息",
			"lineHeight": 1.25,
			"baseline": 18
		},
		{
			"type": "rectangle",
			"version": 343,
			"versionNonce": 1970804126,
			"isDeleted": false,
			"id": "va0mmnUmJyE-bThoAwuT-",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 253.69170526373176,
			"y": 374.21764001383485,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 140,
			"height": 67,
			"seed": 758266462,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 3
			},
			"boundElements": [
				{
					"type": "text",
					"id": "SsSpFPXu"
				},
				{
					"id": "0YoFLRT84p_Jzo4ASPsbY",
					"type": "arrow"
				},
				{
					"id": "7rZ4l7MqGsBazUwfoMuOd",
					"type": "arrow"
				},
				{
					"id": "oZpDc0ql8OOHpVcXHO9S8",
					"type": "arrow"
				},
				{
					"id": "t2UpYbO1GXoF0awuKBty1",
					"type": "arrow"
				}
			],
			"updated": 1690884376626,
			"link": null,
			"locked": false
		},
		{
			"type": "text",
			"version": 334,
			"versionNonce": 1307843394,
			"isDeleted": false,
			"id": "SsSpFPXu",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 263.69175104009895,
			"y": 382.71764001383485,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 119.99990844726562,
			"height": 50,
			"seed": 2113355422,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1690884376626,
			"link": null,
			"locked": false,
			"fontSize": 20,
			"fontFamily": 1,
			"text": "处理器状态信\n息",
			"rawText": "处理器状态信息",
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "va0mmnUmJyE-bThoAwuT-",
			"originalText": "处理器状态信息",
			"lineHeight": 1.25,
			"baseline": 43
		},
		{
			"type": "rectangle",
			"version": 349,
			"versionNonce": 401035870,
			"isDeleted": false,
			"id": "B-GncjoqMjeW0jz0acaLS",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 253.69170526373176,
			"y": 573.4176400138348,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 140,
			"height": 35,
			"seed": 1934304450,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 3
			},
			"boundElements": [
				{
					"type": "text",
					"id": "PdC1usE1"
				},
				{
					"id": "dcCOpX01UUCwZ1ntdVsDH",
					"type": "arrow"
				},
				{
					"id": "-_bHCTZvMRTRP1du7FOYe",
					"type": "arrow"
				},
				{
					"id": "R7c80GlQeJIKvrVBoEfyI",
					"type": "arrow"
				},
				{
					"id": "3YZs32walbfuxzHpS-PK7",
					"type": "arrow"
				},
				{
					"id": "tGiq_ikVc3FbV1ko1qf50",
					"type": "arrow"
				},
				{
					"id": "CGexPsQenvuFq3SEiX6_n",
					"type": "arrow"
				},
				{
					"id": "UDgd7qLZwS1GU6H3cfPpb",
					"type": "arrow"
				}
			],
			"updated": 1690884376626,
			"link": null,
			"locked": false
		},
		{
			"type": "text",
			"version": 334,
			"versionNonce": 984877698,
			"isDeleted": false,
			"id": "PdC1usE1",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 263.69175104009895,
			"y": 578.4176400138348,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 119.99990844726562,
			"height": 25,
			"seed": 1707949186,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1690884376626,
			"link": null,
			"locked": false,
			"fontSize": 20,
			"fontFamily": 1,
			"text": "进程控制信息",
			"rawText": "进程控制信息",
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "B-GncjoqMjeW0jz0acaLS",
			"originalText": "进程控制信息",
			"lineHeight": 1.25,
			"baseline": 18
		},
		{
			"type": "ellipse",
			"version": 221,
			"versionNonce": 1765915010,
			"isDeleted": false,
			"id": "DFSjS6t2-AvQiORtlB3ws",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 133.69170526373176,
			"y": 393.62673092292573,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 30,
			"height": 28.181818181818187,
			"seed": 638006750,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [
				{
					"id": "s2jJtPd3oNC-zDCyfCfNQ",
					"type": "arrow"
				},
				{
					"id": "kUD8ASRYd-VO1tp-SYt9G",
					"type": "arrow"
				},
				{
					"id": "0YoFLRT84p_Jzo4ASPsbY",
					"type": "arrow"
				},
				{
					"id": "dcCOpX01UUCwZ1ntdVsDH",
					"type": "arrow"
				}
			],
			"updated": 1690884376626,
			"link": null,
			"locked": false
		},
		{
			"type": "arrow",
			"version": 540,
			"versionNonce": 186138465,
			"isDeleted": false,
			"id": "kUD8ASRYd-VO1tp-SYt9G",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 163.69170526373176,
			"y": 407.71764001383485,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 89,
			"height": 121.30666666666667,
			"seed": 1562171870,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792678,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "DFSjS6t2-AvQiORtlB3ws",
				"focus": 0.9543082992671585,
				"gap": 1
			},
			"endBinding": {
				"elementId": "iyL87ectsMrXUN84EVEy2",
				"focus": 6.888255954588285e-16,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					40,
					-120
				],
				[
					89,
					-121.30666666666667
				]
			]
		},
		{
			"type": "arrow",
			"version": 540,
			"versionNonce": 138844961,
			"isDeleted": false,
			"id": "0YoFLRT84p_Jzo4ASPsbY",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 163.69170526373176,
			"y": 407.71764001383485,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 89,
			"height": 0,
			"seed": 485564034,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792678,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "DFSjS6t2-AvQiORtlB3ws",
				"focus": 0,
				"gap": 1
			},
			"endBinding": {
				"elementId": "va0mmnUmJyE-bThoAwuT-",
				"focus": 0,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					40,
					0
				],
				[
					89,
					0
				]
			]
		},
		{
			"type": "arrow",
			"version": 594,
			"versionNonce": 2128676577,
			"isDeleted": false,
			"id": "dcCOpX01UUCwZ1ntdVsDH",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 163.69170526373176,
			"y": 407.71764001383485,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 89,
			"height": 181.30666666666662,
			"seed": 848405470,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792680,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "DFSjS6t2-AvQiORtlB3ws",
				"focus": -0.9788980783828101,
				"gap": 1
			},
			"endBinding": {
				"elementId": "B-GncjoqMjeW0jz0acaLS",
				"focus": 2.9950166247923128e-15,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					40,
					180
				],
				[
					89,
					181.30666666666662
				]
			]
		},
		{
			"type": "text",
			"version": 182,
			"versionNonce": 939518082,
			"isDeleted": false,
			"id": "Wni81zHk",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 483.69170526373176,
			"y": 231.31764001383488,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 79.77615356445312,
			"height": 20,
			"seed": 184123458,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [
				{
					"id": "BBXIeTGojUul3pLgLktpV",
					"type": "arrow"
				}
			],
			"updated": 1690884376626,
			"link": null,
			"locked": false,
			"fontSize": 16,
			"fontFamily": 1,
			"text": "该进程PID",
			"rawText": "该进程PID",
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "该进程PID",
			"lineHeight": 1.25,
			"baseline": 14
		},
		{
			"type": "text",
			"version": 171,
			"versionNonce": 112429122,
			"isDeleted": false,
			"id": "0owJu0s0",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 483.69170526373176,
			"y": 274.51764001383486,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 79.77615356445312,
			"height": 20,
			"seed": 1883165982,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [
				{
					"id": "1PP7EJ4CeWTxWc8lmS3FD",
					"type": "arrow"
				}
			],
			"updated": 1690884376626,
			"link": null,
			"locked": false,
			"fontSize": 16,
			"fontFamily": 1,
			"text": "父进程PID",
			"rawText": "父进程PID",
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "父进程PID",
			"lineHeight": 1.25,
			"baseline": 14
		},
		{
			"type": "text",
			"version": 185,
			"versionNonce": 1163735042,
			"isDeleted": false,
			"id": "xhhqZxgB",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 483.69170526373176,
			"y": 317.71764001383485,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 112.62422180175781,
			"height": 20,
			"seed": 1319420766,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [
				{
					"id": "DlTNYuHJA6phChLbREnSh",
					"type": "arrow"
				}
			],
			"updated": 1690884376626,
			"link": null,
			"locked": false,
			"fontSize": 16,
			"fontFamily": 1,
			"text": "用户标识符UID",
			"rawText": "用户标识符UID",
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "用户标识符UID",
			"lineHeight": 1.25,
			"baseline": 14
		},
		{
			"type": "text",
			"version": 208,
			"versionNonce": 402382786,
			"isDeleted": false,
			"id": "UE2XDXKm",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 483.69170526373176,
			"y": 354.51764001383486,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 112.00021362304688,
			"height": 20,
			"seed": 2109431490,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [
				{
					"id": "7rZ4l7MqGsBazUwfoMuOd",
					"type": "arrow"
				}
			],
			"updated": 1690884376626,
			"link": null,
			"locked": false,
			"fontSize": 16,
			"fontFamily": 1,
			"text": "用户可见寄存器",
			"rawText": "用户可见寄存器",
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "用户可见寄存器",
			"lineHeight": 1.25,
			"baseline": 14
		},
		{
			"type": "text",
			"version": 265,
			"versionNonce": 1252956034,
			"isDeleted": false,
			"id": "BpJRgCOH",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 483.69170526373176,
			"y": 397.71764001383485,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 388.8807373046875,
			"height": 20,
			"seed": 369205634,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [
				{
					"id": "oZpDc0ql8OOHpVcXHO9S8",
					"type": "arrow"
				}
			],
			"updated": 1690884376627,
			"link": null,
			"locked": false,
			"fontSize": 16,
			"fontFamily": 1,
			"text": "控制与状态寄存器，如PC、运算条件码、中断状态信息",
			"rawText": "控制与状态寄存器，如PC、运算条件码、中断状态信息",
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "控制与状态寄存器，如PC、运算条件码、中断状态信息",
			"lineHeight": 1.25,
			"baseline": 14
		},
		{
			"type": "text",
			"version": 183,
			"versionNonce": 1303664450,
			"isDeleted": false,
			"id": "UFcAHb01",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 483.69170526373176,
			"y": 440.91764001383484,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 48.000091552734375,
			"height": 20,
			"seed": 1384626398,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [
				{
					"id": "t2UpYbO1GXoF0awuKBty1",
					"type": "arrow"
				}
			],
			"updated": 1690884376627,
			"link": null,
			"locked": false,
			"fontSize": 16,
			"fontFamily": 1,
			"text": "栈指针",
			"rawText": "栈指针",
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "栈指针",
			"lineHeight": 1.25,
			"baseline": 14
		},
		{
			"type": "text",
			"version": 321,
			"versionNonce": 829169410,
			"isDeleted": false,
			"id": "fpCkbi1G",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 483.69170526373176,
			"y": 477.7176400138348,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 496.0009460449219,
			"height": 20,
			"seed": 1841513026,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [
				{
					"id": "-_bHCTZvMRTRP1du7FOYe",
					"type": "arrow"
				}
			],
			"updated": 1690884376627,
			"link": null,
			"locked": false,
			"fontSize": 16,
			"fontFamily": 1,
			"text": "调度和状态信息：进程运行状态、优先级、调度信息、等待事件的标识",
			"rawText": "调度和状态信息：进程运行状态、优先级、调度信息、等待事件的标识",
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "调度和状态信息：进程运行状态、优先级、调度信息、等待事件的标识",
			"lineHeight": 1.25,
			"baseline": 14
		},
		{
			"type": "text",
			"version": 222,
			"versionNonce": 1878396802,
			"isDeleted": false,
			"id": "ybgO5aYK",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 483.69170526373176,
			"y": 514.5176400138348,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 192.0003662109375,
			"height": 20,
			"seed": 1322889346,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1690884377227,
			"link": null,
			"locked": false,
			"fontSize": 16,
			"fontFamily": 1,
			"text": "与其他进程关联的数据结构",
			"rawText": "与其他进程关联的数据结构",
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "与其他进程关联的数据结构",
			"lineHeight": 1.25,
			"baseline": 14
		},
		{
			"type": "text",
			"version": 220,
			"versionNonce": 1695401602,
			"isDeleted": false,
			"id": "QGCWnrZ0",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 483.69170526373176,
			"y": 551.3176400138348,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 80.00015258789062,
			"height": 20,
			"seed": 179313310,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [
				{
					"id": "3YZs32walbfuxzHpS-PK7",
					"type": "arrow"
				}
			],
			"updated": 1690884376627,
			"link": null,
			"locked": false,
			"fontSize": 16,
			"fontFamily": 1,
			"text": "进程间通信",
			"rawText": "进程间通信",
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "进程间通信",
			"lineHeight": 1.25,
			"baseline": 14
		},
		{
			"type": "text",
			"version": 235,
			"versionNonce": 1381344834,
			"isDeleted": false,
			"id": "wsqQZCPI",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 483.69170526373176,
			"y": 604.1176400138348,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 240.00045776367188,
			"height": 20,
			"seed": 824939394,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [
				{
					"id": "tGiq_ikVc3FbV1ko1qf50",
					"type": "arrow"
				}
			],
			"updated": 1690884376627,
			"link": null,
			"locked": false,
			"fontSize": 16,
			"fontFamily": 1,
			"text": "进程访问内存和可执行指令的权限",
			"rawText": "进程访问内存和可执行指令的权限",
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "进程访问内存和可执行指令的权限",
			"lineHeight": 1.25,
			"baseline": 14
		},
		{
			"type": "text",
			"version": 268,
			"versionNonce": 1274076766,
			"isDeleted": false,
			"id": "PrLLQzqx",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 483.69170526373176,
			"y": 647.3176400138348,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 400.0007629394531,
			"height": 20,
			"seed": 1876577090,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1690884377229,
			"link": null,
			"locked": false,
			"fontSize": 16,
			"fontFamily": 1,
			"text": "存储管理，包含描述分配给进程的虚存的段表或页表指针",
			"rawText": "存储管理，包含描述分配给进程的虚存的段表或页表指针",
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "存储管理，包含描述分配给进程的虚存的段表或页表指针",
			"lineHeight": 1.25,
			"baseline": 14
		},
		{
			"type": "text",
			"version": 206,
			"versionNonce": 1546550722,
			"isDeleted": false,
			"id": "36Qoq7Oz",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 483.69170526373176,
			"y": 690.5176400138348,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 160.00030517578125,
			"height": 20,
			"seed": 136638878,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [
				{
					"id": "UDgd7qLZwS1GU6H3cfPpb",
					"type": "arrow"
				}
			],
			"updated": 1690884376627,
			"link": null,
			"locked": false,
			"fontSize": 16,
			"fontFamily": 1,
			"text": "资源所有权和使用情况",
			"rawText": "资源所有权和使用情况",
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "资源所有权和使用情况",
			"lineHeight": 1.25,
			"baseline": 14
		},
		{
			"type": "arrow",
			"version": 527,
			"versionNonce": 1864598177,
			"isDeleted": false,
			"id": "BBXIeTGojUul3pLgLktpV",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 394.69170526373176,
			"y": 258.69945819565305,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 89,
			"height": 17.38181818181819,
			"seed": 1637517890,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792685,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "iyL87ectsMrXUN84EVEy2",
				"focus": 0,
				"gap": 1
			},
			"endBinding": {
				"elementId": "Wni81zHk",
				"focus": 0.20336732895833637,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					39,
					-14.181818181818187
				],
				[
					89,
					-17.38181818181819
				]
			]
		},
		{
			"type": "arrow",
			"version": 527,
			"versionNonce": 2051673697,
			"isDeleted": false,
			"id": "1PP7EJ4CeWTxWc8lmS3FD",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 394.69170526373176,
			"y": 284.51764001383486,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 89,
			"height": 0,
			"seed": 851097182,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792686,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "iyL87ectsMrXUN84EVEy2",
				"focus": 0,
				"gap": 1
			},
			"endBinding": {
				"elementId": "0owJu0s0",
				"focus": 0,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					39,
					0
				],
				[
					89,
					0
				]
			]
		},
		{
			"type": "arrow",
			"version": 553,
			"versionNonce": 579906081,
			"isDeleted": false,
			"id": "DlTNYuHJA6phChLbREnSh",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 394.69170526373176,
			"y": 310.3358218320167,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 89,
			"height": 17.38181818181819,
			"seed": 2026990082,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792688,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "iyL87ectsMrXUN84EVEy2",
				"focus": 0,
				"gap": 1
			},
			"endBinding": {
				"elementId": "xhhqZxgB",
				"focus": -0.2649207361660896,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					39,
					14.181818181818187
				],
				[
					89,
					17.38181818181819
				]
			]
		},
		{
			"type": "arrow",
			"version": 549,
			"versionNonce": 187913697,
			"isDeleted": false,
			"id": "7rZ4l7MqGsBazUwfoMuOd",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 394.69170526373176,
			"y": 381.89945819565304,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 89,
			"height": 17.38181818181819,
			"seed": 2014904414,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792689,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "va0mmnUmJyE-bThoAwuT-",
				"focus": 0,
				"gap": 1
			},
			"endBinding": {
				"elementId": "UE2XDXKm",
				"focus": 0.2638401820040121,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					39,
					-14.181818181818187
				],
				[
					89,
					-17.38181818181819
				]
			]
		},
		{
			"type": "arrow",
			"version": 520,
			"versionNonce": 946737569,
			"isDeleted": false,
			"id": "oZpDc0ql8OOHpVcXHO9S8",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 394.69170526373176,
			"y": 407.71764001383485,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 89,
			"height": 0,
			"seed": 1827797122,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792689,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "va0mmnUmJyE-bThoAwuT-",
				"focus": 0,
				"gap": 1
			},
			"endBinding": {
				"elementId": "BpJRgCOH",
				"focus": 0,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					39,
					0
				],
				[
					89,
					0
				]
			]
		},
		{
			"type": "arrow",
			"version": 552,
			"versionNonce": 1333583201,
			"isDeleted": false,
			"id": "t2UpYbO1GXoF0awuKBty1",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 394.69170526373176,
			"y": 433.53582183201667,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 89,
			"height": 17.38181818181819,
			"seed": 1996634818,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792690,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "va0mmnUmJyE-bThoAwuT-",
				"focus": 0,
				"gap": 1
			},
			"endBinding": {
				"elementId": "UFcAHb01",
				"focus": -0.13314862513901146,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					39,
					14.181818181818187
				],
				[
					89,
					17.38181818181819
				]
			]
		},
		{
			"type": "arrow",
			"version": 651,
			"versionNonce": 1453046049,
			"isDeleted": false,
			"id": "-_bHCTZvMRTRP1du7FOYe",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 344.0417052637317,
			"y": 572.4176400138348,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 139.65,
			"height": 84.7,
			"seed": 1188263618,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792690,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "B-GncjoqMjeW0jz0acaLS",
				"focus": -2.5007157856656277e-16,
				"gap": 1
			},
			"endBinding": {
				"elementId": "fpCkbi1G",
				"focus": 0.613482208612484,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					89.65,
					-81.5
				],
				[
					139.65,
					-84.7
				]
			]
		},
		{
			"type": "arrow",
			"version": 571,
			"versionNonce": 1139404033,
			"isDeleted": false,
			"id": "R7c80GlQeJIKvrVBoEfyI",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 357.60837193039845,
			"y": 572.4176400138348,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 126.08333333333334,
			"height": 47.900000000000006,
			"seed": 1047290626,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792690,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "B-GncjoqMjeW0jz0acaLS",
				"focus": 1.6101209374883408e-16,
				"gap": 1
			},
			"endBinding": null,
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					76.08333333333334,
					-41.5
				],
				[
					126.08333333333334,
					-47.900000000000006
				]
			]
		},
		{
			"type": "arrow",
			"version": 639,
			"versionNonce": 1971413185,
			"isDeleted": false,
			"id": "3YZs32walbfuxzHpS-PK7",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 394.69170526373176,
			"y": 578.0085491047438,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 89,
			"height": 16.69090909090901,
			"seed": 2062863134,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792695,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "B-GncjoqMjeW0jz0acaLS",
				"focus": -8.100762525912758e-15,
				"gap": 1
			},
			"endBinding": {
				"elementId": "QGCWnrZ0",
				"focus": 0.4343896088975387,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					39,
					-7.090909090909008
				],
				[
					89,
					-16.69090909090901
				]
			]
		},
		{
			"type": "arrow",
			"version": 578,
			"versionNonce": 991880321,
			"isDeleted": false,
			"id": "tGiq_ikVc3FbV1ko1qf50",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 394.69170526373176,
			"y": 603.8267309229258,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 89,
			"height": 10.290909090909008,
			"seed": 1919862978,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792695,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "B-GncjoqMjeW0jz0acaLS",
				"focus": 8.100762525912758e-15,
				"gap": 1
			},
			"endBinding": {
				"elementId": "wsqQZCPI",
				"focus": -0.4343896088975412,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					39,
					7.090909090909008
				],
				[
					89,
					10.290909090909008
				]
			]
		},
		{
			"type": "arrow",
			"version": 598,
			"versionNonce": 967879777,
			"isDeleted": false,
			"id": "CGexPsQenvuFq3SEiX6_n",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 357.60837193039845,
			"y": 609.4176400138348,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 126.08333333333334,
			"height": 47.900000000000006,
			"seed": 488288514,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792696,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "B-GncjoqMjeW0jz0acaLS",
				"focus": -1.6101209374883408e-16,
				"gap": 1
			},
			"endBinding": null,
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					76.08333333333334,
					41.5
				],
				[
					126.08333333333334,
					47.900000000000006
				]
			]
		},
		{
			"type": "arrow",
			"version": 597,
			"versionNonce": 325568545,
			"isDeleted": false,
			"id": "UDgd7qLZwS1GU6H3cfPpb",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 344.0417052637317,
			"y": 609.4176400138348,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 139.65,
			"height": 91.1,
			"seed": 746686210,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792696,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "B-GncjoqMjeW0jz0acaLS",
				"focus": 2.5007157856656277e-16,
				"gap": 1
			},
			"endBinding": {
				"elementId": "36Qoq7Oz",
				"focus": -0.6056786889740613,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					89.65,
					81.5
				],
				[
					139.65,
					91.1
				]
			]
		},
		{
			"type": "ellipse",
			"version": 303,
			"versionNonce": 637266946,
			"isDeleted": false,
			"id": "utlXblMe2xBnYGRlWajDE",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 133.69170526373176,
			"y": -11.304206265253555,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 28.07394485584973,
			"height": 29.243692558176747,
			"seed": 1206568158,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [
				{
					"id": "v4GbTVTuhXjIizRGgG2QE",
					"type": "arrow"
				},
				{
					"id": "50Ab8CMibfYbLknvAPVBZ",
					"type": "arrow"
				},
				{
					"id": "km5N-f5enVREkXDns2E8o",
					"type": "arrow"
				},
				{
					"id": "xyk6nC1ATFDuRjTS-6d33",
					"type": "arrow"
				}
			],
			"updated": 1690884376627,
			"link": null,
			"locked": false
		},
		{
			"type": "arrow",
			"version": 996,
			"versionNonce": 1801122785,
			"isDeleted": false,
			"id": "v4GbTVTuhXjIizRGgG2QE",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 161.7656501195815,
			"y": 3.3176400138348185,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 89,
			"height": 106.49555555555555,
			"seed": 1302360386,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792697,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "utlXblMe2xBnYGRlWajDE",
				"focus": 0.9300891786461313,
				"gap": 1
			},
			"endBinding": {
				"elementId": "x0b0HHuhOTxzfDozRJGav",
				"focus": 2.0539421254319322e-16,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					40,
					-105.5
				],
				[
					89,
					-106.49555555555555
				]
			]
		},
		{
			"type": "arrow",
			"version": 1070,
			"versionNonce": 1304833953,
			"isDeleted": false,
			"id": "50Ab8CMibfYbLknvAPVBZ",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 161.7656501195815,
			"y": 3.3176400138348185,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 89.00000000000006,
			"height": 0,
			"seed": 190958402,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792697,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "utlXblMe2xBnYGRlWajDE",
				"focus": 0,
				"gap": 1
			},
			"endBinding": {
				"elementId": "E_Hpe2mCoHBPmk-HSGFxs",
				"focus": 0,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					40,
					0
				],
				[
					89.00000000000006,
					0
				]
			]
		},
		{
			"type": "arrow",
			"version": 937,
			"versionNonce": 1743092577,
			"isDeleted": false,
			"id": "km5N-f5enVREkXDns2E8o",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 161.7656501195815,
			"y": 3.3176400138348185,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 89.00000000000006,
			"height": 105.75748792270532,
			"seed": 1052560322,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1693560792699,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "utlXblMe2xBnYGRlWajDE",
				"focus": -0.9294907111696339,
				"gap": 1
			},
			"endBinding": {
				"elementId": "3yQ0eh5WJ7-FTt5REnsIG",
				"focus": -1.0328474196178313e-15,
				"gap": 1
			},
			"lastCommittedPoint": null,
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"points": [
				[
					0,
					0
				],
				[
					40,
					105
				],
				[
					89.00000000000006,
					105.75748792270532
				]
			]
		}
	],
	"appState": {
		"theme": "light",
		"viewBackgroundColor": "#ffffff",
		"currentItemStrokeColor": "#1e1e1e",
		"currentItemBackgroundColor": "transparent",
		"currentItemFillStyle": "hachure",
		"currentItemStrokeWidth": 1,
		"currentItemStrokeStyle": "solid",
		"currentItemRoughness": 1,
		"currentItemOpacity": 100,
		"currentItemFontFamily": 1,
		"currentItemFontSize": 16,
		"currentItemTextAlign": "left",
		"currentItemStartArrowhead": null,
		"currentItemEndArrowhead": "arrow",
		"scrollX": 557.9666939103064,
		"scrollY": 730.1302766528318,
		"zoom": {
			"value": 0.45
		},
		"currentItemRoundness": "round",
		"gridSize": null,
		"currentStrokeOptions": null,
		"previousGridSize": null,
		"frameRendering": {
			"enabled": true,
			"clip": true,
			"name": true,
			"outline": true
		}
	},
	"files": {}
}
```
%%