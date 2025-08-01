import { Segment } from '~/@types/types.db'
import { BubbleChart } from '~/components/organisms/charts/bubble-chart.component'

interface Props {
  report: Array<{
    day: string,
    segments: Array<Segment>
  }>
}

export const ActivityReport = ({ report }: Props) => {
  console.log('[DEBUG] REPORT', report)

  return (
    <>
      <h1>Activity Report</h1>
      <p>This is the activity report component.</p>

      <BubbleChart />
    </>
  )
}
