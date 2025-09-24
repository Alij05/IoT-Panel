import { create } from 'zustand'

const useUsersStore = create((set) => ({
    users: [],
    setAllUsers: (usersList) => set({ users: usersList }),
    addusers: (newuser) => set((state) => ({ users: [...state.users, newuser] })),
    clearusers: () => set({ users: [] }),
}))


export default useUsersStore