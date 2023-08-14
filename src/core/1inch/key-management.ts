import AppConfig from '../configs'

export default class KeyManagement1Inch {
	static keyIndex = 0
	static getKey() {
		const key = AppConfig.apiKey1Inch[this.keyIndex]
		this.keyIndex = (this.keyIndex + 1) % AppConfig.apiKey1Inch.length
		return key
	}
}
