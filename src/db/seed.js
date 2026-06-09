import db from './index'

// ==================== 区域数据 ====================
const AREA_DATA = [
  // 云南省
  { code: '530000', name: '云南省', level: 1, parentCode: null, sortOrder: 0 },
  // 8个州市
  { code: '530100', name: '昆明市', level: 2, parentCode: '530000', sortOrder: 1 },
  { code: '530300', name: '曲靖市', level: 2, parentCode: '530000', sortOrder: 2 },
  { code: '530400', name: '玉溪市', level: 2, parentCode: '530000', sortOrder: 3 },
  { code: '530500', name: '保山市', level: 2, parentCode: '530000', sortOrder: 4 },
  { code: '530600', name: '昭通市', level: 2, parentCode: '530000', sortOrder: 5 },
  { code: '530700', name: '丽江市', level: 2, parentCode: '530000', sortOrder: 6 },
  { code: '530800', name: '普洱市', level: 2, parentCode: '530000', sortOrder: 7 },
  { code: '530900', name: '临沧市', level: 2, parentCode: '530000', sortOrder: 8 },
  // 昆明市下辖区
  { code: '530102', name: '五华区', level: 3, parentCode: '530100', sortOrder: 1 },
  { code: '530103', name: '盘龙区', level: 3, parentCode: '530100', sortOrder: 2 },
  { code: '530111', name: '官渡区', level: 3, parentCode: '530100', sortOrder: 3 },
  { code: '530112', name: '西山区', level: 3, parentCode: '530100', sortOrder: 4 },
  // 曲靖市下辖区
  { code: '530302', name: '麒麟区', level: 3, parentCode: '530300', sortOrder: 1 },
  { code: '530303', name: '沾益区', level: 3, parentCode: '530300', sortOrder: 2 },
  { code: '530326', name: '会泽县', level: 3, parentCode: '530300', sortOrder: 3 },
  // 玉溪市下辖区
  { code: '530402', name: '红塔区', level: 3, parentCode: '530400', sortOrder: 1 },
  { code: '530422', name: '澄江市', level: 3, parentCode: '530400', sortOrder: 2 },
  { code: '530423', name: '通海县', level: 3, parentCode: '530400', sortOrder: 3 },
  // 保山市下辖区
  { code: '530502', name: '隆阳区', level: 3, parentCode: '530500', sortOrder: 1 },
  { code: '530524', name: '昌宁县', level: 3, parentCode: '530500', sortOrder: 2 },
  // 昭通市下辖区
  { code: '530602', name: '昭阳区', level: 3, parentCode: '530600', sortOrder: 1 },
  { code: '530627', name: '镇雄县', level: 3, parentCode: '530600', sortOrder: 2 },
  // 丽江市下辖区
  { code: '530702', name: '古城区', level: 3, parentCode: '530700', sortOrder: 1 },
  { code: '530722', name: '永胜县', level: 3, parentCode: '530700', sortOrder: 2 },
  { code: '530723', name: '华坪县', level: 3, parentCode: '530700', sortOrder: 3 },
  // 普洱市下辖区
  { code: '530802', name: '思茅区', level: 3, parentCode: '530800', sortOrder: 1 },
  { code: '530822', name: '墨江县', level: 3, parentCode: '530800', sortOrder: 2 },
  // 临沧市下辖区
  { code: '530902', name: '临翔区', level: 3, parentCode: '530900', sortOrder: 1 },
  { code: '530921', name: '凤庆县', level: 3, parentCode: '530900', sortOrder: 2 },
]

// ==================== 辅助函数 ====================

