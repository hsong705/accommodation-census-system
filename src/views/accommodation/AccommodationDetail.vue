<template>
  <div class="page-container" v-loading="loading">
    <el-page-header @back="router.push('/accommodation')" :title="'返回列表'">
      <template #content>
        <span class="page-title">{{ detail?.name || '住宿单位详情' }}</span>
        <CategoryTag v-if="detail?.category" :value="detail.category" style="margin-left: 8px" />
      </template>
    </el-page-header>

    <div v-if="detail" style="margin-top: 20px;">
      <!-- 基础信息 -->
      <el-card header="基础信息" shadow="never" style="margin-bottom: 16px;">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="单位名称">{{ detail.name }}</el-descriptions-item>
          <el-descriptions-item label="统一社会信用代码">{{ detail.creditCode }}</el-descriptions-item>
          <el-descriptions-item label="类别">{{ CATEGORY_MAP[detail.category] }}</el-descriptions-item>
          <el-descriptions-item label="所在区域">{{ areaStore.getAreaName(detail.countyCode) || areaStore.getAreaName(detail.cityCode) }}</el-descriptions-item>
          <el-descriptions-item label="详细地址" :span="2">{{ detail.detailAddress }}</el-descriptions-item>
          <el-descriptions-item label="经营主体类型">{{ detail.businessType }}</el-descriptions-item>
          <el-descriptions-item label="证照状态">
            <StatusTag :value="detail.licenseStatus" :options="LICENSE_STATUS_OPTIONS" />
          </el-descriptions-item>
          <el-descriptions-item label="开业日期">{{ detail.openDate }}</el-descriptions-item>
          <el-descriptions-item label="经营状态">
            <StatusTag :value="detail.operatingStatus" :options="OPERATING_STATUS_OPTIONS" />
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 规模与设施 -->
      <el-card header="规模与设施" shadow="never" style="margin-bottom: 16px;">
        <el-descriptions :column="4" border>
          <el-descriptions-item label="客房数">{{ detail.rooms }}间</el-descriptions-item>
          <el-descriptions-item label="床位数">{{ detail.beds }}张</el-descriptions-item>
          <el-descriptions-item label="建筑面积">{{ detail.floorArea }}㎡</el-descriptions-item>
          <el-descriptions-item label="消防安全">{{ detail.fireSafetyCertified ? '合格' : '未合格' }}</el-descriptions-item>
          <el-descriptions-item label="餐饮服务">{{ detail.hasDining ? '✓' : '✗' }}</el-descriptions-item>
          <el-descriptions-item label="会议室">{{ detail.hasConference ? '✓' : '✗' }}</el-descriptions-item>
          <el-descriptions-item label="停车场">{{ detail.hasParking ? '✓' : '✗' }}</el-descriptions-item>
          <el-descriptions-item label="游泳池">{{ detail.hasPool ? '✓' : '✗' }}</el-descriptions-item>
          <el-descriptions-item label="健身房">{{ detail.hasGym ? '✓' : '✗' }}</el-descriptions-item>
          <el-descriptions-item label="无障碍设施">{{ detail.hasAccessibility ? '✓' : '✗' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 经营情况 -->
      <el-card header="经营情况" shadow="never" style="margin-bottom: 16px;">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="入住率">{{ detail.occupancyRate }}%</el-descriptions-item>
          <el-descriptions-item label="平均房价">¥{{ detail.adr }}</el-descriptions-item>
          <el-descriptions-item label="RevPAR">¥{{ detail.revpar }}</el-descriptions-item>
          <el-descriptions-item label="年营业收入">¥{{ formatNumber(detail.annualRevenue) }}</el-descriptions-item>
          <el-descriptions-item label="从业人数">{{ detail.staffCount }}人</el-descriptions-item>
          <el-descriptions-item label="客源市场">{{ parseJsonArray(detail.guestSourceMarkets).join('、') }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 品质与品牌 -->
      <el-card header="品质与品牌" shadow="never" style="margin-bottom: 16px;">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="星级">{{ detail.starRating ? detail.starRating + '星级' : '未评级' }}</el-descriptions-item>
          <el-descriptions-item label="品牌归属">{{ detail.brandAffiliation || '独立经营' }}</el-descriptions-item>
          <el-descriptions-item label="在线评分">{{ detail.onlineRating }}</el-descriptions-item>
          <el-descriptions-item label="投诉量">{{ detail.complaintCount }}次</el-descriptions-item>
          <el-descriptions-item label="认证资质" :span="2">{{ parseJsonArray(detail.certifications).join('、') || '无' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 合规与安全 -->
      <el-card header="合规与安全" shadow="never">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="消防验收">
            <StatusTag :value="detail.fireInspection" :options="FIRE_INSPECTION_OPTIONS" />
          </el-descriptions-item>
          <el-descriptions-item label="卫生许可">
            <StatusTag :value="detail.healthPermit" :options="HEALTH_PERMIT_OPTIONS" />
          </el-descriptions-item>
          <el-descriptions-item label="近一年安全事故">{{ detail.safetyIncidents }}次</el-descriptions-item>
          <el-descriptions-item label="应急预案">{{ detail.hasEmergencyPlan ? '已制定' : '未制定' }}</el-descriptions-item>
          <el-descriptions-item label="特种行业许可证" :span="2">{{ parseJsonArray(detail.specialPermits).join('、') || '无' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <div style="margin-top: 20px; text-align: right;" v-if="authStore.hasPermission('accommodation:update')">
        <el-button type="primary" @click="router.push(`/accommodation/${detail.id}/edit`)">编辑</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAccommodationStore } from '@/stores/accommodation'
import { useAuthStore } from '@/stores/auth'
import { useAreaStore } from '@/stores/area'
import { CATEGORY_MAP, OPERATING_STATUS_OPTIONS, LICENSE_STATUS_OPTIONS, FIRE_INSPECTION_OPTIONS, HEALTH_PERMIT_OPTIONS } from '@/utils/constants'
import { formatNumber } from '@/utils/formatters'
import CategoryTag from '@/components/common/CategoryTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'

const route = useRoute()
const router = useRouter()
const store = useAccommodationStore()
const authStore = useAuthStore()
const areaStore = useAreaStore()

const detail = ref(null)
const loading = ref(true)

function parseJsonArray(str) {
  if (!str) return []
  try { return JSON.parse(str) } catch { return [] }
}

onMounted(async () => {
  await areaStore.fetchAreas()
  detail.value = await store.fetchDetail(route.params.id)
  loading.value = false
})
</script>
