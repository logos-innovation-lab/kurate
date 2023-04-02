import { writable, type Writable } from 'svelte/store'

interface Message {
	timestamp: number
	text: string
	myMessage?: boolean
	system?: boolean
}

export interface Chat {
	postHash: string
	messages: Message[]
	closed?: boolean
	blocked?: boolean
}

interface ChatData {
	loading: boolean
	unread: number
	chats: Chat[]
	draft: Chat | undefined
}

export type ChatStore = Writable<ChatData>

function createChatStore(): ChatStore {
	const store = writable<ChatData>({ loading: true, unread: 0, chats: [], draft: undefined })

	return store
}

export const chats = createChatStore()
