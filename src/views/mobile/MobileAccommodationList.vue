<template>
  <div style="padding-bottom: 16px;">
    <!-- 搜索框 -->
    <div style="padding: 12px 12px 0;">
      <input v-model="keyword" class="m-input" placeholder="搜索单位名称..." @input="handleSearch" />
    </div>

    <!-- 类别筛选 -->
    <div style="padding: 8px 12px 0; display: flex; gap: 6px; overflow-x: auto;">
      <div
        class="filter-chip-sm"
        :class="{ active: activeCategory === '' }"
        @click="activeCategory = ''; handleSearch()"
      >全部</div>
      <div
        v-for="cat in CATEGORY_OPTIONS" :key="cat.value"
        class="filter-chip-sm"
        :class="{ active: activeCategory === cat.value }"
        @click="activeCategory = cat.value; handleSearch()"
      >{{ cat.label }}</div>
    </div>

    <!-- 单位卡片列表 -->
    <div style="padding: 0 12px; margin-top: 8px;">
      <div v-if="filteredUnits.length === 0" style="text-align: center; color: #909399; padding: 40px 0;">
        <el-icon :size="48" color="#dcdfe6"><OfficeBuilding /></el-icon>
        <p style="margin-top: 12px;">暂无住宿单位</p>
      </div>

      <div v-for="unit in filteredUnits" :key="unit.id" class="m-card unit-card"
        @click="router.push(`/m/units/${unit.id}`)">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 15px; font-weight: 600; color: #1a1a1a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              {{ unit.name }}
            </div>
            <div style="font-size: 12px; color: #909399; margin-top: 4px;">
              {{ areaStore.getAreaName(unit.countyCode) }} · {{ unit.detailAddress }}
            </div>
          </div>
          <CategoryTag :value="unit.category" style="flex-shrink: 0; margin-left: 8px;" />
        </div>
        <div style="display: flex; gap: 16px; margin-top: 10px; font-size: 13px; color: #606266;">
          <span>{{ unit.rooms }}间房</span>
          <span>入住率{{ unit.occupancyRate }}%</span>
          <span>¥{{ unit.adr }}/晚</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAreaStore } from '@/stores/area'
import { useAuthStore } from '@/stores/auth'
import db from '@/db'
import { CATEGORY_OPTIONS } from '@/utils/constants'
import CategoryTag from '@/components/common/CategoryTag.vue'

const router = useRouter()
const areaStore = useAreaStore()
const authStore = useAuthStore()

const keyword = ref('')
const activeCategory = ref('')
const allUnits = ref([])

const filteredUnits = computed(() => {
  let list = allUnits.value
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(u => u.name.toLowerCase().includes(kw))
  }
  if (activeCategory.value) {
    list = list.filter(u => u.category === activeCategory.value)
  }
  return list.slice(0, 50) // 移动端限制数量
})

onMounted(async () => {
  await areaStore.fetchAreas()
  // 根据用户区域加载
  if (['county_admin', 'enumerator'].includes(authStore.userRole)) {
    allUnits.value = await db.accommodations.where('countyCode').equals(authStore.userAreaCode).toArray()
  } else if (authStore.userRole === 'city_admin') {
    allUnits.value = await db.accommodations.where('cityCode').equals(authStore.userAreaCode).toArray()
  } else {
    allUnits.value = await db.accommodations.toArray()
  }
})

function handleSearch() {
  // computed 自动处理
}
</script>

<style lang="scss" scoped>
.filter-chip-sm {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  color: #606266;
  background: #fff;
  border: 1px solid #e0e0e0;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;

  &.active {
    background: #1a5fc5;
    color: #fff;
    border-color: #1a5fc5;
  }
}

.unit-card {
  margin: 8px 0;
  padding: 14px;

  &:active {
    background: #fafbfc;
  }
}
</style>
