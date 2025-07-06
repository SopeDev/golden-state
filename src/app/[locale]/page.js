import { useTranslations } from 'next-intl'

export default function Home() {
  const t = useTranslations('Home')

  return (
    <div id="home" className="block">
      <h1>{ t('title') }</h1>
    </div>
  )
}
