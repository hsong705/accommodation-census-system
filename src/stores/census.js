import { defineStore } from 'pinia'
import { ref } from 'vue'
import db from '@/db'
import { useAuthStore } from './auth'

export const useCensusStore = defineStore('census', () => {
  const tasks = ref([])
  const currentTask = ref(null)
  const assignments = ref([])
  const records = ref([])
  const taskLoading = ref(false)
  const assignmentLoading = ref(false)

  async function fetchTasks(filters = {}) {
    taskLoading.value = true
    try {
      let collection = db.censusTasks.toCollection()
      const allTasks = await collection.toArray()

      // 权限过滤
      const auth = useAuthStore()
      const filtered = allTasks.filter(task => {
        if (['super_admin', 'provincial_admin'].includes(auth.userRole)) return true
        const areaCodes = JSON.parse(task.assignedAreaCodes || '[]')
        if (auth.userRole === 'city_admin') return areaCodes.some(c => c === auth.userAreaCode)
        if (auth.userRole === 'county_admin') return areaCodes.some(c => c.startsWith(auth.userAreaCode.substring(0, 4)))
        if (['enumerator', 'reviewer'].includes(auth.userRole)) return true
        return false
      })

      // 状态过滤
      const finalList = filters.status
        ? filtered.filter(t => t.status === filters.status)
        : filtered

      tasks.value = finalList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } finally {
      taskLoading.value = false
    }
  }

  async function fetchTaskDetail(id) {
    taskLoading.value = true
    try {
      currentTask.value = await db.censusTasks.get(Number(id))
      if (currentTask.value) {
        assignments.value = await db.censusAssignments.where('taskId').equals(Number(id)).toArray()
      } else {
        assignments.value = []
      }
      return assignments.value
    } finally {
      taskLoading.value = false
    }
  }

  async function createTask(data) {
    const auth = useAuthStore()
    const now = new Date().toISOString()
    const id = await db.censusTasks.add({
      ...data,
      status: 'draft',
      createdBy: auth.currentUser?.id,
      createdAt: now,
      updatedAt: now,
    })
    return id
  }

  async function updateTask(id, data) {
    const now = new Date().toISOString()
    await db.censusTasks.update(Number(id), { ...data, updatedAt: now })
  }

  async function publishTask(id) {
    const task = await db.censusTasks.get(Number(id))
    if (!task) return

    const now = new Date().toISOString()
    await db.censusTasks.update(Number(id), { status: 'published', updatedAt: now })

    // 为每个分配区域创建分配记录
    const areaCodes = JSON.parse(task.assignedAreaCodes || '[]')
    for (const areaCode of areaCodes) {
      const existing = await db.censusAssignments.where({ taskId: Number(id), areaCode }).first()
      if (!existing) {
        await db.censusAssignments.add({
          taskId: Number(id),
          areaCode,
          areaName: '', // 由前端补充
          assignedTo: null,
          assignedToName: '',
          status: 'pending',
          progress: 0,
          submittedAt: null,
          reviewedBy: null,
          reviewedAt: null,
          reviewComment: null,
          createdAt: now,
          updatedAt: now,
        })
      }
    }
  }

  async function startTask(id) {
    await db.censusTasks.update(Number(id), { status: 'in_progress', updatedAt: new Date().toISOString() })
  }

  async function completeTask(id) {
    await db.censusTasks.update(Number(id), { status: 'completed', updatedAt: new Date().toISOString() })
  }

  async function updateAssignment(id, data) {
    await db.censusAssignments.update(Number(id), { ...data, updatedAt: new Date().toISOString() })
  }

  async function submitAssignment(id) {
    await db.censusAssignments.update(Number(id), {
      status: 'submitted',
      progress: 100,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  async function reviewAssignment(id, status, comment) {
    const auth = useAuthStore()
    await db.censusAssignments.update(Number(id), {
      status,
      reviewComment: comment,
      reviewedBy: auth.currentUser?.id,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  async function fetchRecords(assignmentId) {
    assignmentLoading.value = true
    try {
      records.value = await db.censusRecords.where('assignmentId').equals(Number(assignmentId)).toArray()
    } finally {
      assignmentLoading.value = false
    }
  }

  async function saveRecord(data) {
    const auth = useAuthStore()
    const now = new Date().toISOString()

    if (data.id) {
      await db.censusRecords.update(Number(data.id), { ...data, updatedAt: now })
      return data.id
    } else {
      return await db.censusRecords.add({
        ...data,
        filledBy: auth.currentUser?.id,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      })
    }
  }

  async function submitRecord(id) {
    await db.censusRecords.update(Number(id), {
      status: 'submitted',
      updatedAt: new Date().toISOString(),
    })
  }

  function calculateProgress(taskAssignments) {
    if (!taskAssignments || taskAssignments.length === 0) return 0
    const total = taskAssignments.length
    const completed = taskAssignments.filter(a => ['submitted', 'reviewed'].includes(a.status)).length
    return Math.round(completed / total * 100)
  }

  async function fetchAssignmentsByTaskIds(taskIds) {
    if (!taskIds?.length) return []
    const result = []
    for (const tid of taskIds) {
      const list = await db.censusAssignments.where('taskId').equals(Number(tid)).toArray()
      result.push(...list)
    }
    return result
  }

  /** 加载当前用户被分配的全部 assignments（移动端首页/任务列表用） */
  async function fetchMyAssignments() {
    const auth = useAuthStore()
    const uid = auth.currentUser?.id
    if (!uid) {
      assignments.value = []
      return []
    }
    if (['super_admin', 'provincial_admin'].includes(auth.userRole)) {
      assignments.value = await db.censusAssignments.toArray()
    } else if (['enumerator'].includes(auth.userRole)) {
      assignments.value = await db.censusAssignments.where('assignedTo').equals(uid).toArray()
    } else {
      // 县级/市级/审核员：本辖区
      const all = await db.censusAssignments.toArray()
      assignments.value = all.filter(a => {
        if (auth.userRole === 'county_admin') return a.areaCode === auth.userAreaCode
        if (auth.userRole === 'city_admin') return a.areaCode.startsWith(auth.userAreaCode.substring(0, 4))
        if (auth.userRole === 'reviewer') {
          if (auth.userAreaCode === '530000') return true
          return a.areaCode.startsWith(auth.userAreaCode.substring(0, 4))
        }
        return false
      })
    }
    return assignments.value
  }

  return {
    tasks, currentTask, assignments, records, taskLoading, assignmentLoading,
    fetchTasks, fetchTaskDetail, fetchAssignmentsByTaskIds, fetchMyAssignments,
    createTask, updateTask, publishTask, startTask, completeTask,
    updateAssignment, submitAssignment, reviewAssignment,
    fetchRecords, saveRecord, submitRecord, calculateProgress,
  }
})
