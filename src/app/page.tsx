import Header from '@/components/layout/header'
import MainLayout from '@/components/layout/main-layout'
import Hero from '@/components/sections/hero'
import About from '@/components/sections/about'
import Skills from '@/components/sections/skills'
import Experience from '@/components/sections/experience'
import Contact from '@/components/sections/contact'

/**
 * The main portfolio landing page component.
 */
export default function Home() {
  return (
    <MainLayout>
      <Header />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Contact />
      </main>
    </MainLayout>
  )
}
