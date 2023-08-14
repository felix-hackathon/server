import axios from 'axios'
import AppConfig from '../configs'
import Exception from '../exception'
import KeyManagement1Inch from './key-management'

const fetcher1Inch = async (path = '', method = 'GET') => {
	const key1Inch = KeyManagement1Inch.getKey()
	const res = await axios
		.request({
			baseURL: `${AppConfig.uri1Inch}`,
			url: `${path}`,
			method,
			headers: {
				Authorization: `Bearer ${key1Inch}`,
			},
		})
		.catch((error) => {
			console.log(error)
			throw new Exception(error.response.data?.statusCode || error.response.status, error.response.data?.description || error.response.statusText)
		})

	return res
}

export default fetcher1Inch
