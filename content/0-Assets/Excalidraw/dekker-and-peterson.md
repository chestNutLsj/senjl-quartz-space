---

excalidraw-plugin: parsed
tags: [excalidraw]

---
==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠==


# Text Elements
turn值与进程号不对应，就自旋等待，直到另一进程恢复turn值。

缺点：1.进程严格交替使用，慢的进程会严重拖累整体运行效率；2.一个进程终止，另一个进程被永久阻塞 ^79qpTNaO

flag对应状态，flag[0]关联P0，flag[1]关联P1，周期性检查另一个进程的flag，直到为false，则修改自己flag为true并进入，离开时恢复自己flag为false。

缺点：1.临界区外终止不会影响另一个进程，临界区内终止则另一进程永久阻塞；2.当同时发现另一个进程flag为false时，会设置自己flag为true，这样连互斥都实现不了 ^8NuYTIWX

algo2是由于检查flag但还未进入临界区时，就改变自身状态导致失败，因此改进办法是将置为true的语句放在忙等待之前。

缺点：1.临界区内或修改flag时失败，另一进程永久阻塞；2.虽然实现了互斥，但若同时设置flag为true，在while时会死锁 ^dVZYgAyC

algo3设置状态前不知另一进程的状态，且进入临界区之前不会回退，导致死锁。若采用谦让机制，每隔一段时间修改自己flag，让另一进程进入临界区。

缺点：1.若两进程执行速度完全一致，等待间隔也一致，会产生活锁； ^8KGgGyoH

flag表示进程状态；turn表示哪个进程有权进入临界区，实现谦让的目的。进入临界区时，设置自己flag为true，检查另一个flag，若为false则直接进入；若为true，则检查turn是否为自己，若是则另一进程同时延期执行并设置flag为false让步，本进程循环检查另一个flag直到其为false；执行完临界区后，设置flag为false，并置turn为另一者。 ^sZthAbuG

进程先声明自己想要进入临界区(flag->true)，但都谦让对方(turn=P_other)，因此在忙等待中必有一者等待，一者进入临界区，进入临界区的进程执行完后将自身flag置为false，另一进程解锁，进入临界区。 ^lZS5Tk0q


# Embedded files
944e50c594155d579787123b7435111581d31999: [[Pasted Image 20230810162908_664.png]]
6634da474b310dff24c80669c2dcb7aba396e3a7: [[Pasted Image 20230810162908_710.png]]

