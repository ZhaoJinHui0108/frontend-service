import { ref } from 'vue'
import { authApi, type UserWithRoles } from '@/services/authService'
import { useRouter } from 'vue-router'

export function useAuth() {
  const router = useRouter()
  const user = ref<UserWithRoles | null>(null)
  const loading = ref(false)
  const error = ref('')

  const fetchUser = async () => {
    try {
      const res = await authApi.getMe()
      user.value = res.data
    } catch (err: any) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('refresh_token')
      router.push('/login')
    }
  }

  const login = async (username: string, password: string) => {
    loading.value = true
    error.value = ''
    try {
      const { data } = await authApi.login({ username, password })
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      await fetchUser()
      router.push('/')
    } catch (err: any) {
      error.value = err.response?.data?.detail || '登录失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')
    user.value = null
    router.push('/login')
  }

  const isAuthenticated = () => {
    return !!localStorage.getItem('access_token')
  }

  return {
    user,
    loading,
    error,
    fetchUser,
    login,
    logout,
    isAuthenticated
  }
}
