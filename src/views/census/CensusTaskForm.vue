<template>
  <div class="page-container">
    <el-page-header @back="router.push('/census')" :title="'返回列表'">
      <template #content>
        <span class="page-title">{{ isEdit ? '编辑普查任务' : '创建普查任务' }}</span>
      </template>
    </el-page-header>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" style="margin-top: 20px;">
      <el-card shadow="never">
        <!-- AI 建议横幅 -->
        <div v-if="!isEdit && aiSettings.featureFlags.planningAi" style="margin-bottom: 16px; padding: 12px 16px; background: linear-gradient(135deg, #e8f0fa, #f0f5fb); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <el-icon :size="18" color="#1a5fc5"><MagicStick /></el-icon>
            <span style="color: #1a5fc5; font-weight: 600;">让 AI 帮您规划任务</span>
            <span style="color: #909399; font-size: 13px;">基于历史数据推荐区域、字段、日期、人员</span>
          </div>
          <el-button type="primary" :icon="MagicStick" @click="showAiSuggestion = true">AI 建议</el-button>
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务名称" prop="title">
              <el-input v-model="form.title" placeholder="请输入任务名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止日期" prop="deadline">
              <el-date-picker v-model="form.deadline" type="date" value-format="YYYY-MM-DD" placeholder="选择截止日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="任务描述" prop="description">
              <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请描述普查任务的目标和要求" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="必填字段" prop="requiredFields">
              <el-checkbox-group v-model="form.requiredFields">
                <el-checkbox v-for="field in availableFields" :key="field.value" :label="field.value">{{ field.label }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="分配区域" prop="assignedAreaCodes">
              <AreaAssignTree v-model="form.assignedAreaCodes" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <div style="margin-top: 20px; text-align: center;">
        <el-button @click="router.push('/census')">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '保存修改' : '创建任务' }}
        </el-button>
      </div>
    </el-form>

    <!-- AI 建议对话框 -->
    <AiTaskSuggestion v-model:visible="showAiSuggestion" :task-info="{ title: form.title, description: form.description }" @accept="handleAiAccept" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCensusStore } from '@/stores/census'
import { useAiSettingsStore } from '@/stores/aiSettings'
import { ElMessage } from 'element-plus'
import { MagicStick } from '@element-plus/icons-vue'
import AreaAssignTree from '@/components/census/AreaAssignTree.vue'
import AiTaskSuggestion from '@/components/ai/AiTaskSuggestion.vue'

const route = useRoute()
const router = useRouter()
const store = useCensusStore()
const aiSettings = useAiSettingsStore()

const isEdit = computed(() => !!route.params.id)
const formRef = ref(null)
const submitting = ref(false)
const showAiSuggestion = ref(false)

const availableFields = [
  { value: 'name', label: '单位名称' },
  { value: 'creditCode', label: '信用代码' },
  { value: 'category', label: '类别' },
  { value: 'rooms', label: '客房数' },
  { value: 'beds', label: '床位数' },
  { value: 'occupancyRate', label: '入住率' },
  { value: 'adr', label: '平均房价' },
  { value: 'revpar', label: 'RevPAR' },
  { value: 'annualRevenue', label: '年营收' },
  { value: 'staffCount', label: '从业人数' },
  { value: 'licenseStatus', label: '证照状态' },
  { value: 'fireInspection', label: '消防验收' },
  { value: 'healthPermit', label: '卫生许可' },
  { value: 'hasEmergencyPlan', label: '应急预案' },
  { value: 'operatingStatus', label: '经营状态' },
  { value: 'starRating', label: '星级' },
  { value: 'brandAffiliation', label: '品牌' },
  { value: 'onlineRating', label: '在线评分' },
  { value: 'complaintCount', label: '投诉量' },
  { value: 'certifications', label: '认证资质' },
]

const form = reactive({
  title: '',
  description: '',
  deadline: '',
  requiredFields: ['name', 'creditCode', 'category', 'rooms', 'beds'],
  assignedAreaCodes: [],
})

const rules = {
  title: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择截止日期', trigger: 'change' }],
}

onMounted(async () => {
  if (isEdit.value) {
    await store.fetchTaskDetail(route.params.id)
    const task = store.currentTask
    if (task) {
      form.title = task.title
      form.description = task.description
      form.deadline = task.deadline.split('T')[0]
      try { form.requiredFields = JSON.parse(task.requiredFields || '[]') } catch {}
      try { form.assignedAreaCodes = JSON.parse(task.assignedAreaCodes || '[]') } catch {}
    }
  }
})

function handleAiAccept(accepted) {
  if (accepted.requiredFields) {
    form.requiredFields = accepted.requiredFields
    ElMessage.success('已采用 AI 推荐字段')
  }
  if (accepted.deadline) {
    form.deadline = accepted.deadline
    ElMessage.success('已采用 AI 推荐日期')
  }
  if (accepted.areaCodes) {
    form.assignedAreaCodes = [...new Set([...form.assignedAreaCodes, ...accepted.areaCodes])]
    ElMessage.success('已加入推荐区域')
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const data = {
      title: form.title,
      description: form.description,
      deadline: form.deadline,
      requiredFields: JSON.stringify(form.requiredFields),
      assignedAreaCodes: JSON.stringify(form.assignedAreaCodes),
    }

    if (isEdit.value) {
      await store.updateTask(route.params.id, data)
      ElMessage.success('修改成功')
    } else {
      await store.createTask(data)
      ElMessage.success('创建成功')
    }
    router.push('/census')
  } finally {
    submitting.value = false
  }
}
</script>
