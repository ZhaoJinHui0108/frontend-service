<template>
  <div class="page-container">
    <h1>用户管理</h1>
    <UiCard>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>邮箱</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <UiBadge :variant="user.is_active ? 'success' : 'error'">
                  {{ user.is_active ? '活跃' : '禁用' }}
                </UiBadge>
              </td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <UiButton variant="secondary" size="small" @click="editUser(user)">编辑</UiButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UiCard, UiButton, UiBadge } from '@/components/ui'
import { userApi, type User } from '@/services/authService'

const users = ref<User[]>([])

const loadUsers = async () => {
  const { data } = await userApi.list()
  users.value = data
}

const editUser = (user: User) => {
  // TODO: Implement edit modal
  console.log('Edit user:', user)
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(loadUsers)
</script>
