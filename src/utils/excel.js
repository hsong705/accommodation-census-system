import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { CATEGORY_MAP, OPERATING_STATUS_MAP, LICENSE_STATUS_MAP, FIRE_INSPECTION_MAP, HEALTH_PERMIT_MAP } from './constants'

/**
 * 导出数据为 Excel 文件
 * @param {Array<Object>} data - 数据数组
 * @param {Array<Object>} columns - 列定义 [{ key, title, formatter? }]
 * @param {string} filename - 文件名（不含扩展名）
 */
export function exportToExcel(data, columns, filename = '导出数据') {
  const headers = columns.map(c => c.title)
  const rows = data.map(row =>
    columns.map(col => {
      let val = row[col.key]
      if (col.formatter) val = col.formatter(val, row)
      return val ?? ''
    })
  )

  const wsData = [headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // 设置列宽
  ws['!cols'] = columns.map(c => ({ wch: c.width || 15 }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  saveAs(blob, `${filename}.xlsx`)
}

/**
 * 从 Excel 文件导入数据
 * @param {File} file - 上传的 Excel 文件
 * @param {Object} columnMapping - Excel列名到字段key的映射 { 'Excel列名': 'fieldKey' }
 * @returns {Promise<Array<Object>>} 解析后的数据数组
 */
export function importFromExcel(file, columnMapping) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet)

        // 映射列名
        const mapped = jsonData.map(row => {
          const item = {}
          for (const [excelCol, fieldKey] of Object.entries(columnMapping)) {
            if (row[excelCol] !== undefined) {
              item[fieldKey] = row[excelCol]
            }
          }
          return item
        })

        resolve(mapped)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 住宿单位导出列定义
 */
export const ACCOMMODATION_EXPORT_COLUMNS = [
  { key: 'name', title: '单位名称', width: 20 },
  { key: 'creditCode', title: '统一社会信用代码', width: 22 },
  { key: 'category', title: '类别', width: 12, formatter: (v) => CATEGORY_MAP[v] || v },
  { key: 'provinceCode', title: '省', width: 10 },
  { key: 'cityCode', title: '市', width: 10 },
  { key: 'countyCode', title: '区县', width: 10 },
  { key: 'detailAddress', title: '详细地址', width: 25 },
  { key: 'businessType', title: '经营主体类型', width: 14 },
  { key: 'licenseStatus', title: '证照状态', width: 10, formatter: (v) => LICENSE_STATUS_MAP[v] || v },
  { key: 'openDate', title: '开业日期', width: 12 },
  { key: 'operatingStatus', title: '经营状态', width: 10, formatter: (v) => OPERATING_STATUS_MAP[v] || v },
  { key: 'rooms', title: '客房数', width: 8 },
  { key: 'beds', title: '床位数', width: 8 },
  { key: 'floorArea', title: '建筑面积(㎡)', width: 12 },
  { key: 'hasDining', title: '餐饮', width: 6, formatter: (v) => v ? '是' : '否' },
  { key: 'hasParking', title: '停车', width: 6, formatter: (v) => v ? '是' : '否' },
  { key: 'occupancyRate', title: '入住率(%)', width: 10 },
  { key: 'adr', title: '平均房价(元)', width: 12 },
  { key: 'revpar', title: 'RevPAR(元)', width: 12 },
  { key: 'annualRevenue', title: '年营收(元)', width: 12 },
  { key: 'staffCount', title: '从业人数', width: 10 },
  { key: 'starRating', title: '星级', width: 8 },
  { key: 'brandAffiliation', title: '品牌', width: 12 },
  { key: 'onlineRating', title: '在线评分', width: 10 },
  { key: 'fireInspection', title: '消防验收', width: 10, formatter: (v) => FIRE_INSPECTION_MAP[v] || v },
  { key: 'healthPermit', title: '卫生许可', width: 10, formatter: (v) => HEALTH_PERMIT_MAP[v] || v },
  { key: 'safetyIncidents', title: '安全事故数', width: 10 },
  { key: 'hasEmergencyPlan', title: '应急预案', width: 8, formatter: (v) => v ? '是' : '否' },
]

/**
 * 下载导入模板
 */
export function downloadImportTemplate() {
  const headers = ['单位名称', '统一社会信用代码', '类别(星级酒店/非星级酒店/民宿/客栈/其他)', '省代码', '市代码', '区县代码', '详细地址', '经营主体类型', '证照状态(已办证/办理中/未办证)', '开业日期', '经营状态(正常营业/停业/装修中/暂停营业)', '客房数', '床位数', '建筑面积(㎡)', '是否有餐饮(是/否)', '是否有会议室(是/否)', '是否有停车场(是/否)', '是否有游泳池(是/否)', '是否有健身房(是/否)', '入住率(%)', '平均房价(元)', '从业人数']
  const ws = XLSX.utils.aoa_to_sheet([headers])
  ws['!cols'] = headers.map(() => ({ wch: 18 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '住宿单位导入模板')
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '住宿单位导入模板.xlsx')
}
