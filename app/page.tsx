import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { SectionIndex } from "@/components/section-index"
import { Marquee } from "@/components/marquee"
import { Challenge } from "@/components/challenge"
import { Squad } from "@/components/squad"
import { Approach } from "@/components/approach"
import { Fixtures } from "@/components/fixtures"
import { Follow } from "@/components/follow"
import { Footer } from "@/components/footer"
import { disciplines } from "@/lib/content"

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SectionIndex />
        <Marquee items={disciplines} />
        <Challenge />
        <Squad />
        <Approach />
        <Fixtures />
        <Follow />
      </main>
      <Footer />
    </>
  )
}
