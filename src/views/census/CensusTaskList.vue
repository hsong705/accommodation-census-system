<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="page-header">
        <span class="page-title">普查任务列表</span>
        <el-button type="primary" @click="router.push('/census/create')" v-if="authStore.hasPermission('census:create')">
          <el-icon><Plus /></el-icon>创建任务
        </el-button>
      </div>

      <el-table :data="store.tasks" v-loading="store.taskLoading" stripe border>
        <el-table-column prop="title" label="任务名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <StatusTag :value="row.status" :options="CENSUS_TASK_STATUS_OPTIONS" />
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止日期" width="120" align="center">
          <template #default="{ row }">{{ formatDate(row.deadline) }}</template>
        </el-table-column>
        <el-table-column label="分配区域" width="100" align="center">
          <template #default="{ row }">{{ JSON.parse(row.assignedAreaCodes || '[]').length }}个</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" align="center">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="router.push(`/census/${row.id}`)">查看</el-button>
            <el-button link type="primary" size="small" @click="router.push(`/census/${row.id}/edit`)" v-if="row.status === 'draft' && authStore.hasPermission('census:update')">编辑</el-button>
            <el-button link type="success" size="small" @click="handlePublish(row)" v-if="row.status === 'draft' && authStore.hasPermission('census:create')">发布</el-button>
            <el-button link type="primary" size="small" @click="router.push(`/census/${row.id}/entry`)" v-if="['published', 'in_progress'].includes(row.status) && authStore.hasPermission('census:fill')">填报</el-button>
            <el-button link type="success" size="small" @click="handleComplete(row)" v-if="row.status === 'in_progress' && authStore.hasPermission('census:update')">完成</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCensusStore } from '@/stores/census'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CENSUS_TASK_STATUS_OPTIONS } from '@/utils/constants'
import { formatDate, formatDateTime } from '@/utils/formatters'
import StatusTag from '@/components/common/StatusTag.vue'

const router = useRouter()
const store = useCensusStore()
const authStore = useAuthStore()

onMounted(() => {
  store.fetchTasks()
})

async function handlePublish(task) {
  try {
    await ElMessageBox.confirm(`确定发布任务「${task.title}」吗？发布后将分配给各区域。`, '确认发布', { type: 'warning' })
    await store.publishTask(task.id)
    // 补充分配记录的区域名称
    const { useAreaStore } = await import('@/stores/area')
    const areaStore = useAreaStore()
    await areaStore.fetchAreas()
    // 更新分配记录的 areaName
    await store.fetchTaskDetail(task.id)
    for (const a of store.assignments) {
      if (!a.areaName) {
        await store.updateAssignment(a.id, { areaName: areaStore.getAreaName(a.areaCode) })
      }
    }
    await store.startTask(task.id)
    ElMessage.success('任务已发布')
    store.fetchTasks()
  } catch { /* 取消 */ }
}

async function handleComplete(task) {
  try {
    await ElMessageBox.confirm(`确定将任务「${task.title}」标记为已完成吗？`, '确认完成', { type: 'warning' })
    await store.completeTask(task.id)
    ElMessage.success('任务已完成')
    store.fetchTasks()
  } catch { /* 取消 */ }
}
</script>
