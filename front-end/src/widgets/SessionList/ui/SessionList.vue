<script setup lang="ts">
import * as _ from 'lodash-es'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import type { AxiosError, AxiosResponse } from 'axios'
import { ref, watch, onBeforeMount, computed } from 'vue'
import type { ColumnsType } from 'ant-design-vue/es/table/interface'

import EosCard from '@/shared/ui/EosCard'
import EosInput from '@/shared/ui/EosInput'
import EosTable from '@/shared/ui/EosTable'
import EosButton from '@/shared/ui/EosButton'
import EosStatus from '@/shared/ui/EosStatus'
import { ax, dayjs } from '@/shared/api/common'
import EditIcon from '@/shared/icons/EditIcon.vue'
import SessionForm from '@/features/sessionForm/ui'
import SearchIcon from '@/shared/icons/SearchIcon.vue'
import { canUpdateSession } from '@/features/auth/lib'
import SessionFilter from '@/features/sessionFilter/ui'
import ArchiveSession from '@/features/archiveSession/ui'
import HasPermission from '@/features/auth/ui/HasPermission.vue'
import EosSort, { type EosSortOption } from '@/shared/ui/EosSort'
import { PermissionEnum } from '@/features/auth/model/permissions'
import type { SessionFilter as ISessionFilter } from '@/features/sessionFilter/model/types'
import { SessionStatusEnum, type Session, type SessionDisplayTypes } from '@/entities/session/model/types'

interface ResponseData {
  sessions: Session[]
}
interface SessionListProps {
  type?: SessionDisplayTypes,
  roomId?: number | undefined
}
const props = withDefaults(defineProps<SessionListProps>(), {
  type: 'page',
  roomId: undefined
})

const { t } = useI18n({})
const route = useRoute()
const router = useRouter()

const columns: ColumnsType = [
  {
    title: t('dateAndTime'),
    dataIndex: 'start',
    key: 'start',
    width: '13%',
  },
  {
    title: t('status'),
    dataIndex: 'status',
    key: 'status',
    width: '10%',
  },
  {
    title: t('sessionType'),
    dataIndex: 'type',
    key: 'type',
    width: '9%',
  },
  {
    title: t('nameOfTheLearningModule'),
    dataIndex: 'module',
    key: 'module',
    width: '25%',
  },
  {
    title: t('group'),
    dataIndex: 'groups',
    key: 'groups',
    width: '10%',
  },
  {
    title: t('teacher'),
    dataIndex: 'users',
    key: 'users',
    width: '12%',
  },
  {
    title: t('room'),
    dataIndex: 'rooms',
    key: 'rooms',
    width: '13%',
  },
  {
    key: 'actions',
    width: '8%',
  },
]

const columnsForWidget: ColumnsType = [
  {
    title: t('nameOfTheLearningModule'),
    dataIndex: 'module',
    key: 'module',
  },
  {
    title: t('dateAndTime'),
    dataIndex: 'start',
    key: 'start',
  },
  {
    title: t('status'),
    dataIndex: 'status',
    key: 'status',
    width: 155
  },
]

const page = ref<number>()
const total = ref<number>(0)
const pageSize = ref<number>(100)
const sort = ref<string>('-start')
const loading = ref<boolean>(false)
const sessions = ref<Session[]>([])
const filter = ref<ISessionFilter>()
const sessionToEdit = ref<Session>()
const searchByModule = ref<string>('')
const isSessionFormOpen = ref<boolean>(false)
const sortOptions = ref<EosSortOption[]>([
  { label: t('byDateAndTime'), value: 'start' },
  { label: t('byStatus'), value: 'status' },
  { label: t('byName'), value: 'module' },
  { label: t('bySessionType'), value: 'type' },
])

const getColumns = computed<ColumnsType>(() => props.type === 'page' ? columns : columnsForWidget)

function formatDateAndTime(start: string, end: string): string {
  const startDate = dayjs(start).format('DD.MM.YYYY')
  const startTime = dayjs(start).format('HH:mm')
  const endDate = dayjs(end).format('DD.MM.YYYY')
  const endTime = dayjs(end).format('HH:mm')

  if (startDate === endDate) {
    return `${startDate}, ${startTime}-${endTime}`
  } else {
    return `${startDate}, ${startTime} - ${endDate}, ${endTime}`
  }
}

function formatRooms(rooms: Session['rooms']) {
  return rooms.map(r => r.name).join(', ')
}

function formatGroups(groups: Session['groups']) {
  return groups.map(g => g.name).join(', ')
}

function formatTeachers(teachers: Session['users']) {
  return teachers.map(t => t.name).join(', ')
}

function formatType(type: Session['type']) {
  return t(type.name)
}

function onFilterChange(f: ISessionFilter) {
  filter.value = f
}

function handleError(e: AxiosError) {
  if (e.response) {
    router.push({ name: 'error', params: { status: e.response.status }})
  }
}

