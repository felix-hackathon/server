import NFTModel from '@/models/NFT'
import Config from './config'

export default class NFTService {
	// static async handleLogTransfer(log: LogObject, chainId: number) {
	// 	const decoded = ifaceCar.decodeEventLog('Transfer', log.data, log.topics)
	// 	const [from, to, tokenId] = decoded

	// 	if (`${from}`?.toLowerCase() === ethers.ZeroAddress) {
	// 		await NFTService.handleMint({
	// 			chainId,
	// 			nftAddress: log.address?.toLowerCase(),
	// 			nftId: `${tokenId}`,
	// 			to: `${to}`.toLowerCase(),
	// 			txHash: log.transactionHash?.toLowerCase(),
	// 			type: '1',
	// 		})
	// 	} else {
	// 		await NFTModel.updateOne(
	// 			{
	// 				chainId,
	// 				nftAddress: log.address?.toLowerCase(),
	// 				nftId: `${tokenId}`,
	// 			},
	// 			{
	// 				$set: {
	// 					owner: `${to}`?.toLowerCase(),
	// 				},
	// 			}
	// 		)
	// 	}
	// }

	static async handleMint({
		chainId,
		nftAddress,
		nftId,
		to,
		type,
		txHash,
	}: {
		nftAddress: string
		nftId: string
		chainId: number
		to: string
		type: string
		txHash: string
	}) {
		const info = this.getInfoByType({ address: nftAddress, type })
		await NFTModel.findOneAndUpdate(
			{
				chainId,
				nftAddress,
				nftId,
			},
			{
				$set: {
					owner: to,
					chainId,
					nftAddress,
					nftId,
					name: info.name,
					image: info.image,
					type,
					txHash,
				},
			},
			{
				upsert: true,
			}
		)
	}
	static getInfoByType({ address, type }: { address: string; type: string }) {
		const typesCar = [
			{
				address: Config.carAddress,
				type: '1',
				name: 'MC Laren P1',
				image: 'https://bafybeicjl76qmadyqlwfsqowthbz27gsmagit5d6bu4tlxm32mjbdcy6ki.ipfs.w3s.link/mclaren-international.svg',
			},
			{
				address: Config.carAddress,
				type: '2',
				name: 'Porsche Carrare GT',
				image: 'https://bafybeigrlckw4a3s5mh2thpv2armmenrnay37yeanvzt4yzflhszpqpkty.ipfs.w3s.link/logo-porsche.png',
			},
		]

		const typeColor = [
			{
				address: Config.colorAddress,
				type: '1',
				name: 'Gray',
				image: 'https://bafybeiadssibuix4nyh6gsyvamnkjlgktyhf5bbmf32yr4vkqafuu6da34.ipfs.w3s.link/gray.png',
			},
			{
				address: Config.colorAddress,
				type: '2',
				name: 'White',
				image: 'https://bafybeih3lhi5ezyqcaxsqhiyreoo4g5wg25ra2zonytsfq5ciyuglhqheq.ipfs.w3s.link/white.png',
			},
			{
				address: Config.colorAddress,
				type: '3',
				name: 'Black',
				image: 'https://bafybeid4szi4j6emrq5mme6ui6bb3zngle2xywxnejqdmaq5vtcsr777cm.ipfs.w3s.link/black.jpeg',
			},
			{
				address: Config.colorAddress,
				type: '4',
				name: 'Red',
				image: 'https://bafybeih54ntb7ud2zcsjppdh6wtcrcxootcrv7afplkuh2bdaiqaiaj7f4.ipfs.w3s.link/red.png',
			},
		]

		const typeRim = [
			{
				address: Config.rimAddress,
				type: '1',
				name: 'Normal',
				image: 'https://bafybeiay35vq3w6j2i64hdglucs5dmrgusdqpqmpmcsmcknmuc5hkzqcme.ipfs.w3s.link/rim-normal.webp',
			},
			{
				address: Config.rimAddress,
				type: '2',
				name: 'White',
				image: 'https://bafybeibrq2u6myx3rzxmmueos422xy5xl7fwjdnnjie7jlghqobjp73bim.ipfs.w3s.link/rim-white.webp',
			},
			{
				address: Config.rimAddress,
				type: '3',
				name: 'Carbon',
				image: 'https://bafybeibl43srap2vlnfme242afitus5pqcwde6msrm3jzoone6h56svlje.ipfs.w3s.link/rim0carbon.png',
			},
		]

		const typeBrakeDisk = [
			{
				address: Config.brakeDiskAddress,
				type: '1',
				name: 'Cast Iron',
				image: 'https://bafybeibbdr5nb3won2fbxcr3kuhuqtuk5hp7duw762p5ewcgzciq57myhe.ipfs.w3s.link/bd-iron.jpeg',
			},
			{
				address: Config.brakeDiskAddress,
				type: '2',
				name: 'Ceramic',
				image: 'https://bafybeidgtixhff4pmbrsdrszc7epuz52j7qrxs4qcjse7nuykmuezxesnu.ipfs.w3s.link/bd-ceramic.jpg',
			},
			{
				address: Config.brakeDiskAddress,
				type: '3',
				name: 'Carbon',
				image: 'https://bafybeiearqkxqk7uvpogr57aip2sg5etkab3lwfhjnr4hpnnlmtupnbzku.ipfs.w3s.link/bd-carbon.jpg',
			},
		]

		const typesCaliper = [
			{
				address: Config.caliperAddress,
				type: '1',
				name: 'Normal',
				image: 'https://bafybeicbounaa6i5cgcxjdzoeo63jgcri6lmi46hagl4vwrlf7aywhnjzq.ipfs.w3s.link/caliper-normal.jpeg',
			},
			{
				address: Config.caliperAddress,
				type: '2',
				name: 'Brembo',
				image: 'https://bafybeiapeqy2zucuvzye27alb43tfkpljh6o5qhfkccvv3cv5luybpcnu4.ipfs.w3s.link/caliper-brembo.jpeg',
			},
		]

		const typeWindShield = [
			{
				address: Config.windShieldAddress,
				type: '1',
				name: 'Normal',
				image: 'https://bafybeigchcwn2jh2ouzmyqixq4qyhemick3hsighpguaxmkwdrgzvivp7u.ipfs.w3s.link/wind-white.webp',
			},
			{
				address: Config.windShieldAddress,
				type: '2',
				name: 'Black',
				image: 'https://bafybeibzzobpq3v5b635ucpcf2ozt2nog3y5g4uwnaeyusepkeuk36cp54.ipfs.w3s.link/wind-black.jpeg',
			},
		]
		const types = [...typesCar, ...typesCaliper, ...typeColor, ...typeRim, ...typeBrakeDisk, ...typeWindShield]

		const result = types.find((i) => i.address?.toLowerCase() === address.toLowerCase() && i.type === type)
		return result
	}
}
