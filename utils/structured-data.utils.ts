export function createFaqStructuredData (faqs: Question[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ blocks, question }) => {
      const theFirstTextBlock = blocks.find((block) => block.__component === 'shared.rich-text')

      return {
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: theFirstTextBlock?.body,
        },
      }
    }),
  }
}
