export const linkQueryKeys = {
  all: ['links'] as const,
  list: (page = 1, pageSize = 50) =>
    [...linkQueryKeys.all, 'list', page, pageSize] as const,
}
