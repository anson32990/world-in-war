import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import conflictsData from '../data/conflicts.json'

export const useConflictStore = defineStore('conflict', () => {
  const conflicts = ref(conflictsData.conflicts)
  const selectedConflict = ref(null)
  const selectedDate = ref(new Date().toISOString().split('T')[0])

  const activeConflicts = computed(() => {
    return conflicts.value.filter(c => c.status === 'active')
  })

  function selectConflict(conflict) {
    selectedConflict.value = conflict
  }

  function clearSelection() {
    selectedConflict.value = null
  }

  function setSelectedDate(date) {
    selectedDate.value = date
  }

  function getConflictsByDate(date) {
    const targetDate = new Date(date)
    const targetYear = targetDate.getFullYear()
    const targetMonth = targetDate.getMonth()
    
    return conflicts.value.filter(conflict => {
      const startDate = new Date(conflict.startDate)
      const endDate = conflict.endDate ? new Date(conflict.endDate) : null
      
      const startYear = startDate.getFullYear()
      const startMonth = startDate.getMonth()
      
      // 检查是否在开始日期之前
      if (targetYear < startYear || (targetYear === startYear && targetMonth < startMonth)) {
        return false
      }
      
      // 检查是否在结束日期之后
      if (endDate) {
        const endYear = endDate.getFullYear()
        const endMonth = endDate.getMonth()
        if (targetYear > endYear || (targetYear === endYear && targetMonth > endMonth)) {
          return false
        }
      }
      
      return true
    })
  }

  return {
    conflicts,
    selectedConflict,
    selectedDate,
    activeConflicts,
    selectConflict,
    clearSelection,
    setSelectedDate,
    getConflictsByDate
  }
})
