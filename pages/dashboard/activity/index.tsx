import type { GetServerSidePropsContext } from 'next'

import { createClient } from '~/utils/supabase/server-props'

export async function getServerSideProps (context: GetServerSidePropsContext) {
  const supabase = createClient(context)

  const { data, error } = await supabase.auth.getUser()

  if (error || !data) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const [today] = new Date().toISOString().split('T')

  return {
    redirect: {
      destination: `/dashboard/activity/${ today }`,
      permanent: false,
    },
  }
}

export default function DashboardActivityIndexPage () {
  return null
}