// 确定性伪随机（基于种子）
function seededRandom(seed) {
  let s = seed
  return function () {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// SHA-256 哈希
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// 生成统一社会信用代码（18位模拟）
function generateCreditCode(rand) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let code = ''
  for (let i = 0; i < 18; i++) {
    code += chars[Math.floor(rand() * chars.length)]
  }
  return code
}

// ==================== 用户数据 ====================
async function generateUsers() {
  const passwordHash = await sha256('admin123')
  const now = new Date().toISOString()
  const users = [
    { id: 1, username: 'admin', password: passwordHash, realName: '超级管理员', phone: '13800000001', role: 'super_admin', areaCode: '530000', areaName: '云南省', status: 'active', createdBy: null, createdAt: now, updatedAt: now },
    { id: 2, username: 'prov_admin', password: passwordHash, realName: '张省管', phone: '13800000002', role: 'provincial_admin', areaCode: '530000', areaName: '云南省', status: 'active', createdBy: 1, createdAt: now, updatedAt: now },
    // 8个市级管理员
    { id: 3, username: 'km_admin', password: passwordHash, realName: '李昆明', phone: '13800000003', role: 'city_admin', areaCode: '530100', areaName: '昆明市', status: 'active', createdBy: 2, createdAt: now, updatedAt: now },
    { id: 4, username: 'qj_admin', password: passwordHash, realName: '王曲靖', phone: '13800000004', role: 'city_admin', areaCode: '530300', areaName: '曲靖市', status: 'active', createdBy: 2, createdAt: now, updatedAt: now },
    { id: 5, username: 'yx_admin', password: passwordHash, realName: '赵玉溪', phone: '13800000005', role: 'city_admin', areaCode: '530400', areaName: '玉溪市', status: 'active', createdBy: 2, createdAt: now, updatedAt: now },
    { id: 6, username: 'bs_admin', password: passwordHash, realName: '刘保山', phone: '13800000006', role: 'city_admin', areaCode: '530500', areaName: '保山市', status: 'active', createdBy: 2, createdAt: now, updatedAt: now },
    { id: 7, username: 'zt_admin', password: passwordHash, realName: '陈昭通', phone: '13800000007', role: 'city_admin', areaCode: '530600', areaName: '昭通市', status: 'active', createdBy: 2, createdAt: now, updatedAt: now },
    { id: 8, username: 'lj_admin', password: passwordHash, realName: '杨丽江', phone: '13800000008', role: 'city_admin', areaCode: '530700', areaName: '丽江市', status: 'active', createdBy: 2, createdAt: now, updatedAt: now },
    { id: 9, username: 'pe_admin', password: passwordHash, realName: '周普洱', phone: '13800000009', role: 'city_admin', areaCode: '530800', areaName: '普洱市', status: 'active', createdBy: 2, createdAt: now, updatedAt: now },
    { id: 10, username: 'lc_admin', password: passwordHash, realName: '吴临沧', phone: '13800000010', role: 'city_admin', areaCode: '530900', areaName: '临沧市', status: 'active', createdBy: 2, createdAt: now, updatedAt: now },
    // 县级管理员
    { id: 11, username: 'wh_admin', password: passwordHash, realName: '孙五华', phone: '13800000011', role: 'county_admin', areaCode: '530102', areaName: '五华区', status: 'active', createdBy: 3, createdAt: now, updatedAt: now },
    { id: 12, username: 'pl_admin', password: passwordHash, realName: '郑盘龙', phone: '13800000012', role: 'county_admin', areaCode: '530103', areaName: '盘龙区', status: 'active', createdBy: 3, createdAt: now, updatedAt: now },
    { id: 13, username: 'gc_admin', password: passwordHash, realName: '冯古城', phone: '13800000013', role: 'county_admin', areaCode: '530702', areaName: '古城区', status: 'active', createdBy: 8, createdAt: now, updatedAt: now },
    // 普查员
    { id: 14, username: 'enum01', password: passwordHash, realName: '普查员甲', phone: '13800000014', role: 'enumerator', areaCode: '530102', areaName: '五华区', status: 'active', createdBy: 11, createdAt: now, updatedAt: now },
    { id: 15, username: 'enum02', password: passwordHash, realName: '普查员乙', phone: '13800000015', role: 'enumerator', areaCode: '530103', areaName: '盘龙区', status: 'active', createdBy: 12, createdAt: now, updatedAt: now },
    { id: 16, username: 'enum03', password: passwordHash, realName: '普查员丙', phone: '13800000016', role: 'enumerator', areaCode: '530702', areaName: '古城区', status: 'active', createdBy: 13, createdAt: now, updatedAt: now },
    { id: 17, username: 'enum04', password: passwordHash, realName: '普查员丁', phone: '13800000017', role: 'enumerator', areaCode: '530111', areaName: '官渡区', status: 'active', createdBy: 3, createdAt: now, updatedAt: now },
    // 审核员
    { id: 18, username: 'rev01', password: passwordHash, realName: '审核员甲', phone: '13800000018', role: 'reviewer', areaCode: '530100', areaName: '昆明市', status: 'active', createdBy: 3, createdAt: now, updatedAt: now },
    { id: 19, username: 'rev02', password: passwordHash, realName: '审核员乙', phone: '13800000019', role: 'reviewer', areaCode: '530700', areaName: '丽江市', status: 'active', createdBy: 8, createdAt: now, updatedAt: now },
    { id: 20, username: 'rev03', password: passwordHash, realName: '审核员丙', phone: '13800000020', role: 'reviewer', areaCode: '530000', areaName: '云南省', status: 'active', createdBy: 2, createdAt: now, updatedAt: now },
  ]
  return users
}

// ==================== 住宿单位数据 ====================
function generateAccommodations() {
  const rand = seededRandom(42)
  const now = new Date().toISOString()

  // 名称素材
  const prefixes = ['金碧', '翠湖', '云上', '山水', '望海', '锦绣', '紫金', '碧水', '龙门', '凤凰',
    '春城', '滇池', '苍山', '洱海', '玉龙', '雪山', '茶马', '古道', '彩云', '明月',
    '天际', '云顶', '澜庭', '听风', '拾光', '沐云', '青石', '古城', '花间', '半山',
    '悦榕', '松赞', '花马', '白沙', '束河', '泸沽', '香格里', '梅里', '雨崩', '虎跳']
  const hotelSuffixes = { star_hotel: '大酒店', non_star_hotel: '酒店', minshuku: '民宿', kezhan: '客栈', other: '旅馆' }
  const categories = ['star_hotel', 'non_star_hotel', 'minshuku', 'kezhan', 'other']
  const categoryWeights = [0.20, 0.25, 0.30, 0.18, 0.07] // 分布权重

  // 各市住宿数量分布
  const cityDistribution = [
    { cityCode: '530100', counties: ['530102', '530103', '530111', '530112'], count: 80, lngBase: 102.73, latBase: 25.04 },
    { cityCode: '530300', counties: ['530302', '530303', '530326'], count: 22, lngBase: 103.80, latBase: 25.49 },
    { cityCode: '530400', counties: ['530402', '530422', '530423'], count: 20, lngBase: 102.54, latBase: 24.35 },
    { cityCode: '530500', counties: ['530502', '530524'], count: 15, lngBase: 99.17, latBase: 25.11 },
    { cityCode: '530600', counties: ['530602', '530627'], count: 15, lngBase: 103.72, latBase: 27.34 },
    { cityCode: '530700', counties: ['530702', '530722', '530723'], count: 28, lngBase: 100.23, latBase: 26.86 },
    { cityCode: '530800', counties: ['530802', '530822'], count: 12, lngBase: 100.97, latBase: 22.79 },
    { cityCode: '530900', counties: ['530902', '530921'], count: 10, lngBase: 100.09, latBase: 23.88 },
  ]

  const businessTypes = ['企业法人', '个体工商户', '个人经营']
  const operatingStatuses = ['operating', 'operating', 'operating', 'operating', 'operating', 'operating', 'operating', 'operating', 'closed', 'renovating']
  const licenseStatuses = ['licensed', 'licensed', 'licensed', 'licensed', 'pending', 'none']
  const guestSources = ['国内散客', '国内团队', '入境散客', '入境团队', '商务客', '线上预订']
  const brands = ['如家', '汉庭', '7天', '锦江之星', '全季', '亚朵', '希尔顿', '洲际', '万豪', '香格里拉', '悦榕庄', '松赞', '花间堂', '宛若故里', '']
  const certifications = ['绿色饭店', '金叶级绿色饭店', '银叶级绿色饭店', '星级旅游饭店', '文化主题酒店', '']
  const usedNames = new Set()

  const accommodations = []
  let id = 1

  for (const city of cityDistribution) {
    for (let i = 0; i < city.count; i++) {
      // 按权重选类别
      let catRand = rand()
      let catIndex = 0
      let cumWeight = 0
      for (let j = 0; j < categoryWeights.length; j++) {
        cumWeight += categoryWeights[j]
        if (catRand < cumWeight) { catIndex = j; break }
      }
      const category = categories[catIndex]

      // 生成名称（避免重复）
      let name
      let attempts = 0
      do {
        const prefix = prefixes[Math.floor(rand() * prefixes.length)]
        const suffix = hotelSuffixes[category]
        name = prefix + suffix
        attempts++
        if (attempts > 20) { name = prefix + suffix + Math.floor(rand() * 100); break }
      } while (usedNames.has(name))
      usedNames.add(name)

      // 选区县
      const countyCode = city.counties[Math.floor(rand() * city.counties.length)]

      // 星级酒店才有星级
      const starRating = category === 'star_hotel' ? Math.floor(rand() * 5) + 1 : null

      // 规模数据（不同类别差异大）
      let rooms, beds, floorArea
      if (category === 'star_hotel') {
        rooms = Math.floor(rand() * 350) + 80
        beds = Math.floor(rooms * (1.5 + rand() * 0.5))
        floorArea = Math.floor(rooms * (30 + rand() * 20))
      } else if (category === 'non_star_hotel') {
        rooms = Math.floor(rand() * 150) + 30
        beds = Math.floor(rooms * (1.3 + rand() * 0.4))
        floorArea = Math.floor(rooms * (20 + rand() * 15))
      } else if (category === 'minshuku') {
        rooms = Math.floor(rand() * 15) + 3
        beds = Math.floor(rooms * (1.2 + rand() * 0.6))
        floorArea = Math.floor(rooms * (25 + rand() * 20))
      } else if (category === 'kezhan') {
        rooms = Math.floor(rand() * 20) + 4
        beds = Math.floor(rooms * (1.3 + rand() * 0.5))
        floorArea = Math.floor(rooms * (18 + rand() * 12))
      } else {
        rooms = Math.floor(rand() * 40) + 8
        beds = Math.floor(rooms * (1.4 + rand() * 0.3))
        floorArea = Math.floor(rooms * (15 + rand() * 10))
      }

      // 经营数据
      const occupancyRate = Math.round((40 + rand() * 50) * 10) / 10
      let adrBase
      if (category === 'star_hotel') adrBase = 300 + rand() * 1200
      else if (category === 'non_star_hotel') adrBase = 120 + rand() * 380
      else if (category === 'minshuku') adrBase = 150 + rand() * 850
      else adrBase = 80 + rand() * 250
      const adr = Math.round(adrBase)
      const revpar = Math.round(adr * occupancyRate / 100)
      const annualRevenue = Math.round(rooms * 365 * (occupancyRate / 100) * adr)
      const staffCount = category === 'star_hotel' ? Math.floor(rooms * (0.8 + rand() * 0.6)) : Math.floor(rooms * (0.3 + rand() * 0.4))

      // 客源市场
      const selectedSources = []
      const sourceCount = Math.floor(rand() * 3) + 2
      for (let s = 0; s < sourceCount; s++) {
        const src = guestSources[Math.floor(rand() * guestSources.length)]
        if (!selectedSources.includes(src)) selectedSources.push(src)
      }

      // 配套设施
      const hasDining = category === 'star_hotel' ? rand() > 0.15 : rand() > 0.5
      const hasConference = category === 'star_hotel' ? rand() > 0.3 : rand() > 0.8
      const hasParking = rand() > 0.25
      const hasPool = category === 'star_hotel' ? rand() > 0.5 : rand() > 0.9
      const hasGym = category === 'star_hotel' ? rand() > 0.4 : rand() > 0.85
      const hasAccessibility = category === 'star_hotel' ? rand() > 0.3 : rand() > 0.7
      const fireSafetyCertified = rand() > 0.15

      // 合规
      const fireInspection = rand() > 0.2 ? 'passed' : (rand() > 0.5 ? 'pending' : 'failed')
      const healthPermit = rand() > 0.15 ? 'valid' : (rand() > 0.5 ? 'expired' : 'none')
      const safetyIncidents = rand() > 0.9 ? Math.floor(rand() * 3) + 1 : 0
      const hasEmergencyPlan = rand() > 0.2

      // 坐标（在市中心附近随机偏移）
      const longitude = Math.round((city.lngBase + (rand() - 0.5) * 0.8) * 10000) / 10000
      const latitude = Math.round((city.latBase + (rand() - 0.5) * 0.6) * 10000) / 10000

      // 品牌
      let brandAffiliation = ''
      if (category === 'star_hotel' || category === 'non_star_hotel') {
        if (rand() > 0.4) brandAffiliation = brands[Math.floor(rand() * brands.length)]
      }

      // 证书
      const certList = []
      if (rand() > 0.6) certList.push(certifications[Math.floor(rand() * (certifications.length - 1))])

      // 开业日期
      const year = 2005 + Math.floor(rand() * 20)
      const month = Math.floor(rand() * 12) + 1
      const day = Math.floor(rand() * 28) + 1
      const openDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

      accommodations.push({
        id,
        name,
        creditCode: generateCreditCode(rand),
        category,
        provinceCode: '530000',
        cityCode: city.cityCode,
        countyCode,
        detailAddress: name + '路' + Math.floor(rand() * 200 + 1) + '号',
        businessType: businessTypes[Math.floor(rand() * businessTypes.length)],
        licenseStatus: licenseStatuses[Math.floor(rand() * licenseStatuses.length)],
        openDate,
        operatingStatus: operatingStatuses[Math.floor(rand() * operatingStatuses.length)],
        rooms,
        beds,
        floorArea,
        hasDining,
        hasConference,
        hasParking,
        hasPool,
        hasGym,
        hasAccessibility,
        fireSafetyCertified,
        occupancyRate,
        adr,
        revpar,
        annualRevenue,
        staffCount,
        guestSourceMarkets: JSON.stringify(selectedSources),
        starRating,
        brandAffiliation,
        onlineRating: Math.round((3 + rand() * 2) * 10) / 10,
        complaintCount: Math.floor(rand() * 15),
        certifications: JSON.stringify(certList),
        specialPermits: JSON.stringify(fireInspection === 'passed' ? ['特种行业许可证', '消防安全检查合格证'] : ['特种行业许可证']),
        fireInspection,
        healthPermit,
        safetyIncidents,
        hasEmergencyPlan,
        longitude,
        latitude,
        createdBy: Math.floor(rand() * 10) + 1,
        updatedBy: null,
        createdAt: now,
        updatedAt: now,
      })
      id++
    }
  }

  return accommodations
}

// ==================== 普查任务数据 ====================
function generateCensusTasks() {
  const now = new Date()
  const formatDate = (d) => d.toISOString()
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }

  return [
    {
      id: 1,
      title: '2024年度住宿业普查',
      description: '对全省范围内所有住宿业单位进行全面普查，摸清底数，掌握行业发展现状。',
      deadline: formatDate(addDays(now, -30)),
      status: 'completed',
      requiredFields: JSON.stringify(['name', 'creditCode', 'category', 'rooms', 'beds', 'occupancyRate', 'adr', 'staffCount']),
      assignedAreaCodes: JSON.stringify(['530100', '530300', '530400', '530500', '530600', '530700', '530800', '530900']),
      createdBy: 2,
      createdAt: formatDate(addDays(now, -90)),
      updatedAt: formatDate(addDays(now, -25)),
    },
    {
      id: 2,
      title: '2025年第一季度民宿专项普查',
      description: '针对民宿、客栈类住宿业态进行专项普查，重点关注证照办理和安全合规情况。',
      deadline: formatDate(addDays(now, 15)),
      status: 'in_progress',
      requiredFields: JSON.stringify(['name', 'category', 'licenseStatus', 'fireInspection', 'healthPermit', 'rooms', 'hasEmergencyPlan']),
      assignedAreaCodes: JSON.stringify(['530100', '530700', '530400']),
      createdBy: 2,
      createdAt: formatDate(addDays(now, -20)),
      updatedAt: formatDate(addDays(now, -2)),
    },
    {
      id: 3,
      title: '丽江市住宿业复核检查',
      description: '对丽江市已登记住宿单位进行信息复核，更新经营状态和设施变更情况。',
      deadline: formatDate(addDays(now, 30)),
      status: 'published',
      requiredFields: JSON.stringify(['name', 'operatingStatus', 'rooms', 'beds', 'occupancyRate', 'fireInspection']),
      assignedAreaCodes: JSON.stringify(['530700']),
      createdBy: 8,
      createdAt: formatDate(addDays(now, -5)),
      updatedAt: formatDate(addDays(now, -3)),
    },
    {
      id: 4,
      title: '2025年度全省住宿业普查',
      description: '年度全面普查，覆盖全省所有住宿单位，重点更新经营数据与合规信息。',
      deadline: formatDate(addDays(now, 60)),
      status: 'draft',
      requiredFields: JSON.stringify(['name', 'creditCode', 'category', 'rooms', 'beds', 'occupancyRate', 'adr', 'revpar', 'annualRevenue', 'staffCount', 'fireInspection', 'healthPermit']),
      assignedAreaCodes: JSON.stringify(['530100', '530300', '530400', '530500', '530600', '530700', '530800', '530900']),
      createdBy: 2,
      createdAt: formatDate(addDays(now, -1)),
      updatedAt: formatDate(addDays(now, -1)),
    },
    {
      id: 5,
      title: '昆明市星级酒店品质调查',
      description: '调查昆明市星级酒店服务品质、品牌建设及在线评价情况。',
      deadline: formatDate(addDays(now, 45)),
      status: 'draft',
      requiredFields: JSON.stringify(['name', 'starRating', 'brandAffiliation', 'onlineRating', 'complaintCount', 'certifications']),
      assignedAreaCodes: JSON.stringify(['530100']),
      createdBy: 3,
      createdAt: formatDate(now),
      updatedAt: formatDate(now),
    },
  ]
}

