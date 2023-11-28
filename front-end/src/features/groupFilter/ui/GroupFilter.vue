<script setup lang="ts">
import * as _ from 'lodash-es'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import type { SelectProps } from 'ant-design-vue'
import { ref, watch, computed, onBeforeMount } from 'vue'

import EosModal from '@/shared/ui/EosModal'
import EosButton from '@/shared/ui/EosButton'
import EosSelect from '@/shared/ui/EosSelect'
import EosSlider from '@/shared/ui/EosSlider'
import EosFormItem from '@/shared/ui/EosFormItem'
import { useGlobalStore } from '@/stores/globalStore'
import FilterIcon from '@/shared/icons/FilterIcon.vue'
import type { User } from '@/entities/user/model/types'
import type { Speciality } from '@/entities/group/model/types'

import type { GroupFilter } from '../model/types'

interface GroupFilterEmits {
  (e: 'filter'): void
}

interface GroupFilterProps {
  min: number
  max: number
}

type Options = SelectProps['options']

const emit = defineEmits<GroupFilterEmits>()
const props = withDefaults(defineProps<GroupFilterProps>(), {
  min: 0,
  max: 0
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n({})
const globalStore = useGlobalStore()

const initialValues: GroupFilter = {
  speciality: [],
  teacher: [],
  studentCount: [0, 0],
}

const isOpen = ref<boolean>(false)
const filter = ref<GroupFilter>({ ...initialValues })
const filterState = ref<GroupFilter>({ ...initialValues })

const teacherList = computed<User[]>(() => globalStore.teacherList)
const specialityList = computed<Speciality[]>(() => globalStore.specialityList)
const isFilterApplied = computed<boolean>(() => !_.isEqual(filterState.value, initialValues))
const specialityOptions = computed<Options>(() => specialityList.value.map(s => ({ value: s, label: s })))
const teacherOptions = computed<Options>(() => teacherList.value.map(t => ({ value: t.id, label: t.name })))

watch(() => props.min, min => {
  initialValues.studentCount[0] = min
  filter.value.studentCount[0] = min
  filterState.value.studentCount[0] = min
})

watch(() => props.max, max => {
  initialValues.studentCount[1] = max
  filter.value.studentCount[1] = max
  filterState.value.studentCount[1] = max
})

function applyFilterState() {
  filter.value = { ...filterState.value }
}

function updateFilterState() {
  filterState.value = { ...filter.value }
}

function openModal() {
  applyFilterState()
  isOpen.value = true
}

function closeModal() {
  isOpen.value = false
}

function readQuery() {
  const { teacher, speciality, student_count: studentCount } = route.query
  teacher && (filter.value.teacher = JSON.parse(teacher as string))
  speciality && (filter.value.speciality = JSON.parse(speciality as string))
  studentCount && (filter.value.studentCount = JSON.parse(studentCount as string))
  updateFilterState()
}

function applyFilter() {
  updateFilterState()
  const query = { ...route.query }
  query.teacher = JSON.stringify(filter.value.teacher)
  query.speciality = JSON.stringify(filter.value.speciality)
  if (filter.value.studentCount[0] === 0 && filter.value.studentCount[1] === 0) {
    query.student_count = JSON.stringify([])
  } else {
    query.student_count = JSON.stringify(filter.value.studentCount)
  }
  router.push({ name: 'groups', query })
  emit('filter')
}

function clearAll() {
  filter.value = ({ ...initialValues })
  applyFilter()
  closeModal()
}

async function submit() {
  applyFilter()
  closeModal()
}

onBeforeMount(() => {
  readQuery()
})
</script>

<template>
  <eos-button :type="isFilterApplied ? 'primary' : 'secondary'" @click="openModal">
    <FilterIcon :active="isFilterApplied" />
  </eos-button>

  <eos-modal
    v-model:open="isOpen"
    width="578px"
    :title="t('filters')"
  >
    <a-form
      name="group-filter"
      :model="filter"
    >
      <eos-form-item
        name="speciality"
        :label="t('speciality')"
      >
        <eos-select
          v-model:value="filter.speciality"
          size="large"
          mode="multiple"
          style="width: 529px;"
          :options="specialityOptions"
          :allowClear="true"
        ></eos-select>
      </eos-form-item>

      <eos-form-item
        name="teacher"
        :label="t('teacher')"
      >
        <eos-select
          v-model:value="filter.teacher"
          size="large"
          mode="multiple"
          style="width: 529px;"
          optionFilterProp="label"
          :options="teacherOptions"
          :allowClear="true"
        ></eos-select>
      </eos-form-item>

      <eos-form-item
        name="users"
        :label="t('numberOfStudents')"
      >
        <eos-slider
          v-model:value="filter.studentCount"
          range
          :min="min"
          :max="max"
          style="width: 529px;"
        ></eos-slider>
      </eos-form-item>
    </a-form>

    <template #footer>
      <eos-button type="primary" size="large" @click="submit">{{ t('applyFilter') }}</eos-button>
      <eos-button size="large" @click="clearAll">{{ t('clearAll') }}</eos-button>
    </template>
  </eos-modal>
</template>
