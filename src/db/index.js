import Dexie from 'dexie'

const db = new Dexie('AccommodationCensusDB')

db.version(1).stores({
  users: '++id, &username, role, areaCode, status',
  accommodations: '++id, &creditCode, category, cityCode, countyCode, operatingStatus, starRating',
  censusTasks: '++id, status, deadline',
  censusAssignments: '++id, taskId, areaCode, assignedTo, status',
  censusRecords: '++id, taskId, assignmentId, accommodationId, status, filledBy',
  areas: '&code, level, parentCode',
  operationLogs: '++id, userId, module, action, createdAt'
})

// v2: 添加 AI 聊天历史表
db.version(2).stores({
  users: '++id, &username, role, areaCode, status',
  accommodations: '++id, &creditCode, category, cityCode, countyCode, operatingStatus, starRating',
  censusTasks: '++id, status, deadline',
  censusAssignments: '++id, taskId, areaCode, assignedTo, status',
  censusRecords: '++id, taskId, assignmentId, accommodationId, status, filledBy',
  areas: '&code, level, parentCode',
  operationLogs: '++id, userId, module, action, createdAt',
  aiChatSessions: '++id, &sessionId, userId, createdAt',
  aiChatMessages: '++id, sessionId, role, createdAt',
})

export default db
