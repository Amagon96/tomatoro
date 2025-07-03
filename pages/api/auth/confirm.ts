import { type EmailOtpType } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'

import createClient from '~/utils/supabase/api'

function stringOrFirstString (item: string | string[] | undefined) {
  return Array.isArray(item) ? item[0] : item
}

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).appendHeader('Allow', 'GET').end()
    return
  }

  const queryParams = req.query
  const tokenHash = stringOrFirstString(queryParams.token_hash)
  const type = stringOrFirstString(queryParams.type)

  let next = '/error'

  if (tokenHash && type) {
    const supabase = createClient(req, res)
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    })
    if (error) {
      console.error(error)
    } else {
      next = stringOrFirstString(queryParams.next) || '/'
    }
  }

  res.redirect(next)
}
