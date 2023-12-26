<template>
	<view class="mainContent">


		<!-- 标题显示 -->
		<view class="TitleBar">
			<text class="TitleBarText">深浦SENPUM</text>
			<text class="TitleBarText_min">感知新技术 sensing new technology</text>
		</view>

		<view class="buttonContainer">
			<view class="buttonContainer1">
				<button class="BuTitleBar1" size="mini">关于</button>
			</view>
			<view class="buttonContainer2">
				<button class="BuTitleBar2" size="mini">工具</button>
			</view>
			<view class="buttonContainer3">
				<button class="BuTitleBar3" size="mini">设置</button>
			</view>
			<view class="buttonContainer4">
				<navigator url="../home/home" open-type="redirect">
					<button class="BuTitleBar4" size="mini">主页</button>
				</navigator>
			</view>
			
		</view>




		<!-- 数据显示 -->
		<view class="OriginalData">
			原始数据： {{ receivedMessage }}
		</view>

		<view class="count1">
			计数1： {{ receivedMessageSplit[0] }}

		</view>
		<view class="count2">
			计数2： {{ receivedMessageSplit[1] }}

		</view>
		<view class="count2">
			计数3： {{ receivedMessageSplit[2] }}

		</view>
		<view class="count2">
			计数4： {{ receivedMessageSplit[3] }}

		</view>
		<view class="controButton_father">
			<view class="controButton_break">
				<button class="breakMQTT" type="default" @click="stopMQTTserver">断开服务器</button>
			</view>
			<view class="controButton_conne">
				<button class="connectMQTT" type="default" @click="reconnectMQTTserver">连接服务器</button>
			</view>


		</view>



		<view class="printText_father">

			<text>数据打印区域:</text>

			<view class="printText">
				<textarea class="printText_txt" v-model="outPrintText"></textarea>
			</view>


		</view>


		<!-- 		ucharts 使用 -->
		<view>
			
			<view class="uchartsCtr1">
				
				数据图表：
			<canvas canvas-id="ZvXOePeygEeiyvjDIdDUYPPfjaqrHYgh" id="ZvXOePeygEeiyvjDIdDUYPPfjaqrHYgh" class="charts"
				@touchend="tap" />				
			</view>

		</view>








	</view>



</template>