// ==================== 普查分配数据 ====================
function generateAssignments(tasks) {
  const now = new Date()
  const formatDate = (d) => d.toISOString()
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
  const assignments = []
  let id = 1

  for (const task of tasks) {
    const areaCodes = JSON.parse(task.assignedAreaCodes)
    for (const areaCode of areaCodes) {
      let assignedTo, assignedToName, status, progress, submittedAt, reviewedBy, reviewedAt, reviewComment

      if (task.status === 'completed') {
        status = 'reviewed'
        progress = 100
        submittedAt = formatDate(addDays(now, -28))
        reviewedBy = 18
        reviewedAt = formatDate(addDays(now, -25))
        reviewComment = '数据完整，审核通过'
        assignedTo = 14
        assignedToName = '普查员甲'
      } else if (task.status === 'in_progress') {
        const r = Math.random()
        if (r > 0.5) {
          status = 'submitted'
          progress = 100
          submittedAt = formatDate(addDays(now, -1))
          assignedTo = 14
          assignedToName = '普查员甲'
        } else {
          status = 'in_progress'
          progress = Math.floor(Math.random() * 70) + 20
          assignedTo = 15
          assignedToName = '普查员乙'
        }
      } else {
        status = 'pending'
        progress = 0
        assignedTo = 14
        assignedToName = '普查员甲'
      }

      assignments.push({
        id,
        taskId: task.id,
        areaCode,
        areaName: AREA_DATA.find(a => a.code === areaCode)?.name || areaCode,
        assignedTo,
        assignedToName,
        status,
        progress,
        submittedAt: submittedAt || null,
        reviewedBy: reviewedBy || null,
        reviewedAt: reviewedAt || null,
        reviewComment: reviewComment || null,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })
      id++
    }
  }

  return assignments
}

// ==================== 主函数 ====================
export async function seedDatabase(db) {
  const areaCount = await db.areas.count()
  if (areaCount > 0) return // 已初始化

  console.log('[Seed] 开始初始化演示数据...')

  const users = await generateUsers()
  const accommodations = generateAccommodations()
  const tasks = generateCensusTasks()
  const assignments = generateAssignments(tasks)

  await db.transaction('rw', db.areas, db.users, db.accommodations, db.censusTasks, db.censusAssignments, db.censusRecords, async () => {
    await db.areas.bulkAdd(AREA_DATA)
    await db.users.bulkAdd(users)
    await db.accommodations.bulkAdd(accommodations)
    await db.censusTasks.bulkAdd(tasks)
    await db.censusAssignments.bulkAdd(assignments)
    // 普查记录暂不生成，由用户填报时创建
  })

  console.log(`[Seed] 初始化完成：${AREA_DATA.length}个区域, ${users.length}个用户, ${accommodations.length}个住宿单位, ${tasks.length}个普查任务, ${assignments.length}个分配记录`)
}
