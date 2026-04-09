import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import { Button } from '@/components/common/button'
import { Input } from '@/components/common/input'
import { Label } from '@/components/common/label'
import { linkQueryKeys } from '@/lib/query-keys'
import {
  createLinkSchema,
  type CreateLinkFormValues,
} from '@/schemas/create-link.schema'
import { getApiErrorMessage, isAxiosApiError } from '@/services/api'
import { createLink } from '@/services/links-service'

export function CreateLinkForm() {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<CreateLinkFormValues>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      originalUrl: '',
      shortUrl: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (values: CreateLinkFormValues) =>
      createLink({
        original_url: values.originalUrl,
        short_url: values.shortUrl,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: linkQueryKeys.all })
      reset()
      toast.success('Link criado com sucesso')
    },
    onError: (err) => {
      if (isAxiosApiError(err) && err.response?.status === 409) {
        const msg =
          typeof err.response.data?.message === 'string'
            ? err.response.data.message
            : 'Este link encurtado já existe'
        setError('shortUrl', { type: 'server', message: msg })
        return
      }
      toast.error(getApiErrorMessage(err, 'Não foi possível criar o link'))
    },
  })

  return (
    <section
      className="flex h-fit flex-col rounded-lg bg-surface-elevated p-6 lg:p-8"
      aria-labelledby="create-link-heading"
    >
      <h2
        id="create-link-heading"
        className="mb-6 font-sans text-lg font-bold text-foreground-secondary"
      >
        Novo link
      </h2>

      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        noValidate
      >
        <div>
          <Label htmlFor="originalUrl" className="text-xs font-normal uppercase tracking-wide text-muted">
            Link original
          </Label>
          <Input
            id="originalUrl"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://exemplo.com"
            errorMessage={errors.originalUrl?.message}
            {...register('originalUrl')}
          />
        </div >

        <div>
          <Label htmlFor="shortUrl" className="text-xs font-normal uppercase tracking-wide text-muted">
            Link encurtado
          </Label>
          <Input
            id="shortUrl"
            autoComplete="off"
            spellCheck={false}
            placeholder="brev.ly/"
            errorMessage={errors.shortUrl?.message}
            {...register('shortUrl')}
          />
        </div>

        <Button
          type="submit"
          className="mt-2 w-full py-4"
          loading={mutation.isPending}
        >
          Salvar link
        </Button>
      </form >
    </section >
  )
}
