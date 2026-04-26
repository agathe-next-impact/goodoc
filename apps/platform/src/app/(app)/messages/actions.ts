'use server'

import { contactMessages } from '@medsite/db'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getPractitionerSession } from '@/lib/get-tenant'
import { withTenant } from '@/lib/rls'

const ToggleInput = z.object({
  messageId: z.string().uuid(),
  nextStatus: z.enum(['new', 'read']),
})

export async function toggleMessageRead(formData: FormData) {
  const parsed = ToggleInput.safeParse({
    messageId: formData.get('messageId'),
    nextStatus: formData.get('nextStatus'),
  })
  if (!parsed.success) {
    throw new Error('Invalid input')
  }

  const { tenant } = await getPractitionerSession()

  await withTenant(tenant.id, async (tx) => {
    await tx
      .update(contactMessages)
      .set({ status: parsed.data.nextStatus })
      .where(
        and(
          eq(contactMessages.id, parsed.data.messageId),
          eq(contactMessages.tenantId, tenant.id),
        ),
      )
  })

  revalidatePath('/messages')
  revalidatePath('/')
}
