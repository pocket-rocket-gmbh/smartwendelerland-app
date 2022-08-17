import { useUserStore } from "@/stores/user"

export function useUser() {

  const userStore = useUserStore()

  const currentUser = () => {
    return userStore.user
  }

  const loggedIn = ():boolean => {
    return userStore.user !== null
  }

  const isAdmin = ():boolean => {
    if (currentUser()) {
      return currentUser().role === 'root' || currentUser().role === 'admin'
    }
  }

  return {
    loggedIn,
    isAdmin,
    currentUser
  } 
}
