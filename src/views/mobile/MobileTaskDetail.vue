<template>
  <div style="padding-bottom: 16px;" v-loading="loading">
    <template v-if="task">
      <!-- 任务信息卡 -->
      <div class="m-card" style="border-radius: 0 0 16px 16px; margin-top: 0;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <h3 style="margin: 0; font-size: 17px; flex: 1;">{{ task.title }}</h3>
          <StatusTag :value="task.status" :options="CENSUS_TASK_STATUS_OPTIONS" style="flex-shrink: 0;" />
        </div>
        <p style="color: #909399; font-size: 13px; margin-top: 8px; line-height: 1.5;">{{ task.description }}</p>
        <div style="display: flex; gap: 16px; margin-top: 12px; font-size: 13px; color: #909399;">
          <span><el-icon><Calendar /></el-icon> 截止：{{ formatDate(task.deadline) }}</span>
        </div>
      </div>

      <!-- 分配区域列表 -->
      <div class="m-card">
        <div style="font-size: 15px; font-weight: 600; margin-bottom: 12px;">
          填报区域（{{ censusStore.assignments.length }}个）
        </div>

        <div v-for="assignment in censusStore.assignments" :key="assignment.id"
          class="assignment-item" @click="handleStartEntry(assignment)">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 15px; font-weight: 500;">{{ assignment.areaName || assignment.areaCode }}</div>
              <div style="font-size: 12px; color: #909399; margin-top: 4px;">
                {{ assignment.assignedToName || '待分配' }}
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <el-progress type="circle" :percentage="assignment.progress" :width="40"
                :stroke-width="4" :color="assignment.progress === 100 ? '#67c23a' : '#1a5fc5'" />
              <el-icon color="#c0c4cc"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>

        <div v-if="censusStore.assignments.length === 0" style="text-align: center; color: #909399; padding: 20px;">
          暂无分配区域
        </div>
      </div>

      <!-- 底部操作 -->
      <div v-if="['published', 'in_progress'].includes(task.status)" style="padding: 0 12px;">
        <el-button type="primary" class="m-btn" style="width: 100%;" @click="handleStartEntry(censusStore.assignments[0])">
          开始填报
        </el-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCensusStore } from '@/stores/census'
import { CENSUS_TASK_STATUS_OPTIONS } from '@/utils/constants'
import { formatDate } from '@/utils/formatters'
import StatusTag from '@/components/common/StatusTag.vue'

const route = useRoute()
const router = useRouter()
const censusStore = useCensusStore()

const task = ref(null)
const loading = ref(true)

onMounted(async () => {
  await censusStore.fetchTaskDetail(route.params.id)
  task.value = censusStore.currentTask
  loading.value = false
})

function handleStartEntry(assignment) {
  if (!assignment) return
  router.push(`/m/entry/${route.params.id}/${assignment.id}`)
}
</script>

<style lang="scss" scoped>
.assignment-item {
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child { border-bottom: none; }
  &:active { background: #fafafa; }
}
</style>
