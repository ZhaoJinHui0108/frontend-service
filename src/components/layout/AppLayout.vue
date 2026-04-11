<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-brand">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#3b82f6"/>
            <path d="M7 12L10 15L17 8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Code Learning</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div v-for="item in menuItems" :key="item.label" class="menu-group">
          <template v-if="item.children">
            <button
              class="menu-parent"
              :class="{ active: openMenus.has(item.label) }"
              @click="toggleMenu(item.label)"
            >
              <span class="menu-icon">{{ item.icon }}</span>
              <span class="menu-label">{{ item.label }}</span>
              <span class="menu-arrow" :class="{ open: openMenus.has(item.label) }">▶</span>
            </button>
            <div v-if="openMenus.has(item.label)" class="menu-children">
              <router-link
                v-for="child in item.children"
                :key="child.path"
                :to="child.path!"
                class="menu-child"
                :class="{ active: isChildActive(child.path!) }"
              >
                {{ child.label }}
              </router-link>
            </div>
          </template>
          <router-link
            v-else
            :to="item.path!"
            class="menu-item"
            :class="{ active: $route.path === item.path }"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-label">{{ item.label }}</span>
          </router-link>
        </div>
      </nav>
    </aside>

    <div class="layout-main" :style="{ marginRight: isChatOpen ? '420px' : '0' }">
      <header class="topbar">
        <div class="topbar-spacer" />
        <div class="topbar-actions">
          <button class="btn btn-primary btn-small" @click="openChat">
            <span>🤖</span>
            <span>AI 助手</span>
          </button>

          <div ref="userMenuRef" class="user-menu">
            <button class="user-avatar-btn" @click="toggleUserMenu">
              <div class="user-avatar">
                {{ user?.username?.charAt(0).toUpperCase() || 'U' }}
              </div>
            </button>
            <div v-if="isUserMenuOpen" class="user-dropdown">
              <div class="user-info">
                <div class="username">{{ user?.username || 'User' }}</div>
                <div class="user-email">{{ user?.email || '' }}</div>
              </div>
              <button class="dropdown-item" @click="goToSettings">
                <span>⚙️</span>
                <span>设置</span>
              </button>
              <div class="dropdown-divider" />
              <button class="dropdown-item danger" @click="handleLogout">
                <span>🚪</span>
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="content">
        <router-view />
      </main>
    </div>

    <div class="chat-sidebar-container" :style="{ transform: isChatOpen ? 'translateX(0)' : 'translateX(100%)' }">
      <ChatSidebar :is-open="isChatOpen" @close="closeChat" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ChatSidebar from './ChatSidebar.vue'
import { authApi, type UserWithRoles } from '@/services/authService'

interface MenuItem {
  label: string
  path?: string
  icon?: string
  children?: { label: string; path: string }[]
}

const router = useRouter()
const route = useRoute()

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/', icon: '📊' },
  {
    label: 'AI-Learing',
    icon: '🤖',
    children: [
      { label: '分类 (Classification)', path: '/ai-learning?type=classification' },
      { label: '回归 (Regression)', path: '/ai-learning?type=regression' },
      { label: '聚类 (Clustering)', path: '/ai-learning?type=clustering' },
      { label: '目标检测', path: '/ai-learning?type=object_detection' },
      { label: '语义分割', path: '/ai-learning?type=semantic_segmentation' },
      { label: '序列生成', path: '/ai-learning?type=sequence_generation' },
      { label: '问答系统', path: '/ai-learning?type=question_answering' },
      { label: '推荐系统', path: '/ai-learning?type=recommendation' }
    ]
  },
  { label: 'Scheduled Tasks', path: '/scheduled-tasks', icon: '⏰' },
  { label: 'Notes', path: '/notes', icon: '📝' },
  {
    label: 'Users',
    icon: '👥',
    children: [
      { label: 'User List', path: '/users' },
      { label: 'Roles', path: '/roles' },
      { label: 'Permissions', path: '/permissions' }
    ]
  },
  {
    label: 'Settings',
    icon: '⚙️',
    children: [
      { label: 'Init', path: '/init' },
      { label: 'Sensitive Configs', path: '/sensitive-configs' }
    ]
  }
]

const user = ref<UserWithRoles | null>(null)
const isChatOpen = ref(false)
const isUserMenuOpen = ref(false)
const openMenus = ref<Set<string>>(new Set(['Dashboard']))
const userMenuRef = ref<HTMLElement | null>(null)

const toggleMenu = (label: string) => {
  const newSet = new Set(openMenus.value)
  if (newSet.has(label)) {
    newSet.delete(label)
  } else {
    newSet.clear()
    newSet.add(label)
  }
  openMenus.value = newSet
}

const isChildActive = (childPath: string): boolean => {
  const currentPath = decodeURIComponent(route.path + route.query)
  const targetPath = decodeURIComponent(childPath)
  const [targetBase, targetQuery] = targetPath.split('?')
  const [currentBase, currentQuery] = currentPath.split('?')
  
  if (targetBase !== currentBase) return false
  if (targetQuery) return currentQuery === targetQuery
  return !currentQuery
}

const openChat = () => {
  isChatOpen.value = true
}

const closeChat = () => {
  isChatOpen.value = false
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const goToSettings = () => {
  isUserMenuOpen.value = false
  router.push('/sensitive-configs')
}

const handleLogout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  sessionStorage.removeItem('access_token')
  sessionStorage.removeItem('refresh_token')
  router.push('/login')
}

const handleClickOutside = (e: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
    isUserMenuOpen.value = false
  }
}

const checkOpenChat = () => {
  const openChat = localStorage.getItem('openChatSidebar')
  if (openChat) {
    localStorage.removeItem('openChatSidebar')
    isChatOpen.value = true
  }
}

onMounted(() => {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
  if (token) {
    authApi.getMe().then((res) => {
      user.value = res.data
    }).catch(() => {
      handleLogout()
    })
  }

  document.addEventListener('mousedown', handleClickOutside)
  const interval = setInterval(checkOpenChat, 100)
  
  onUnmounted(() => {
    clearInterval(interval)
    document.removeEventListener('mousedown', handleClickOutside)
  })
})
</script>
