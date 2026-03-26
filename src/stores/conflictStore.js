import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import conflictsData from '../data/conflicts.json'
import countriesData from '../data/countries.json'

export const useConflictStore = defineStore('conflict', () => {
  const conflicts = ref(conflictsData.conflicts)
  const countries = ref(countriesData.countries)
  const selectedConflict = ref(null)
  const selectedDate = ref(new Date().toISOString().split('T')[0])

  const activeConflicts = computed(() => {
    return conflicts.value.filter(c => c.status === 'active')
  })

  const conflictCountries = computed(() => {
    const countryCodes = new Set()
    conflicts.value.forEach(conflict => {
      if (conflict.status === 'active') {
        conflict.countries.forEach(code => countryCodes.add(code))
      }
    })
    return Array.from(countryCodes)
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
    return conflicts.value.filter(conflict => {
      const startDate = new Date(conflict.startDate)
      const endDate = conflict.endDate ? new Date(conflict.endDate) : null
      if (startDate > targetDate) return false
      if (endDate && endDate < targetDate) return false
      return true
    })
  }

  return {
    conflicts,
    countries,
    selectedConflict,
    selectedDate,
    activeConflicts,
    conflictCountries,
    selectConflict,
    clearSelection,
    setSelectedDate,
    getConflictsByDate
  }
})
