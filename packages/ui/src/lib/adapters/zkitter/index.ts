import { connectWallet, getGlobalAnonymousFeed, getProvider } from '$lib/services'
import { type Chat, chats } from '$lib/stores/chat'
import { type DraftPersona, personas } from '$lib/stores/persona'
import { get } from 'svelte/store'
import { profile } from '$lib/stores/profile'
import { saveToLocalStorage } from '$lib/utils'
import type { Adapter } from '..'
import { GroupAdapter } from './group-adapter'
import type { Signer } from 'ethers'
import { create } from 'ipfs-http-client'
import {createIdentity, generateRLNProofForNewPersona, prover} from './utils'
import { posts } from '$lib/stores/post'
import type {GenericDBAdapterInterface, Zkitter} from 'zkitter-js'
import type { Persona } from '../../stores/persona'
import { UserState } from '@unirep/core'
import { getFromLocalStorage, type SavedSeedMessages } from '../../utils'
import type { ZkIdentity as UnirepIdentity } from '@unirep/utils'
import type { ZkIdentity } from '@zk-kit/identity'
import { randomId } from '../in-memory-and-ipfs/utils'
import type {GlobalAnonymousFeed} from "../../assets/typechain";

// FIXME: no idea where whe should put these so that they don't leak. I can limit to some specific origin I guess
const IPFS_AUTH =
	'Basic Mk5Nbk1vZUNSTWMyOTlCQjYzWm9QZzlQYTU3OjAwZTk2MmJjZTBkZmQxZWQxNGNhNmY1M2JiYjYxMTli'
const IPFS_GATEWAY = 'https://kurate.infura-ipfs.io/ipfs'

export class ZkitterAdapter implements Adapter {
	private zkitter?: Zkitter
	private ipfs = create({
		host: 'ipfs.infura.io',
		port: 5001,
		protocol: 'https',
		headers: {
			authorization: IPFS_AUTH,
		},
	})

	private identity: {
		zkIdentity: ZkIdentity
		unirepIdentity: UnirepIdentity
		ecdsa: { pub: string; priv: string }
	} | null = null

	private timeout: ReturnType<typeof setTimeout> | null = null

	private contractSyncInterval: number = 60 * 1000 // 1 min