%%
# Drawing
```json
{
	"type": "excalidraw",
	"version": 2,
	"source": "https://github.com/zsviczian/obsidian-excalidraw-plugin/releases/tag/1.9.12",
	"elements": [
		{
			"type": "image",
			"version": 516,
			"versionNonce": 994979566,
			"isDeleted": false,
			"id": "wTQyHGpbzo5exX4BIp7uk",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -647.0795454545457,
			"y": -863.3700284090911,
			"strokeColor": "transparent",
			"backgroundColor": "transparent",
			"width": 848.9448051948054,
			"height": 950.818181818182,
			"seed": 2049228398,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [
				{
					"id": "X14os4N4_nsUsly14qYsw",
					"type": "arrow"
				},
				{
					"id": "0YHBhViqe_EdFN9FrbKsz",
					"type": "arrow"
				},
				{
					"id": "XcCanE9pTaDridcqYN8Bl",
					"type": "arrow"
				}
			],
			"updated": 1691657856779,
			"link": null,
			"locked": false,
			"status": "pending",
			"fileId": "944e50c594155d579787123b7435111581d31999",
			"scale": [
				1,
				1
			]
		},
		{
			"type": "image",
			"version": 343,
			"versionNonce": 859698606,
			"isDeleted": false,
			"id": "sG77NSV6VXstfMvTFgp9a",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": -623.2772727272729,
			"y": 100.62997159090901,
			"strokeColor": "transparent",
			"backgroundColor": "transparent",
			"width": 813.3415584415587,
			"height": 958.4833180287729,
			"seed": 1365212014,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [
				{
					"id": "tIeiCn-HHdKhzXsmIPh47",
					"type": "arrow"
				},
				{
					"id": "dTGkYqDSLk2nwF8owYRYT",
					"type": "arrow"
				},
				{
					"id": "1rzpe0-KqyDAZMRsagu9b",
					"type": "arrow"
				}
			],
			"updated": 1691657925824,
			"link": null,
			"locked": false,
			"status": "pending",
			"fileId": "6634da474b310dff24c80669c2dcb7aba396e3a7",
			"scale": [
				1,
				1
			]
		},
		{
			"type": "arrow",
			"version": 1028,
			"versionNonce": 1725842290,
			"isDeleted": false,
			"id": "X14os4N4_nsUsly14qYsw",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 226.26380454584097,
			"y": -461.5329228442162,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 86.17610315763034,
			"height": 0.020267417391892195,
			"seed": 1331688498,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1691659229254,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "wTQyHGpbzo5exX4BIp7uk",
				"gap": 24.398544805581196,
				"focus": -0.1548986947164356
			},
			"endBinding": {
				"elementId": "KEiXQs-v9lEt7vwsmghll",
				"gap": 19.578245196260752,
				"focus": -0.08559249718429576
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
					86.17610315763034,
					-0.020267417391892195
				]
			]
		},
		{
			"type": "rectangle",
			"version": 592,
			"versionNonce": 471695534,
			"isDeleted": false,
			"id": "KEiXQs-v9lEt7vwsmghll",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 332.01815289973206,
			"y": -549.539424802172,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 381,
			"height": 162,
			"seed": 370706734,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 3
			},
			"boundElements": [
				{
					"id": "X14os4N4_nsUsly14qYsw",
					"type": "arrow"
				},
				{
					"type": "text",
					"id": "79qpTNaO"
				}
			],
			"updated": 1691658991529,
			"link": null,
			"locked": false
		},
		{
			"type": "text",
			"version": 796,
			"versionNonce": 1593485618,
			"isDeleted": false,
			"id": "79qpTNaO",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 337.01815289973206,
			"y": -540.539424802172,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 366.874755859375,
			"height": 144,
			"seed": 1519777838,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1691658991529,
			"link": null,
			"locked": false,
			"fontSize": 20,
			"fontFamily": 3,
			"text": "turn值与进程号不对应，就自旋等待，直\n到另一进程恢复turn值。\n\n缺点：1.进程严格交替使用，慢的进程会\n严重拖累整体运行效率；2.一个进程终止\n，另一个进程被永久阻塞",
			"rawText": "turn值与进程号不对应，就自旋等待，直到另一进程恢复turn值。\n\n缺点：1.进程严格交替使用，慢的进程会严重拖累整体运行效率；2.一个进程终止，另一个进程被永久阻塞",
			"textAlign": "left",
			"verticalAlign": "middle",
			"containerId": "KEiXQs-v9lEt7vwsmghll",
			"originalText": "turn值与进程号不对应，就自旋等待，直到另一进程恢复turn值。\n\n缺点：1.进程严格交替使用，慢的进程会严重拖累整体运行效率；2.一个进程终止，另一个进程被永久阻塞",
			"lineHeight": 1.2,
			"baseline": 139
		},
		{
			"type": "arrow",
			"version": 606,
			"versionNonce": 562631346,
			"isDeleted": false,
			"id": "0YHBhViqe_EdFN9FrbKsz",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 211.36597584265445,
			"y": -241.60871175121773,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 122.01239441440856,
			"height": 12.956950338394137,
			"seed": 1414985518,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1691659548190,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "wTQyHGpbzo5exX4BIp7uk",
				"gap": 9.500716102394847,
				"focus": 0.3694473140304465
			},
			"endBinding": {
				"elementId": "nNz6aLkQdrXgBxwDRKBcZ",
				"gap": 9.204901734104023,
				"focus": 0.1648026315789471
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
					122.01239441440856,
					-12.956950338394137
				]
			]
		},
		{
			"type": "rectangle",
			"version": 444,
			"versionNonce": 1699490158,
			"isDeleted": false,
			"id": "nNz6aLkQdrXgBxwDRKBcZ",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 342.58327199116707,
			"y": -370.6080666866037,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 410,
			"height": 232,
			"seed": 27599022,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 3
			},
			"boundElements": [
				{
					"id": "0YHBhViqe_EdFN9FrbKsz",
					"type": "arrow"
				},
				{
					"type": "text",
					"id": "8NuYTIWX"
				}
			],
			"updated": 1691659548190,
			"link": null,
			"locked": false
		},
		{
			"type": "text",
			"version": 939,
			"versionNonce": 66579570,
			"isDeleted": false,
			"id": "8NuYTIWX",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 347.58327199116707,
			"y": -362.6080666866037,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 394.3748779296875,
			"height": 216,
			"seed": 1878580142,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1691659548193,
			"link": null,
			"locked": false,
			"fontSize": 20,
			"fontFamily": 3,
			"text": "flag对应状态，flag[0]关联P0，flag[1]\n关联P1，周期性检查另一个进程的flag，直\n到为false，则修改自己flag为true并进入\n，离开时恢复自己flag为false。\n\n缺点：1.临界区外终止不会影响另一个进程\n，临界区内终止则另一进程永久阻塞；2.当\n同时发现另一个进程flag为false时，会设\n置自己flag为true，这样连互斥都实现不了",
			"rawText": "flag对应状态，flag[0]关联P0，flag[1]关联P1，周期性检查另一个进程的flag，直到为false，则修改自己flag为true并进入，离开时恢复自己flag为false。\n\n缺点：1.临界区外终止不会影响另一个进程，临界区内终止则另一进程永久阻塞；2.当同时发现另一个进程flag为false时，会设置自己flag为true，这样连互斥都实现不了",
			"textAlign": "left",
			"verticalAlign": "middle",
			"containerId": "nNz6aLkQdrXgBxwDRKBcZ",
			"originalText": "flag对应状态，flag[0]关联P0，flag[1]关联P1，周期性检查另一个进程的flag，直到为false，则修改自己flag为true并进入，离开时恢复自己flag为false。\n\n缺点：1.临界区外终止不会影响另一个进程，临界区内终止则另一进程永久阻塞；2.当同时发现另一个进程flag为false时，会设置自己flag为true，这样连互斥都实现不了",
			"lineHeight": 1.2,
			"baseline": 211
		},
		{
			"type": "arrow",
			"version": 113,
			"versionNonce": 1606441906,
			"isDeleted": false,
			"id": "XcCanE9pTaDridcqYN8Bl",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 227.42616009721291,
			"y": -46.46729565091602,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 105.71428571428584,
			"height": 1.2939441751439986,
			"seed": 1059399410,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1691659767169,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "wTQyHGpbzo5exX4BIp7uk",
				"gap": 25.560900356953255,
				"focus": 0.6801743578757573
			},
			"endBinding": {
				"elementId": "SscsxocWVDXEcaTfTUmTv",
				"gap": 26.136363636363797,
				"focus": 0.5315920035021154
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
					105.71428571428584,
					1.2939441751439986
				]
			]
		},
		{
			"type": "rectangle",
			"version": 163,
			"versionNonce": 1861829810,
			"isDeleted": false,
			"id": "SscsxocWVDXEcaTfTUmTv",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 359.27680944786255,
			"y": -82.6518124145598,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 415,
			"height": 178,
			"seed": 548982574,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 3
			},
			"boundElements": [
				{
					"type": "text",
					"id": "dVZYgAyC"
				},
				{
					"id": "XcCanE9pTaDridcqYN8Bl",
					"type": "arrow"
				}
			],
			"updated": 1691659763074,
			"link": null,
			"locked": false
		},
		{
			"type": "text",
			"version": 516,
			"versionNonce": 196089710,
			"isDeleted": false,
			"id": "dVZYgAyC",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 364.27680944786255,
			"y": -77.6518124145598,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 403.437255859375,
			"height": 168,
			"seed": 1267694382,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1691659763074,
			"link": null,
			"locked": false,
			"fontSize": 20,
			"fontFamily": 3,
			"text": "algo2是由于检查flag但还未进入临界区时\n，就改变自身状态导致失败，因此改进办法是\n将置为true的语句放在忙等待之前。\n\n缺点：1.临界区内或修改flag时失败，另一\n进程永久阻塞；2.虽然实现了互斥，但若同时\n设置flag为true，在while时会死锁",
			"rawText": "algo2是由于检查flag但还未进入临界区时，就改变自身状态导致失败，因此改进办法是将置为true的语句放在忙等待之前。\n\n缺点：1.临界区内或修改flag时失败，另一进程永久阻塞；2.虽然实现了互斥，但若同时设置flag为true，在while时会死锁",
			"textAlign": "left",
			"verticalAlign": "middle",
			"containerId": "SscsxocWVDXEcaTfTUmTv",
			"originalText": "algo2是由于检查flag但还未进入临界区时，就改变自身状态导致失败，因此改进办法是将置为true的语句放在忙等待之前。\n\n缺点：1.临界区内或修改flag时失败，另一进程永久阻塞；2.虽然实现了互斥，但若同时设置flag为true，在while时会死锁",
			"lineHeight": 1.2,
			"baseline": 163
		},
		{
			"type": "arrow",
			"version": 133,
			"versionNonce": 1241520818,
			"isDeleted": false,
			"id": "tIeiCn-HHdKhzXsmIPh47",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 209.90235057340325,
			"y": 315.3234729871303,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 141.4545454545454,
			"height": 56.29132941529622,
			"seed": 973138994,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1691659942953,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "sG77NSV6VXstfMvTFgp9a",
				"gap": 19.838064859117367,
				"focus": -0.1528798502654855
			},
			"endBinding": {
				"elementId": "zC4JleqajGJIYJlmDNAAR",
				"gap": 14.378787878787989,
				"focus": 0.692295098702015
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
					141.4545454545454,
					-56.29132941529622
				]
			]
		},
		{
			"type": "rectangle",
			"version": 161,
			"versionNonce": 2075150446,
			"isDeleted": false,
			"id": "zC4JleqajGJIYJlmDNAAR",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 365.73568390673665,
			"y": 193.62091485816802,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 407,
			"height": 226,
			"seed": 1216424242,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 3
			},
			"boundElements": [
				{
					"type": "text",
					"id": "8KGgGyoH"
				},
				{
					"id": "tIeiCn-HHdKhzXsmIPh47",
					"type": "arrow"
				}
			],
			"updated": 1691659939859,
			"link": null,
			"locked": false
		},
		{
			"type": "text",
			"version": 466,
			"versionNonce": 212417906,
			"isDeleted": false,
			"id": "8KGgGyoH",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 375.79827545947103,
			"y": 222.62091485816802,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 386.87481689453125,
			"height": 168,
			"seed": 1800628914,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1691659939859,
			"link": null,
			"locked": false,
			"fontSize": 20,
			"fontFamily": 3,
			"text": "algo3设置状态前不知另一进程的状态，且\n进入临界区之前不会回退，导致死锁。若采\n用谦让机制，每隔一段时间修改自己flag，\n让另一进程进入临界区。\n\n缺点：1.若两进程执行速度完全一致，等待\n间隔也一致，会产生活锁；",
			"rawText": "algo3设置状态前不知另一进程的状态，且进入临界区之前不会回退，导致死锁。若采用谦让机制，每隔一段时间修改自己flag，让另一进程进入临界区。\n\n缺点：1.若两进程执行速度完全一致，等待间隔也一致，会产生活锁；",
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "zC4JleqajGJIYJlmDNAAR",
			"originalText": "algo3设置状态前不知另一进程的状态，且进入临界区之前不会回退，导致死锁。若采用谦让机制，每隔一段时间修改自己flag，让另一进程进入临界区。\n\n缺点：1.若两进程执行速度完全一致，等待间隔也一致，会产生活锁；",
			"lineHeight": 1.2,
			"baseline": 163
		},
		{
			"type": "arrow",
			"version": 367,
			"versionNonce": 1007066606,
			"isDeleted": false,
			"id": "dTGkYqDSLk2nwF8owYRYT",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 207.50294505524226,
			"y": 648.251544269482,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 179.39940551816125,
			"height": 100.19712940445163,
			"seed": 584899182,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1691660016169,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "sG77NSV6VXstfMvTFgp9a",
				"gap": 17.438659340956416,
				"focus": 0.43214341202796697
			},
			"endBinding": {
				"elementId": "G6GhJgNG7fTVgPLrwvtb6",
				"gap": 1,
				"focus": 0.8064537635842385
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
					179.39940551816125,
					-100.19712940445163
				]
			]
		},
		{
			"type": "rectangle",
			"version": 252,
			"versionNonce": 628343150,
			"isDeleted": false,
			"id": "G6GhJgNG7fTVgPLrwvtb6",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 387.9023505734035,
			"y": 503.5906118278648,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 422,
			"height": 218,
			"seed": 1361158766,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 3
			},
			"boundElements": [
				{
					"type": "text",
					"id": "sZthAbuG"
				},
				{
					"id": "dTGkYqDSLk2nwF8owYRYT",
					"type": "arrow"
				}
			],
			"updated": 1691658862960,
			"link": null,
			"locked": false
		},
		{
			"type": "text",
			"version": 686,
			"versionNonce": 1840632946,
			"isDeleted": false,
			"id": "sZthAbuG",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 394.4493171261379,
			"y": 516.5906118278648,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 408.90606689453125,
			"height": 192,
			"seed": 616040878,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1691658862961,
			"link": null,
			"locked": false,
			"fontSize": 20,
			"fontFamily": 3,
			"text": "flag表示进程状态；turn表示哪个进程有权\n进入临界区，实现谦让的目的。进入临界区时\n，设置自己flag为true，检查另一个flag，\n若为false则直接进入；若为true，则检查tu\nrn是否为自己，若是则另一进程同时延期执行\n并设置flag为false让步，本进程循环检查另\n一个flag直到其为false；执行完临界区后，\n设置flag为false，并置turn为另一者。",
			"rawText": "flag表示进程状态；turn表示哪个进程有权进入临界区，实现谦让的目的。进入临界区时，设置自己flag为true，检查另一个flag，若为false则直接进入；若为true，则检查turn是否为自己，若是则另一进程同时延期执行并设置flag为false让步，本进程循环检查另一个flag直到其为false；执行完临界区后，设置flag为false，并置turn为另一者。",
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "G6GhJgNG7fTVgPLrwvtb6",
			"originalText": "flag表示进程状态；turn表示哪个进程有权进入临界区，实现谦让的目的。进入临界区时，设置自己flag为true，检查另一个flag，若为false则直接进入；若为true，则检查turn是否为自己，若是则另一进程同时延期执行并设置flag为false让步，本进程循环检查另一个flag直到其为false；执行完临界区后，设置flag为false，并置turn为另一者。",
			"lineHeight": 1.2,
			"baseline": 187
		},
		{
			"type": "arrow",
			"version": 490,
			"versionNonce": 475999090,
			"isDeleted": false,
			"id": "1rzpe0-KqyDAZMRsagu9b",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 204.73812870326068,
			"y": 912.7420089318067,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 173.97011699081528,
			"height": 30.030890621346202,
			"seed": 2033214450,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 2
			},
			"boundElements": [],
			"updated": 1691660291994,
			"link": null,
			"locked": false,
			"startBinding": {
				"elementId": "sG77NSV6VXstfMvTFgp9a",
				"gap": 14.673842988974915,
				"focus": 0.47338486666677626
			},
			"endBinding": {
				"elementId": "PoNlNGMsZIrcbWjrr_hgg",
				"gap": 8.194104879327561,
				"focus": -0.5516779077202333
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
					173.97011699081528,
					30.030890621346202
				]
			]
		},
		{
			"type": "rectangle",
			"version": 384,
			"versionNonce": 1256725614,
			"isDeleted": false,
			"id": "PoNlNGMsZIrcbWjrr_hgg",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 386.9023505734035,
			"y": 817.2572784945315,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 429,
			"height": 185,
			"seed": 537396274,
			"groupIds": [],
			"frameId": null,
			"roundness": {
				"type": 3
			},
			"boundElements": [
				{
					"type": "text",
					"id": "lZS5Tk0q"
				},
				{
					"id": "1rzpe0-KqyDAZMRsagu9b",
					"type": "arrow"
				}
			],
			"updated": 1691658738190,
			"link": null,
			"locked": false
		},
		{
			"type": "text",
			"version": 995,
			"versionNonce": 482762414,
			"isDeleted": false,
			"id": "lZS5Tk0q",
			"fillStyle": "hachure",
			"strokeWidth": 1,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"angle": 0,
			"x": 392.1055671261379,
			"y": 849.7572784945315,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"width": 418.59356689453125,
			"height": 120,
			"seed": 2130351406,
			"groupIds": [],
			"frameId": null,
			"roundness": null,
			"boundElements": [],
			"updated": 1691658738195,
			"link": null,
			"locked": false,
			"fontSize": 20,
			"fontFamily": 3,
			"text": "进程先声明自己想要进入临界区(flag-\n>true)，但都谦让对方(turn=P_other)，因\n此在忙等待中必有一者等待，一者进入临界区\n，进入临界区的进程执行完后将自身flag置为f\nalse，另一进程解锁，进入临界区。",
			"rawText": "进程先声明自己想要进入临界区(flag->true)，但都谦让对方(turn=P_other)，因此在忙等待中必有一者等待，一者进入临界区，进入临界区的进程执行完后将自身flag置为false，另一进程解锁，进入临界区。",
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "PoNlNGMsZIrcbWjrr_hgg",
			"originalText": "进程先声明自己想要进入临界区(flag->true)，但都谦让对方(turn=P_other)，因此在忙等待中必有一者等待，一者进入临界区，进入临界区的进程执行完后将自身flag置为false，另一进程解锁，进入临界区。",
			"lineHeight": 1.2,
			"baseline": 115
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
		"currentItemFontFamily": 3,
		"currentItemFontSize": 20,
		"currentItemTextAlign": "center",
		"currentItemStartArrowhead": null,
		"currentItemEndArrowhead": "arrow",
		"scrollX": 238.914803398356,
		"scrollY": 217.5947519704632,
		"zoom": {
			"value": 0.55
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