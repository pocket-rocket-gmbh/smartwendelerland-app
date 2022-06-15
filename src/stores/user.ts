import { defineStore } from 'pinia'
import { User } from '@/types/user'

export type UserState = {
  current: User
}

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    current: null
  }) as UserState,
  actions: {
    setCurrent(login: string, auth_token: string, refresh_token: string) {
      this.current = {
        login: login,
        auth_token: auth_token,
        refresh_token: refresh_token
      }
    }
  }
})
