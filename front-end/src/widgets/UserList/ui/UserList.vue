<script setup lang="ts">
import * as _ from 'lodash-es'
import { useI18n } from 'vue-i18n'
import type { AxiosError } from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { ref, watch, onBeforeMount, onMounted } from 'vue'
import type { ColumnsType } from 'ant-design-vue/es/table/interface'

import { ax } from '@/shared/api/common'
import EosCard from '@/shared/ui/EosCard'
import EosTable from '@/shared/ui/EosTable'
import UserForm from '@/features/userForm/ui'
import EosButton from '@/shared/ui/EosButton'
import UserFilter from '@/features/userFilter/ui'
import EditIcon from '@/shared/icons/EditIcon.vue'
import ArchiveUser from '@/features/archiveUser/ui'
import { UserRoles } from '@/features/auth/model/roles'
import type { User, Role } from '@/entities/user/model/types'
import HasPermission from '@/features/auth/ui/HasPermission.vue'
import EosSort, { type EosSortOption } from '@/shared/ui/EosSort'
import { PermissionEnum } from '@/features/auth/model/permissions'

interface ResponseData {
  users: User[]
  role_list: Role[]
}

const { t } = useI18n({})
const route = useRoute()
const router = useRouter()

const columns: ColumnsType = [
  {
    title: t('firstnameAndLastname'),
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: t('learningGroup'),
    dataIndex: 'groups',
    key: 'group__name',
  },
  {
    title: t('userRole'),
    dataIndex: 'role',
    key: 'role__name',
  },
  {
    title: t('login'),
    dataIndex: 'login',
    key: 'login',
  },
  {
    title: t('email'),
    dataIndex: 'email',
    key: 'email',
  },
  {
    key: 'actions',
    width: 130,
  },
]

const page = ref<number>()
const total = ref<number>(0)
const userToEdit = ref<User>()
const sort = ref<string>('name')
const pageSize = ref<number>(100)
const dataSource = ref<User[]>([])
const loading = ref<boolean>(false)
const isUserFormOpen = ref<boolean>(false)
const sortOptions = ref<EosSortOption[]>([
  { label: t('firstnameAndLastname'), value: 'name' },
  { label: t('learningGroup'), value: 'group__name' },
  { label: t('userRole'), value: 'role__name' },
  { label: t('login'), value: 'login' },
  { label: t('email'), value: 'email' },
])

function handleError(e: AxiosError) {
  if (e.response) {
    router.push({ name: 'error', params: { status: e.response.status }})
  }
}

const getData = _.debounce(() => {
  if (route.name === 'users') {
    loading.value = true

    const minimalQuery = route.query.ordering !== undefined
      && route.query.offset !== undefined
      && route.query.limit !== undefined

    if (!minimalQuery) {
      setQuery([sort.value, 1])
    }
      
    minimalQuery && ax.get<ResponseData>(route.fullPath)
      .then(r => {
        loading.value = false
        dataSource.value = r.data.users
        total.value = +r.headers.count
      })
      .catch(handleError)
  }
}, 300)

function formatGroups(groups: User['groups']) {
  return groups?.map(g => g.name).join(', ')
}

function formatRole(role: User['role']) {
  return t(role?.name || '')
}

function readQuery() {
  const ordering = route.query.ordering as string
  const limit = route.query.limit
  const offset = route.query.offset

  if (ordering) {
    sort.value = ordering
  }

  if (limit && offset) {
    page.value = Math.floor(+offset / +limit) + 1
  }
}

function setQuery([ordering, page]: [string | undefined, number | undefined]) {
  const query = {
    ...route.query,
    ordering,
    limit: page ? pageSize.value : page,
    offset: page ? pageSize.value * (page - 1) : page,
  }
  router.push({ name: 'users', query })
}

function openUserForm() {
  isUserFormOpen.value = true
}

function editUser(user: User) {
  userToEdit.value = user
  openUserForm()
}

function goToFirstPage() {
  page.value = 1
}

watch(sort, goToFirstPage)
watch([sort, page], setQuery)
watch(route, getData)
watch(isUserFormOpen, open => {
  if (!open) {
    userToEdit.value = undefined
  }
})

onBeforeMount(() => {
  readQuery()
})

onMounted(() => {
  getData()
})
</script>

<template>
  <eos-card
    class="user-list"
    :title="t('userList')"
    :hideHeadBorder="true"
  >
    <user-form
      v-model:open="isUserFormOpen"
      :user="userToEdit"
      @submit="getData"
    />

    <template #extra>
      <div class="user-list__btns">
        <user-filter @filter="goToFirstPage" />

        <eos-sort
          v-model:sort="sort"
          :options="sortOptions"
        />

        <has-permission :permissions="[PermissionEnum.CAN_CREATE_USERS]">
          <eos-button
            type="primary"
            style="width: 122px;"
            @click="openUserForm"
          >
            {{ t('add') }}
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
      :columns="columns"
      :fullHeight="true"
      :dataSource="dataSource"
      :serverSidePagination="true"
      :scroll="{ y: 'calc(100vh - 227px)' }"
    >
      <template #bodyCell="{ column, record: user }">
        <div v-if="column.key === 'group__name'">
          {{ formatGroups(user.groups) }}
        </div>

        <div v-if="column.key === 'role__name'">
          {{ formatRole(user.role) }}
        </div>

        <div v-if="column.key === 'actions'" class="user-list__actions">
          <has-permission :permissions="[PermissionEnum.CAN_UPDATE_USERS]">
            <archive-user
              v-if="user.role.id !== UserRoles.Admin"
              :user="user"
              class="user-list__action"
              @archive="getData"
            />
          </has-permission>

          <has-permission :permissions="[PermissionEnum.CAN_UPDATE_USERS]">
            <eos-button
              type="secondary"
              class="user-list__action"
              @click="editUser(user)"
            >
              <edit-icon />
            </eos-button>
          </has-permission>
        </div>
      </template>
    </eos-table>
  </eos-card>
</template>

<style lang="scss">
.user-list {
  &__btns {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row-reverse;
  }

  &__action {
    width: 44px;
    opacity: 0;
    pointer-events: none;
  }

  .ant-table-cell-row-hover {
    .user-list__action {
      opacity: 1;
      pointer-events: all;
    }
  }
}
</style>