<script>
	import {
		v4
	} from 'uuid';
	import {
		MQTT_IP,
		MQTT_OPTIONS
	} from '@/utils/mqtt.js';
	var mqtt = require('mqtt/dist/mqtt.js')
	var client


	import uCharts from '@/uCharts/u-charts.js';
	var uChartsInstance = {};


	var numberAdd = 0;




	export default {
		data() {
			return {
				topic: 'home/seria', //要订阅的主题
				receivedMessage: '', // 接收到的消息
				receivedMessageSplit: [],
				//print text
				outPrintText: "",

				//ucharts use 
				cWidth: 1000,
				cHeight: 1000,

				//uchars show graph data 
				fillShowArray1: [],
				fillShowArray2: [],
				fillShowArray3: [],
				fillShowArray4: [],

			}
		},


		mounted() {

		},

		onReady() {
			//这里的 750 对应 css .charts 的 width
			this.cWidth = uni.upx2px(750);
			//这里的 500 对应 css .charts 的 height
			this.cHeight = uni.upx2px(500);
			this.getServerData([0], [0], [0], [0]);
		},

		methods: {

			fillAndShiftArray(myArray, newData) {

				if (myArray.length < 50) {
					myArray.push(newData); // 填充新数据到数组末尾
				} else {
					myArray.shift(); // 移除数组的第一个元素
					myArray.push(newData); // 将新的数据插入数组的最后一位
				}
			},

			connect() {

				MQTT_OPTIONS.clientId = v4()
				var that = this
				// #ifdef H5
				client = mqtt.connect('ws://' + MQTT_IP, {
					...MQTT_OPTIONS,
					autoConnect: true
				}); //Manual connection
				//    client = mqtt.connect('ws://' + MQTT_IP, MQTT_OPTIONS) auto connection
				// #endif
				// #ifdef MP-WEIXIN||APP-PLUS
				client = mqtt.connect('wx://' + MQTT_IP, MQTT_OPTIONS)
				//  #endif
				client.on('connect', function() {
					console.log('连接成功')
					client.subscribe(that.topic, function(err) {
						if (!err) {
							console.log('订阅成功')
						}
					})
				}).on('reconnect', function(error) {
					console.log('正在重连...', that.topic)
				}).on('error', function(error) {
					console.log('连接失败...', error)
				}).on('end', function() {
					console.log('连接断开')
				}).on('message', function(topic, message) {
					//                console.log('接收推送信息：', message.toString())
					that.receivedMessage = message.toString(); // 将接收到的消息存储到数据属性中
					that.receivedMessageSplit = that.receivedMessage.split(',');

					//print out data 
					that.outPrintText += that.receivedMessageSplit[0] + '\n';
					that.outPrintText += that.receivedMessageSplit[1] + '\n';
					that.outPrintText += that.receivedMessageSplit[2] + '\n';
					that.outPrintText += that.receivedMessageSplit[3] + '\n';


					try { // 调用可能会抛出异常的函数


						that.fillAndShiftArray(that.fillShowArray1, that.receivedMessageSplit[0]);
						that.fillAndShiftArray(that.fillShowArray2, that.receivedMessageSplit[1]);
						that.fillAndShiftArray(that.fillShowArray3, that.receivedMessageSplit[2]);
						that.fillAndShiftArray(that.fillShowArray4, that.receivedMessageSplit[3]);

					} catch (error) { // 捕获并处理抛出的异常

						console.error(error.message); // 输出异常信息
					}
					that.getServerData(that.fillShowArray1, that.fillShowArray2, that.fillShowArray3, that
						.fillShowArray4);

				})

			},

			stopMQTTserver() {
				if (client.connected) {
					client.end(); // 断开与 MQTT 服务器的连接
				}
			},

			reconnectMQTTserver() {
				if (typeof client !== 'undefined' && client.connected) {
					console.log('已连接到 MQTT 服务器');
				} else {
					if (!this.connecting) {
						this.connecting = true; // 设置连接中的标识，防止并发连接
						this.connect(); // 连接说
						setTimeout(() => {
							this.connecting = false; // 连接完成后重置连接中的标识，表示可以进行下一次连接
						}, 200); // 设置延时时间
					}
					console.log('正在连接 MQTT 服务器');
				}
			},




			//ucharts use
			getServerData(data1, data2, data3, data4) {
				//模拟从服务器获取数据时的延时
				setTimeout(() => {
					//模拟服务器返回数据，如果数据格式和标准格式不同，需自行按下面的格式拼接
					let res = {
						categories: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
							"11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
							"21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
							"31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
							"41", "42", "43", "44", "45", "46", "47", "48", "49", "50"
						],
						series: [{
								name: "通道1",
								// lineType: "dash",
								data: data1
							},
							{
								name: "通道2",
								data: data2
							},
							{
								name: "通道3",
								data: data3
							},
							{
								name: "通道4",
								data: data4
							}

						]
					};
					this.drawCharts('ZvXOePeygEeiyvjDIdDUYPPfjaqrHYgh', res);
				}, 500);

			},
			drawCharts(id, data) {
				const ctx = uni.createCanvasContext(id, this);
				uChartsInstance[id] = new uCharts({
					
					type: "line",
					context: ctx,
					width: this.cWidth,
					height: this.cHeight,
					categories: data.categories,
					series: data.series,
					animation: false,
					background: "#FFFFFF",
					color: ["#1890FF", "#91CB74", "#FAC858", "#EE6666", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4",
						"#ea7ccc"
					],
					padding: [15, 10, 0, 15],
					enableScroll: false,
					legend: {},
					xAxis: {
						disableGrid: true,
						disabled: true,

					},
					yAxis: {
						gridType: "dash",
						dashLength: 2,
						splitNumber:10,
					},
					extra: {
						line: {
							type: "curve",
							width: 2,
							activeType: "hollow"
						}
					}
				});
			},

			tap(e) {
				uChartsInstance[e.target.id].touchLegend(e);
				uChartsInstance[e.target.id].showToolTip(e);
			}


		}
	}
</script>


<style lang="scss">
	
  @keyframes blinking {
    0% { opacity: 1;  color: red; }
    20% { opacity: 1;  color: blue; }
	40% { opacity: 1;  color: green; }
    60% { opacity: 1;  color: darkcyan; }
	60% { opacity: 0;   }
  } 

	
	.mainContent {

		.TitleBar {
			width: 100%;
			background-color: #00CED1;
			align-items: center;
			padding: 20px;

			.TitleBarText {
				display: block;
				font-size: 30px;
			}

			.TitleBarText_min {
				animation: blinking 3s infinite;
				
			}
		}

		.buttonContainer {
			display: flex;
			background-color: #00CED1;
			padding: 10px;
			justify-content: flex-end;

			.BuTitleBar1,
			.BuTitleBar2,
			.BuTitleBar3,
			.BuTitleBar4
			{
				margin: 3px;
			}
		}

		.controButton_father {


			flex-direction: column;

			.controButton_break {
				padding-top: 5px;
				display: flex;
				margin-left: 3px;

				.breakMQTT {

					margin-left: 3px;
				}
			}

			.controButton_conne {
				display: flex;
				padding-top: 5px;
				margin-left: 3px;

				.connectMQTT {

					margin-left: 3px;
				}

			}

		}



		.printText_father {
			padding-top: 20px;

			.printText {

				border: 2px solid #ff0000;
				/* 设置边框为1px粗细的红色边框 */
				height: 200px;

				.printText_txt {
					width: 100%;
					/* 设置宽度为300像素 */
					height: 200px;
					/* 设置高度为200像素 */
					overflow: auto;
					/* 或者使用 overflow: scroll; */
				}

			}
		}



.uchartsCtr1{
	
	padding-top: 50px;
		//曲线图
		.charts {
			width: 750rpx;
			height: 500rpx;
		}
	
	
}









	}
</style>