	async start() {
		const { Zkitter } = await import('zkitter-js')

		this.zkitter = await Zkitter.initialize({ groups: [] })

		if (process.env.NODE_ENV !== 'production') {
			this.zkitter.on('Zkitter.NewMessageCreated', async (msg, proof) => {
				console.log('Zkitter.NewMessageCreated', msg, proof)
			})
		}

		this.zkitter.on('Group.NewGroupMemberCreated', async (member, groupId) => {
			if (process.env.NODE_ENV !== 'production') {
				console.log('Group.NewGroupMemberCreated', member, groupId)
			}

			const [protocol, personaId] = groupId.split('_');

			if (protocol === 'kurate') {
				this.processPendingQueue(personaId)
			}
		})

		const contract = await getGlobalAnonymousFeed()

		await this.syncPersonasFromContract(contract)

		await this.zkitter.services.groups.watch()

		chats.update((state) => {
			return { ...state, loading: false }
		})
	}
	stop() {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'stop')
	}
	private async syncPersonasFromContract(contract: GlobalAnonymousFeed) {
		if (this.timeout) clearTimeout(this.timeout)
		await this.queryPersonasFromContract(contract);
		this.timeout = setTimeout(() => this.syncPersonasFromContract(contract), this.contractSyncInterval)
	}

	private async queryPersonasFromContract(contract: GlobalAnonymousFeed) {
		if (!this.zkitter) throw new Error('zkitter is not initialized')

		const numOfPersonas = (await contract.numOfPersonas()).toNumber()
		const personaStore = get(personas)

		for (let i = 0; i < numOfPersonas; i++) {
			const personaId = '' + i;

			if (!personaStore.all.has(personaId)) {
				const group = new GroupAdapter({
					globalAnonymousFeed: contract,
					db: this.zkitter.db as GenericDBAdapterInterface,
					personaId: i,
				})

				this.zkitter.services.groups.addGroup(group)

				await group.sync()

				// TODO: fix type in next zkitter-js release
				// @ts-ignore
				await this.zkitter.updateFilter({ group: [group.groupId] })

				const personaData = await contract.personas(i)

				const persona: Persona = {
					personaId,
					name: personaData.name,
					pitch: personaData.pitch,
					description: personaData.description,
					picture: personaData.profileImage,
					cover: personaData.coverImage,
					postsCount: 0,
					participantsCount: 0,
					minReputation: 5,
				}

				personas.update(state => {
					state.all.set(personaId, persona);
					return { ...state };
				})
			}
		}

		personas.update(state => ({ ...state, loading: false }))
	}


	addPersonaToFavorite(groupId: string): Promise<void> {
		return new Promise((resolve) => {
			personas.update(({ favorite, ...store }) => {
				const favoriteNew: string[] = [...favorite, groupId]

				saveToLocalStorage('favorite', favoriteNew)

				resolve()
				return { ...store, favorite: favoriteNew }
			})
		})
	}
	removePersonaFromFavorite(groupId: string): Promise<void> {
		return new Promise((resolve) => {
			personas.update(({ favorite, ...store }) => {
				const favoriteNew = favorite.filter((s) => s !== groupId)

				saveToLocalStorage('favorite', favoriteNew)

				resolve()
				return { ...store, favorite: favoriteNew }
			})
		})
	}
	addPersonaDraft(draftPersona: DraftPersona): Promise<number> {
		return new Promise((resolve) =>
			personas.update(({ draft, ...state }) => {
				const newDraft = [...draft, draftPersona]

				saveToLocalStorage('drafts', newDraft)

				resolve(newDraft.length - 1)

				return { ...state, draft: newDraft }
			}),
		)
	}
	updatePersonaDraft(index: number, draftPersona: DraftPersona): Promise<void> {
		return new Promise((resolve) =>
			personas.update(({ draft, ...state }) => {
				draft[index] = draftPersona

				saveToLocalStorage('drafts', draft)

				resolve()

				return { ...state, draft }
			}),
		)
	}
	private async savePendingMessagesForPersonaId(
		personaId: number,
		serializedMessages: string[][],
		idCommitment: string,
	): Promise<void> {
		await saveToLocalStorage<SavedSeedMessages>(`kurate/pendingMessages/${personaId}`, {
			personaId,
			serializedMessages,
			idCommitment,
		})
	}
	private async processPendingQueue(personaId: string) {
		const {Post} = await import('zkitter-js')
		const key = `kurate/pendingMessages/${personaId}`;
		const pending = getFromLocalStorage<SavedSeedMessages | false>(key, false)
		if (pending) {
			const { serializedMessages } = pending;
			const promises = serializedMessages.map(async ([hex, str]) => {
				const post = Post.fromHex(hex);
				const proof = JSON.parse(str);
				return this.zkitter!.publish(post, proof)
			})
			await Promise.all(promises)

			console.log('delete')
			saveToLocalStorage<SavedSeedMessages | false>(key, false);
		}
	}
	deleteDraftPersona(index: number): Promise<void> {
		return new Promise((resolve) =>
			personas.update(({ draft, ...state }) => {
				const newDraft = draft.filter((_, i) => i !== index)

				saveToLocalStorage('drafts', newDraft)

				resolve()

				return { ...state, draft: newDraft }
			}),
		)
	}
	async publishPersona(draftPersona: DraftPersona, signer: Signer): Promise<void> {
		if (!this.identity) throw new Error('must sign in first')
		if (!this.zkitter) throw new Error('zkitter is not initialized')

		const { MessageType, Post, PostMessageSubType } = await import('zkitter-js')

		const { unirepIdentity } = this.identity

		const contract = getGlobalAnonymousFeed()

		const state = new UserState(
			{
				prover: prover, // a circuit prover
				attesterId: (await contract.attesterId()).toBigInt(),
				unirepAddress: await contract.unirep(),
				provider: getProvider(), // an ethers.js provider
			},
			unirepIdentity,
		)

		await state.sync.start()
		await state.waitForSync()

		const pitch = new Post({
			type: MessageType.Post,
			subtype: PostMessageSubType.Default,
			payload: { content: draftPersona.pitch },
		})

		const description = new Post({
			type: MessageType.Post,
			subtype: PostMessageSubType.Default,
			payload: { content: draftPersona.description },
		})

		const seedPosts = draftPersona.posts.map(
			(post) =>
				new Post({
					type: MessageType.Post,
					subtype: PostMessageSubType.Default,
					payload: {
						content: post.text,
						attachment: post.images.length ? post.images[0] : undefined,
					},
				}),
		)

		if (draftPersona.posts.length !== 5) throw new Error('must contain exactly 5 seed posts')
		if (!draftPersona.picture) throw new Error('must contain a profile picture')
		if (!draftPersona.cover) throw new Error('must contain a cover image')

		const signupProof = await state.genUserSignUpProof()
		const contractWithSigner = await getGlobalAnonymousFeed(signer)
		const newPersonaId = (await contract.numOfPersonas()).toNumber()

		const pendingMsgs = seedPosts.concat([pitch, description]);
		const savedMsgs = [];

		for (let i = 0; i < pendingMsgs.length; i++) {
			const msg = pendingMsgs[i]
			const proof = await generateRLNProofForNewPersona(msg.hash(), this.identity.zkIdentity, newPersonaId)
			savedMsgs.push([msg.toHex(), JSON.stringify(proof)])
		}

		await contractWithSigner[
			'createAndJoinPersona(string,string,string,bytes32,bytes32,bytes32[5],uint256[],uint256[8])'
		](
			draftPersona.name,
			draftPersona.picture,
			draftPersona.cover,
			'0x' + pitch.hash(),
			'0x' + description.hash(),
			seedPosts.map(p => '0x' + p.hash()) as [string, string, string, string, string],
			signupProof.publicSignals,
			signupProof.proof,
			{ gasLimit: 6721974 },
		)

		const idCommitment = this.identity.zkIdentity.genIdentityCommitment().toString()

		await this.savePendingMessagesForPersonaId(
			newPersonaId,
			savedMsgs,
			idCommitment,
		)

		// return new Promise((resolve) => {
		// 	tokens.update(({ go, ...state }) => {
		// 		resolve()
		// 		return { ...state, go: go - CREATE_PERSONA_GO_PRICE }
		// 	})
		// })
	}

	signIn = async (): Promise<void> => {
		const signer = await connectWallet()
		const address = await signer.getAddress()

		const { zkIdentity, unirepIdentity, ecdsa } = await createIdentity(signer)

		this.identity = { zkIdentity, unirepIdentity, ecdsa }

		profile.update((state) => ({
			...state,
			signer,
			address,
			zkIdentity,
			unirepIdentity,
			ecdsa,
		}))
	}

	async uploadPicture(picture: string): Promise<string> {
		const blob = await (await fetch(picture)).blob()
		const res = await this.ipfs.add(blob)

		return res.cid.toString()
	}

	getPicture(cid: string): string {
		return `${IPFS_GATEWAY}/${cid}`
	}

	async publishPost(
		groupId: string,
		text: string,
		images: string[],
		signer: Signer,
	): Promise<void> {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'publishPost', signer)

		const post = {
			timestamp: Date.now(),
			text,
			images,
		}

		posts.addPending(post, groupId)
	}

	async subscribePersonaPosts(groupId: string): Promise<() => unknown> {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'subscribePersonaPosts')

		// FIXME:
		if (!this.zkitter) throw new Error('Zkitter is not initiated yet')

		const unsubscribe = this.zkitter.subscribe()

		posts.addPending(
			{
				text: `This is some pending persona post`,
				timestamp: Date.now(),
				images: [],
			},
			groupId,
		)

		return unsubscribe
	}

	async voteOnPost(groupId: string, postId: number, vote: '+' | '-') {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'voteOnPost')

		posts.update((state) => {
			const posts = state.data.get(groupId)
			if (posts) {
				posts.pending[postId].yourVote = vote
				state.data.set(groupId, posts)
			}

			return state
		})
	}

	startChat(chat: Chat): Promise<string> {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'startChat')

		return new Promise((resolve) => {
			const seed = randomId()
			chats.update((state) => {
				state.chats.set(seed, chat)
				resolve(seed)
				return state
			})
		})
	}
	sendChatMessage(chatId: string, text: string): Promise<void> {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'sendChatMessage')

		return new Promise((resolve) => {
			chats.update((state) => {
				const chat = state.chats.get(chatId)
				const address = get(profile).address
				if (!chat || !address) throw new Error('Chat not found')

				chat.messages.push({
					timestamp: Date.now(),
					text,
					address,
				})
				state.chats.set(chatId, chat)
				resolve()
				return { ...state }
			})
		})
	}

	subscribeToChat(chatId: string): () => unknown {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'subscribeToChat')
		const interval = setInterval(() => {
			chats.update((state) => {
				const chat = state.chats.get(chatId)
				const address = get(profile).address
				if (!chat || !address) throw new Error('Chat not found')

				const newMessage = {
					timestamp: Date.now(),
					text: 'Some random Message',
					address: randomId(),
				}
				chat.messages.push(newMessage)
				state.chats.set(chatId, chat)
				return { ...state }
			})
		}, 10000)

		return () => {
			clearInterval(interval)
		}
	}
}
