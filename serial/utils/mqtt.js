export const MQTT_IP = '121.40.165.157:8083/mqtt'//mqtt地址端口, 使用emqx时一定要加mqtt
const MQTT_USERNAME = 'uniapp'//mqtt用户名
const MQTT_PASSWORD = '631001833'//密码

export const MQTT_OPTIONS = {
    connectTimeout: 10000,
    clientId: '',
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    clean: false,
	
}

