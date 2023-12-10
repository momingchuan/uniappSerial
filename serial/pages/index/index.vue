<template>
	<view class="content">

		<view class="text-area">
		{{ receivedMessage }}
					
		</view>
	</view>
</template>




<script>
    import { v4 } from 'uuid';
    import {
        MQTT_IP,
        MQTT_OPTIONS
    } from '@/utils/mqtt.js';
    var mqtt = require('mqtt/dist/mqtt.js')
    var client
    export default {
        data() {
            return {
                topic: 'home/seria' ,//要订阅的主题
				receivedMessage: '', // 接收到的消息
            }
        },
       mounted() {this.connect() //连接
        },
        methods: {
            connect() {
                MQTT_OPTIONS.clientId = v4()
                var that = this
                // #ifdef H5
                client = mqtt.connect('ws://' + MQTT_IP, MQTT_OPTIONS)
                // #endif
                // #ifdef MP-WEIXIN||APP-PLUS
                client = mqtt.connect('wx://' + MQTT_IP, MQTT_OPTIONS)
                // #endif
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
                    console.log('接收推送信息：', message.toString())
					 that.receivedMessage = message.toString(); // 将接收到的消息存储到数据属性中
                })
            }
        }
    }
</script>


<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
