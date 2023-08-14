import { OpenSeaStreamClient, Network } from '@opensea/stream-js'
import { WebSocket } from 'ws'

const bootstrap = async () => {
	const client = new OpenSeaStreamClient({
		connectOptions: {
			transport: WebSocket,
		},
		network: Network.TESTNET,
		token: '',
	})
	client.connect()

	client.onItemListed('*', (e) => {
		console.log(e)
	})
}

bootstrap()
