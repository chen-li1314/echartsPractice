import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
    const theme = ref('newTheme')

    const changeTheme = () => {
        if (theme.value === 'newTheme') {
            theme.value = 'whiteTheme'
        } else {
            theme.value = 'newTheme'
        }
    }

    return{
        theme,
        changeTheme
    }
})