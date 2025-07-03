import type { NextApiRequest, NextApiResponse } from 'next'

import createClient from '~/utils/supabase/api'

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient(req, res)

  // Sign out and clear the cookie
  await supabase.auth.signOut()

  // Redirect the user to login page
  res.writeHead(302, { Location: '/login' })
  res.end()
}
