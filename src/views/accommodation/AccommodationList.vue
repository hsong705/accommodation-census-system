<template>
  <div class="page-container">
    <SearchFilterBar :fields="filterFields" v-model="store.filters" @search="handleSearch" @reset="handleReset" />

    <el-card shadow="never">
      <div class="page-header">
        <span class="page-title">住宿单位列表</span>
        <div>
          <el-button type="primary" @click="handleCreate" v-if="authStore.hasPermission('accommodation:create')">
            <el-icon><Plus /></el-icon>新增
          </el-button>
          <el-button @click="handleImport" v-if="authStore.hasPermission('accommodation:import')">
            <el-icon><Upload /></el-icon>导入
          </el-button>
          <el-button @click="handleExport" v-if="authStore.hasPermission('accommodation:export')">
            <el-icon><Download /></el-icon>导出
          </el-button>
        </div>
      </div>

      <DataTable :data="store.list" :loading="store.loading" :pagination="store.pagination" @page-change="handlePageChange">
        <el-table-column prop="name" label="单位名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="category" label="类别" width="110" align="center">
          <template #default="{ row }">
            <CategoryTag :value="row.category" />
          </template>
        </el-table-column>
        <el-table-column prop="countyCode" label="所在区县" width="100" align="center">
          <template #default="{ row }">{{ areaStore.getAreaName(row.countyCode) }}</template>
        </el-table-column>
        <el-table-column prop="rooms" label="客房数" width="80" align="center" sortable />
        <el-table-column prop="beds" label="床位数" width="80" align="center" />
        <el-table-column prop="occupancyRate" label="入住率" width="90" align="center">
          <template #default="{ row }">{{ row.occupancyRate }}%</template>
        </el-table-column>
        <el-table-column prop="adr" label="平均房价" width="100" align="center">
          <template #default="{ row }">¥{{ row.adr }}</template>
        </el-table-column>
        <el-table-column prop="operatingStatus" label="经营状态" width="100" align="center">
          <template #default="{ row }">
            <StatusTag :value="row.operatingStatus" :options="OPERATING_STATUS_OPTIONS" />
          </template>
        </el-table-column>
        <el-table-column prop="starRating" label="星级" width="80" align="center">
          <template #default="{ row }">{{ row.starRating ? row.starRating + '星' : '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)" v-if="authStore.hasPermission('accommodation:update')">编辑</el-button>
            <el-popconfirm title="确定删除该单位吗？" @confirm="handleDelete(row)" v-if="authStore.hasPermission('accommodation:delete')">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </DataTable>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { useAccommodationStore } from '@/stores/accommodation'
import { useAuthStore } from '@/stores/auth'
import { useAreaStore } from '@/stores/area'
import { ElMessage } from 'element-plus'
import { exportToExcel, ACCOMMODATION_EXPORT_COLUMNS } from '@/utils/excel'
import { CATEGORY_OPTIONS, OPERATING_STATUS_OPTIONS } from '@/utils/constants'
import SearchFilterBar from '@/components/common/SearchFilterBar.vue'
import DataTable from '@/components/common/DataTable.vue'
import CategoryTag from '@/components/common/CategoryTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'

const router = useRouter()
const store = useAccommodationStore()
const authStore = useAuthStore()
const areaStore = useAreaStore()

const filterFields = [
  { key: 'keyword', label: '关键词', type: 'input' },
  { key: 'category', label: '类别', type: 'select', options: CATEGORY_OPTIONS },
  { key: 'cityCode', label: '区域', type: 'cascader' },
  { key: 'operatingStatus', label: '经营状态', type: 'select', options: OPERATING_STATUS_OPTIONS },
]

onMounted(async () => {
  await areaStore.fetchAreas()
  await store.fetchList()
})

function handleSearch() {
  store.pagination.page = 1
  store.fetchList()
}

function handleReset() {
  store.resetFilters()
  store.fetchList()
}

function handlePageChange({ page, pageSize }) {
  store.pagination.page = page
  store.pagination.pageSize = pageSize
  store.fetchList()
}

function handleCreate() {
  router.push('/accommodation/create')
}

function handleView(row) {
  router.push(`/accommodation/${row.id}`)
}

function handleEdit(row) {
  router.push(`/accommodation/${row.id}/edit`)
}

async function handleDelete(row) {
  await store.remove(row.id)
  ElMessage.success('删除成功')
  store.fetchList()
}

function handleImport() {
  router.push('/accommodation-import')
}

async function handleExport() {
  const allData = await store.fetchList()
  exportToExcel(store.list, ACCOMMODATION_EXPORT_COLUMNS, '住宿单位数据')
  ElMessage.success('导出成功')
}
</script>
