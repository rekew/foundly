import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import * as itemsService from '../../services/items.service'

export const itemKeys = {
  all: ['items'],
  list: (params) => ['items', 'list', params],
  mine: () => ['items', 'mine'],
  detail: (id) => ['items', 'detail', String(id)],
}

export function useItems(params) {
  return useQuery({
    queryKey: itemKeys.list(params),
    queryFn: ({ signal }) => itemsService.listItems({ ...params, signal }),
    placeholderData: keepPreviousData,
  })
}

export function useMyItems({ enabled = true } = {}) {
  return useQuery({
    queryKey: itemKeys.mine(),
    queryFn: ({ signal }) => itemsService.listMyItems({ signal }),
    enabled,
  })
}

export function useItem(id) {
  return useQuery({
    queryKey: itemKeys.detail(id),
    queryFn: ({ signal }) => itemsService.getItemById(id, { signal }),
    retry: (count, error) => error?.status !== 404 && count < 2,
  })
}

export function useCreateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => itemsService.createItem(payload),
    onSuccess: (item) => {
      queryClient.setQueryData(itemKeys.detail(item.id), item)
      queryClient.invalidateQueries({ queryKey: itemKeys.all })
    },
  })
}

export function useUpdateItem(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => itemsService.updateItem(id, payload),
    onSuccess: (item) => {
      queryClient.setQueryData(itemKeys.detail(item.id), item)
      queryClient.invalidateQueries({ queryKey: itemKeys.all })
    },
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => itemsService.deleteItem(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: itemKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: itemKeys.all })
    },
  })
}
