<template>
  <div class="page-container">
    <el-page-header @back="router.push('/accommodation')" :title="'返回列表'">
      <template #content>
        <span class="page-title">批量导入住宿单位</span>
      </template>
    </el-page-header>

    <el-card shadow="never" style="margin-top: 20px;">
      <el-steps :active="step" align-center style="margin-bottom: 30px;">
        <el-step title="下载模板" />
        <el-step title="上传文件" />
        <el-step title="导入完成" />
      </el-steps>

      <!-- Step 1: 下载模板 -->
      <div v-if="step === 0" style="text-align: center; padding: 40px;">
        <el-icon :size="48" color="#909399"><Download /></el-icon>
        <p style="margin: 16px 0; color: #606266;">请先下载导入模板，按照模板格式填写数据后上传</p>
        <el-button type="primary" @click="downloadTemplate">
          <el-icon><Download /></el-icon>下载导入模板
        </el-button>
        <div style="margin-top: 20px;">
          <el-button type="primary" @click="step = 1">我已下载模板，下一步</el-button>
        </div>
      </div>

      <!-- Step 2: 上传文件 -->
      <div v-if="step === 1" style="text-align: center; padding: 40px;">
        <el-upload
          ref="uploadRef"
          drag
          :auto-upload="false"
          accept=".xlsx,.xls"
          :limit="1"
          :on-change="handleFileChange"
          :on-exceed="() => ElMessage.warning('只能上传一个文件')"
        >
          <el-icon :size="48" color="#c0c4cc"><Upload /></el-icon>
          <div style="margin-top: 10px;">将 Excel 文件拖拽到此处，或<em>点击上传</em></div>
          <template #tip>
            <div style="color: #909399; font-size: 12px;">只能上传 .xlsx / .xls 文件</div>
          </template>
        </el-upload>
        <div style="margin-top: 20px;">
          <el-button @click="step = 0">上一步</el-button>
          <el-button type="primary" :loading="importing" :disabled="!selectedFile" @click="handleImport">
            开始导入
          </el-button>
        </div>
      </div>

      <!-- Step 3: 结果 -->
      <div v-if="step === 2" style="text-align: center; padding: 40px;">
        <el-result icon="success" title="导入完成" :sub-title="`成功导入 ${importCount} 条住宿单位数据`">
          <template #extra>
            <el-button type="primary" @click="router.push('/accommodation')">返回列表</el-button>
            <el-button @click="resetImport">继续导入</el-button>
          </template>
        </el-result>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAccommodationStore } from '@/stores/accommodation'
import { ElMessage } from 'element-plus'
import { importFromExcel, downloadImportTemplate } from '@/utils/excel'
import { CATEGORY_MAP, OPERATING_STATUS_MAP, LICENSE_STATUS_MAP } from '@/utils/constants'

const router = useRouter()
const store = useAccommodationStore()

const step = ref(0)
const uploadRef = ref(null)
const selectedFile = ref(null)
const importing = ref(false)
const importCount = ref(0)

const CATEGORY_REVERSE_MAP = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k])
)
const OPERATING_REVERSE_MAP = Object.fromEntries(
  Object.entries(OPERATING_STATUS_MAP).map(([k, v]) => [v, k])
)
const LICENSE_REVERSE_MAP = Object.fromEntries(
  Object.entries(LICENSE_STATUS_MAP).map(([k, v]) => [v, k])
)

function downloadTemplate() {
  downloadImportTemplate()
  ElMessage.success('模板已下载')
}

function handleFileChange(file) {
  selectedFile.value = file.raw
}

async function handleImport() {
  if (!selectedFile.value) return

  importing.value = true
  try {
    const columnMapping = {
      '单位名称': 'name',
      '统一社会信用代码': 'creditCode',
      '客房数': 'rooms',
      '床位数': 'beds',
      '建筑面积(㎡)': 'floorArea',
      '详细地址': 'detailAddress',
      '经营主体类型': 'businessType',
      '入住率(%)': 'occupancyRate',
      '平均房价(元)': 'adr',
      '从业人数': 'staffCount',
    }

    const rows = await importFromExcel(selectedFile.value, columnMapping)

    // 数据清洗和转换
    const cleanedRows = rows.map(row => ({
      ...row,
      provinceCode: '530000',
      category: CATEGORY_REVERSE_MAP[row.category] || row.category || 'other',
      operatingStatus: OPERATING_REVERSE_MAP[row.operatingStatus] || row.operatingStatus || 'operating',
      licenseStatus: LICENSE_REVERSE_MAP[row.licenseStatus] || row.licenseStatus || 'none',
      rooms: Number(row.rooms) || 0,
      beds: Number(row.beds) || 0,
      floorArea: Number(row.floorArea) || 0,
      occupancyRate: Number(row.occupancyRate) || 0,
      adr: Number(row.adr) || 0,
      staffCount: Number(row.staffCount) || 0,
      guestSourceMarkets: '[]',
      certifications: '[]',
      specialPermits: '[]',
      hasDining: row.hasDining === '是',
      hasConference: row.hasConference === '是',
      hasParking: row.hasParking === '是',
      hasPool: row.hasPool === '是',
      hasGym: row.hasGym === '是',
      hasAccessibility: row.hasAccessibility === '是',
      fireSafetyCertified: row.fireSafetyCertified === '是',
      starRating: null,
      brandAffiliation: '',
      onlineRating: 0,
      complaintCount: 0,
      fireInspection: '',
      healthPermit: '',
      safetyIncidents: 0,
      hasEmergencyPlan: false,
      longitude: null,
      latitude: null,
    }))

    await store.batchImport(cleanedRows)
    importCount.value = cleanedRows.length
    step.value = 2
  } catch (err) {
    ElMessage.error('导入失败：' + err.message)
  } finally {
    importing.value = false
  }
}

function resetImport() {
  step.value = 0
  selectedFile.value = null
  importCount.value = 0
}
</script>
