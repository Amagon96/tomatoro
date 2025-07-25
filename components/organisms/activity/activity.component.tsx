import { format, parseISO } from 'date-fns'
import useTranslation from 'next-translate/useTranslation'
import { Box, Flex, Grid, Text, Heading } from 'theme-ui'

import { Tomato } from '~/components/atoms/tomato'
import { SegmentType } from '~/utils/config'
import { WeeklyReport } from '~/utils/supabase/queries/segments.query'

type Props = {
  report: WeeklyReport
}

export function ActivityPage ({ report }: Props) {
  const { t } = useTranslation('activity')
  // Parse and sort report data by day
  const sorted = [...report].sort((a, b) => a.day.localeCompare(b.day))
  const monthlyCounts: Record<SegmentType, number> = {
    WORK: 0,
    SHORT: 0,
    LONG: 0,
  }

  return (
    <Box sx={ { maxWidth: 900, mx: 'auto', px: 3, pb: 4 } }>
      <Box sx={ { mb: 4, textAlign: 'center' } }>
        <Heading as="h1" sx={ { fontSize: 4, mb: 1 } }>{ t('title') }</Heading>
        <Text sx={ { mb: 4 } }>{ t('subtitle') }</Text>
      </Box>

      <Box
        sx={ {
          border: '1px solid',
          borderColor: 'muted',
          borderRadius: 4,
          p: 3,
        } }
      >
        { report.length > 0 && (
          <Heading as="h2" sx={ { fontSize: 3, mb: 3 } }>
            { format(parseISO(report[0].day), 'LLLL, yyyy') }
          </Heading>
        ) }

        <Grid columns={ [5, 7] } gap={ 3 } sx={ { mb: 4 } }>
          { sorted.map(({ day, segments }) => {
            const counts: Record<SegmentType, number> = {
              WORK: 0,
              SHORT: 0,
              LONG: 0,
            }
            let totalCycles = 0

            segments.forEach(s => {
              monthlyCounts[s.type] += 1
              counts[s.type] += 1
              totalCycles += 1
            })

            return (
              <Grid
                key={ day }
                columns={ [1, 3] }
                sx={ {
                  border: '1px solid',
                  borderColor: parseISO(day) < new Date() ? 'text' : 'muted',
                  borderRadius: 4,
                  textAlign: 'center',
                  p: 3,
                } }
              >
                <Box sx={ { gridColumnStart: 1, gridColumnEnd: 4 } }>
                  <Text sx={ { fontWeight: 'bold', fontSize: 2 } }>
                    { format(parseISO(day), 'dd') }
                  </Text>
                </Box>
                {
                  (['WORK', 'SHORT', 'LONG'] as SegmentType[]).map((segmentType: SegmentType) => {
                    const count = counts[segmentType] || 0
                    const countDisplay = String(count).padStart(2, '0')

                    return (
                      <Flex key={ segmentType } sx={ { flexDirection: 'column', gap: 2, alignItems: 'center' } }>
                        <Tomato height={ 14 } type={ segmentType }/>
                        {
                          count > 0 ? (
                            <Text sx={ { fontWeight: 'bold' } }>
                              { countDisplay }
                            </Text>
                          ) : (
                            <Text variant="muted">00</Text>
                          )
                        }
                      </Flex>
                    )
                  })
                }
              </Grid>
            )
          }) }
        </Grid>

        <Flex sx={ { mb: 3, gap: 4, justifyContent: 'center' } }>
          {
            (['WORK', 'SHORT', 'LONG'] as SegmentType[]).map((segmentType: SegmentType) => (
              <Text key={ segmentType } variant="paragraph">
                { t(`segment.${ segmentType.toLowerCase() }`, { count: monthlyCounts[segmentType] }) }
                { ' ' }<Tomato height={ 16 } type={ segmentType }/>
              </Text>
            ))
          }
        </Flex>
      </Box>
    </Box>
  )
}
