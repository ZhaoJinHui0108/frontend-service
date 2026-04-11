<template>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" :style="{ width: col.width }">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="index">
          <td v-for="col in columns" :key="col.key">
            <slot :name="col.key" :row="row">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
export interface TableColumn {
  key: string
  label: string
  width?: string
}

interface Props {
  columns: TableColumn[]
  data: Record<string, any>[]
}

defineProps<Props>()
</script>

<style scoped>
.table-wrapper {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #fafafa;
  font-weight: 600;
  font-size: 13px;
  color: #45515e;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

td {
  padding: 16px;
  border-bottom: 1px solid #f2f3f5;
  font-size: 14px;
  color: #222222;
}

tr:hover td {
  background: #fafafa;
}
</style>