const getData = _.debounce(() => {
  const baseUrl = '/sessions'
  const handleRequest = (r: AxiosResponse<ResponseData>) => {
    sessions.value = r.data.sessions
    total.value = +r.headers.count
    loading.value = false
  }

  loading.value = true

  if (sort.value && page.value) {
    const limit = pageSize.value
    const offset = pageSize.value * (page.value - 1)
    const module = searchByModule.value
    const params = {
      ...filter.value,
      limit,
      offset,
      module: searchByModule.value
    }
    let url = `${baseUrl}/${sort.value}/?limit=${limit}&offset=${offset}`

    !filter.value && (url += `&module=${module}`)
    filter.value
      ? ax.post<ResponseData>(url, params).then(handleRequest).catch(handleError)
      : ax.get<ResponseData>(url).then(handleRequest).catch(handleError)
  }
}, 300)

function openSessionForm() {
  isSessionFormOpen.value = true
}

function editSession(session: Session) {
  sessionToEdit.value = session
  openSessionForm()
}

function setSort(sort: string) {
  props.type === 'page' && router.push(`/sessions/${sort}/`)
  getData()
}

watch(page, getData)
watch(filter, getData)
watch(searchByModule, getData)
watch(sort, v => v && setSort(v))
watch([sort, filter, searchByModule], () => page.value = 1)

watch(isSessionFormOpen, v => {
  if (!v) {
    sessionToEdit.value = undefined
  }
})

watch(route, route => {
  if (route.name === 'sessions' && !route.params.ordering) {
    setSort(sort.value)
  }
})

onBeforeMount(() => {
  if (props.type === 'widget') {
    sort.value = 'module'
    filter.value = {
      rooms: [<number>props.roomId]
    }
  } else {
    route.params.sort
      ? sort.value = route.params.sort as string
      : setSort(sort.value)
  }
})
</script>

<template>
  <eos-card
    class="session-list"
    :title="t('learnSessionList')"
    :hideHeadBorder="true"
  >
    <session-form
      v-model:open="isSessionFormOpen"
      :session="sessionToEdit"
      @submit="getData"
    />

    <template #extra>
      <div class="session-list__btns">
        <eos-input
          v-if="props.type === 'page'"
          v-model:value="searchByModule"
          allowClear
          :placeholder="t('search')"
          :style="{ width: 260 }"
        >
          <template #prefix>
            <search-icon />
          </template>
        </eos-input>

        <session-filter :type="props.type" :roomId="props.roomId" @change="onFilterChange" />

        <eos-sort
          v-if="props.type === 'page'"
          v-model:sort="sort"
          :options="sortOptions"
        />

        <has-permission :permissions="[PermissionEnum.CAN_CREATE_SESSIONS]">
          <eos-button
            v-if="props.type === 'page'"
            type="primary"
            style="minWidth: 112px;"
            @click="openSessionForm"
          >
            {{ t('create') }}
          </eos-button>
        </has-permission>
      </div>
    </template>

    <eos-table
      v-model:page="page"
      v-model:pageSize="pageSize"
      :sort="sort"
      :total="total"
      :loading="loading"
      :fullHeight="true"
      :columns="getColumns"
      :dataSource="sessions"
      :serverSidePagination="true"
      :scroll="{ y: props.type === 'page' ? 'calc(100vh - 227px)' : 'unset' }"
    >
      <template #bodyCell="{ column, record: session }">
        <div v-if="column.key === 'start'" class="session-list__cell">
          {{ formatDateAndTime(session.start, session.end)}}
        </div>

        <eos-status v-if="column.key === 'status'" :status="session.status" />

        <a
          v-if="column.key === 'module'"
          target="_blank"
          class="session-list__link"
          :href="`/session/${session.id}`"
        >
          {{ session.module }}
        </a>

        <div v-if="column.key === 'type'" class="session-list__cell">
          {{ formatType(session.type)}}
        </div>

        <div v-if="column.key === 'rooms'" class="session-list__cell">
          {{ formatRooms(session.rooms)}}
        </div>

        <div v-if="column.key === 'groups'" class="session-list__cell">
          {{ formatGroups(session.groups)}}
        </div>

        <div v-if="column.key === 'users'" class="session-list__cell">
          {{ formatTeachers(session.users)}}
        </div>

        <div v-if="column.key === 'actions'" class="session-list__actions">
          <archive-session
            v-if="session.status.id === SessionStatusEnum.Planned && canUpdateSession(session)"
            class="session-list__action"
            :session="session"
            @archive="getData"
          />

          <eos-button
            v-if="session.status.id === SessionStatusEnum.Planned && canUpdateSession(session)"
            type="secondary"
            class="session-list__action"
            @click="editSession(session)"
          >
            <edit-icon />
          </eos-button>
        </div>
      </template>
    </eos-table>
  </eos-card>
</template>

<style lang="scss">
.session-list {
  &__btns {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__cell,
  &__link {
    font-size: 15px;
    line-height: 24px;
  }

  &__link {
    color: inherit;

    &:hover {
      color: inherit;
      text-decoration: underline;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    flex-direction: row-reverse;

    .eos-btn {
      margin-left: 10px;

      &:last-child {
        margin-left: 0;
      }
    }
  }

  &__action {
    width: 44px;
    opacity: 0;
    pointer-events: none;
  }

  .ant-table-cell-row-hover {
    .session-list__link {
      color: var(--sc-base-7);
    }

    .session-list__action {
      opacity: 1;
      pointer-events: all;
    }
  }
}
</style>
