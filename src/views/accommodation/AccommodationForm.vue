<template>
  <div class="page-container">
    <el-page-header @back="router.push('/accommodation')" :title="'返回列表'">
      <template #content>
        <span class="page-title">{{ isEdit ? '编辑住宿单位' : '新增住宿单位' }}</span>
      </template>
    </el-page-header>

    <!-- AI 工具栏 -->
    <el-card shadow="never" style="margin-top: 16px; background: linear-gradient(135deg, #e8f0fa, #f0f5fb);">
      <div style="display: flex; align-items: center; gap: 12px;">
        <el-icon :size="20" color="#1a5fc5"><MagicStick /></el-icon>
        <span style="font-weight: 600; color: #1a5fc5;">AI 辅助填报</span>
        <AiVoiceInput @fields-extracted="handleAiFields" />
        <AiPhotoExtract @extracted="handleAiFields" />
        <span style="color: #909399; font-size: 13px; margin-left: auto;">
          💡 说出或上传照片，AI 自动填表
        </span>
      </div>
    </el-card>

    <!-- 异常检测 -->
    <AiAnomalyAlert :form-data="form" @fix="handleFix" style="margin-top: 12px;" />

    <el-form ref="formRef" :model="form" :rules="rules" label-width="130px" style="margin-top: 16px;">
      <BasicInfoForm v-model="form" />
      <ScaleFacilitiesForm v-model="form" style="margin-top: 16px;" />
      <BusinessMetricsForm v-model="form" style="margin-top: 16px;" />
      <QualityBrandForm v-model="form" style="margin-top: 16px;" />
      <ComplianceSafetyForm v-model="form" style="margin-top: 16px;" />

      <div style="margin-top: 20px; text-align: center;">
        <el-button @click="router.push('/accommodation')">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '保存修改' : '提交' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAccommodationStore } from '@/stores/accommodation'
import { ElMessage } from 'element-plus'
import { validateCreditCode } from '@/utils/validators'
import BasicInfoForm from '@/components/accommodation/BasicInfoForm.vue'
import ScaleFacilitiesForm from '@/components/accommodation/ScaleFacilitiesForm.vue'
import BusinessMetricsForm from '@/components/accommodation/BusinessMetricsForm.vue'
import QualityBrandForm from '@/components/accommodation/QualityBrandForm.vue'
import ComplianceSafetyForm from '@/components/accommodation/ComplianceSafetyForm.vue'
import AiVoiceInput from '@/components/ai/AiVoiceInput.vue'
import AiPhotoExtract from '@/components/ai/AiPhotoExtract.vue'
import AiAnomalyAlert from '@/components/ai/AiAnomalyAlert.vue'

const route = useRoute()
const router = useRouter()
const store = useAccommodationStore()

const isEdit = computed(() => !!route.params.id)
const formRef = ref(null)
const submitting = ref(false)

const defaultForm = {
  name: '', creditCode: '', category: '', provinceCode: '530000', cityCode: '', countyCode: '',
  detailAddress: '', businessType: '', licenseStatus: '', openDate: '', operatingStatus: 'operating',
  rooms: 0, beds: 0, floorArea: 0, hasDining: false, hasConference: false, hasParking: false,
  hasPool: false, hasGym: false, hasAccessibility: false, fireSafetyCertified: false,
  occupancyRate: 0, adr: 0, revpar: 0, annualRevenue: 0, staffCount: 0, guestSourceMarkets: '[]',
  starRating: null, brandAffiliation: '', onlineRating: 0, complaintCount: 0, certifications: '[]',
  specialPermits: '[]', fireInspection: '', healthPermit: '', safetyIncidents: 0, hasEmergencyPlan: false,
  longitude: null, latitude: null,
}

const form = reactive({ ...defaultForm })

const rules = {
  name: [{ required: true, message: '请输入单位名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择类别', trigger: 'change' }],
  creditCode: [{ validator: validateCreditCode, trigger: 'blur' }],
  operatingStatus: [{ required: true, message: '请选择经营状态', trigger: 'change' }],
}

onMounted(async () => {
  if (isEdit.value) {
    const detail = await store.fetchDetail(route.params.id)
    if (detail) {
      Object.assign(form, detail)
    }
  }
})

// AI 字段填充
function handleAiFields(fields) {
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      form[key] = value
    }
  })
}

// AI 一键修正
function handleFix({ field, value }) {
  form[field] = value
  ElMessage.success(`已修正 ${field}`)
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await store.update(route.params.id, { ...form })
      ElMessage.success('修改成功')
    } else {
      await store.create({ ...form })
      ElMessage.success('新增成功')
    }
    router.push('/accommodation')
  } finally {
    submitting.value = false
  }
}
</script>
