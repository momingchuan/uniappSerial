<template>
	<view class="mainContent">

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
			<button type="default" @click="stopMQTTserver">断开服务器</button>

		</view>

		<view class="reconnect">
			<button type="default" @click="reconnectMQTTserver">连接服务器</button>

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
	export default {
		data() {
			return {
				topic: 'home/seria', //要订阅的主题
				receivedMessage: '', // 接收到的消息
				receivedMessageSplit: '',

			}
		},
		mounted() {},
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
			}

		}
	}
</script>


<style>
	.mainContent {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
	}
</style>