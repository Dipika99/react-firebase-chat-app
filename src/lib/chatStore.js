import { create } from 'zustand'
import { useUserStore } from './userStore';

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  changeChat: (chatId, user) => {

        const currentUser = useUserStore.getState().currentUser

        if (user.blocked.includes(currentUser.id)) {

        } else if(currentUser.blocked.includes(user.id)) {

        } else {

        }

        return set({
            chatId,
            user:user,
            isCurrentUserBlocked: false,
            isReceiverBlocked: false,
        });
    },
    changeBlock: () => {
        alert(1)
        set(state => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }))
    }
}))