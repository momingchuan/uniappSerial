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
		<view class="controButton">
			<button class="connectMQTT" type="default" @click="stopMQTTserver">断开服务器</button>
			<button class="breakMQTT" type="default" @click="reconnectMQTTserver">连接服务器</button>
		</view>



<!-- 		ucharts 使用 -->
  <view>
    <canvas canvas-id="ZvXOePeygEeiyvjDIdDUYPPfjaqrHYgh" id="ZvXOePeygEeiyvjDIdDUYPPfjaqrHYgh" class="charts" @touchend="tap"/>
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




	export default {
		data() {
			return {
				topic: 'home/seria', //要订阅的主题
				receivedMessage: '', // 接收到的消息
				receivedMessageSplit:[],


 
//ucharts use 
      cWidth: 750,
      cHeight: 500



			}
		},
		mounted() {

		},
	  onReady() {
    //这里的 750 对应 css .charts 的 width
    this.cWidth = uni.upx2px(750);
    //这里的 500 对应 css .charts 的 height
    this.cHeight = uni.upx2px(500);
    this.getServerData();
	  },
		
		methods: {
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
				getServerData() {
      //模拟从服务器获取数据时的延时
      setTimeout(() => {
        //模拟服务器返回数据，如果数据格式和标准格式不同，需自行按下面的格式拼接
        let res = {
            categories: ["2018","2019","2020","2021","2022","2023"],
            series: [
              {
                name: "通道1",
                lineType: "dash",
                data: [35,8,25,37,4,20]
              },
              {
                name: "通道2",
                data: [70,40,65,100,44,68]
              },
              {
                name: "通道3",
                data: [100,80,95,150,112,132]
              }
            ]
          };
        this.drawCharts('ZvXOePeygEeiyvjDIdDUYPPfjaqrHYgh', res);
      }, 500);
		},
    drawCharts(id,data){
      const ctx = uni.createCanvasContext(id, this);
      uChartsInstance[id] = new uCharts({
        type: "line",
        context: ctx,
        width: this.cWidth,
        height: this.cHeight,
        categories: data.categories,
        series: data.series,
        animation: true,
        background: "#FFFFFF",
        color: ["#1890FF","#91CB74","#FAC858","#EE6666","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
        padding: [15,10,0,15],
        enableScroll: false,
        legend: {},
        xAxis: {
          disableGrid: true
        },
        yAxis: {
          gridType: "dash",
          dashLength: 2
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
	
    tap(e){
      uChartsInstance[e.target.id].touchLegend(e);
      uChartsInstance[e.target.id].showToolTip(e);
    }
	
   }
}
</script>


<style lang="scss">
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
			.TitleBarText_min{

			}
		}

		.buttonContainer {
			display: flex;
			background-color: #00CED1;
			padding: 10px;
			justify-content:flex-end;
					.BuTitleBar1,
					.BuTitleBar2,
					.BuTitleBar3 {
					margin: 3px;
				}			
		}
		.controButton{
			display: flex;
			flex-direction:column;
			.connectMQTT,.breakMQTT{
				margin-left: 3px;
			}
		}
		




  .charts{
    width: 750rpx;
    height: 500rpx;
  }









	}
	
	
</style>