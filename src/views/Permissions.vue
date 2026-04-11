<template>
  <div class="page-container">
    <h1>权限管理</h1>
    <UiCard>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>资源</th>
              <th>操作</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="perm in permissions" :key="perm.id">
              <td>{{ perm.id }}</td>
              <td>{{ perm.name }}</td>
              <td>{{ perm.resource }}</td>
              <td>{{ perm.action }}</td>
              <td>{{ perm.description }}</td>
              <td>
                <UiButton variant="secondary" size="small">编辑</UiButton>
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
import { UiCard, UiButton } from '@/components/ui'
import { permissionApi, type Permission } from '@/services/authService'

const permissions = ref<Permission[]>([])

const loadPermissions = async () => {
  const { data } = await permissionApi.list()
  permissions.value = data
}

onMounted(loadPermissions)
</script>
