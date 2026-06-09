<template>
  <div class="page-container" v-loading="store.taskLoading">
    <el-page-header @back="router.push('/census')" :title="'返回列表'">
      <template #content>
        <span class="page-title">{{ store.currentTask?.title || '任务详情' }}</span>
        <StatusTag v-if="store.currentTask" :value="store.currentTask.status" :options="CENSUS_TASK_STATUS_OPTIONS" style="margin-left: 8px" />
        <AiRiskBadge v-if="store.currentTask && ['published', 'in_progress'].includes(store.currentTask.status)" :task-id="store.currentTask.id" style="margin-left: 8px" />
      </template>
    </el-page-header>

    <div v-if="store.currentTask" style="margin-top: 20px;">
      <TaskStatusSteps :status="store.currentTask.status" style="margin-bottom: 24px;" />

      <el-card shadow="never" style="margin-bottom: 16px;">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务名称">{{ store.currentTask.title }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <StatusTag :value="store.currentTask.status" :options="CENSUS_TASK_STATUS_OPTIONS" />
          </el-descriptions-item>
          <el-descriptions-item label="截止日期">{{ formatDate(store.currentTask.deadline) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(store.currentTask.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="任务描述" :span="2">{{ store.currentTask.description }}</el-descriptions-item>
          <el-descriptions-item label="必填字段" :span="2">
            <el-tag v-for="field in requiredFieldLabels" :key="field" size="small" style="margin: 2px;">{{ field }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card header="分配与进度" shadow="never">
        <ProgressOverview :assignments="store.assignments" />
      </el-card>

      <div style="margin-top: 20px; text-align: right;">
        <el-button v-if="['published', 'in_progress'].includes(store.currentTask.status) && authStore.hasPermission('census:fill')"
          type="primary" @click="router.push(`/census/${store.currentTask.id}/entry`)">数据填报</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCensusStore } from '@/stores/census'
import { useAuthStore } from '@/stores/auth'
import { CENSUS_TASK_STATUS_OPTIONS } from '@/utils/constants'
import { formatDate, formatDateTime } from '@/utils/formatters'
import StatusTag from '@/components/common/StatusTag.vue'
import TaskStatusSteps from '@/components/census/TaskStatusSteps.vue'
import ProgressOverview from '@/components/census/ProgressOverview.vue'
import AiRiskBadge from '@/components/ai/AiRiskBadge.vue'

const FIELD_LABELS = {
  name: '单位名称', creditCode: '信用代码', category: '类别', rooms: '客房数', beds: '床位数',
  occupancyRate: '入住率', adr: '平均房价', staffCount: '从业人数', licenseStatus: '证照状态',
  fireInspection: '消防验收', healthPermit: '卫生许可', hasEmergencyPlan: '应急预案',
  operatingStatus: '经营状态', revpar: 'RevPAR', annualRevenue: '年营收',
  starRating: '星级', brandAffiliation: '品牌', onlineRating: '在线评分',
  complaintCount: '投诉量', certifications: '认证资质',
}

const route = useRoute()
const router = useRouter()
const store = useCensusStore()
const authStore = useAuthStore()

const requiredFieldLabels = computed(() => {
  if (!store.currentTask) return []
  try {
    return JSON.parse(store.currentTask.requiredFields || '[]').map(f => FIELD_LABELS[f] || f)
  } catch { return [] }
})

onMounted(() => {
  store.fetchTaskDetail(route.params.id)
})
</script>
