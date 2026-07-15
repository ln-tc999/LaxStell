import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import FluidVolume from './FluidVolume'
import ScrambleCycle from './ScrambleCycle'
import { StoryShielded } from './StoryShielded'
import markUrl from '../assets/lax-stell-mark.png'

const ROTATING = ['shielded', 'unlinkable', 'verified', 'private', 'yours']

const GRID_V = 'rgba(239,233,220,0.06)'
const GRID_H = 'rgba(239,233,220,0.09)'

/** A faint trading-chart grid behind the hero — evenly spaced vertical (time)
 *  and horizontal (price) hairlines, the horizontals a touch stronger like price
 *  levels — the same atmosphere the app surface runs, so the whole product reads
 *  as one world. Grid colour + the position labels fade out on scroll via the
 *  `--grid-*` / `--grid-op` vars so they dissolve into the incoming footer. */
function ChartBackground() {
  const fade = 'radial-gradient(125% 105% at 50% 46%, #000 40%, transparent 100%)'
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--grid-v) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-h) 1px, transparent 1px)',
          backgroundSize: '64px 46px',
          maskImage: fade,
          WebkitMaskImage: fade,
        }}
      />

      <ul
        className="absolute inset-0 font-mono text-[10px] uppercase tracking-[0.14em] text-[#efe9dc]/55"
        style={{ opacity: 'var(--grid-op, 1)' }}
      >
        <li className="absolute left-[5%] top-[45%]">
          <span className="block text-[#efe9dc]/80">Testnet</span>
          <span className="block">[ Stellar · SDF Horizon ]</span>
        </li>
        <li className="absolute right-[5%] top-[38%] text-right">
          <span className="block text-[#efe9dc]/80">Proof</span>
          <span className="block">[ Groth16 · BN254 ]</span>
        </li>
        <li className="absolute bottom-[16%] left-1/2 -translate-x-1/2 text-center">
          <span className="block text-[#efe9dc]/80">Shielded</span>
          <span className="block">[ Poseidon · Merkle ]</span>
        </li>
      </ul>
    </div>
  )
}

function Word({ children }: { children: string }) {
  return <span className="inline-block">{children}</span>
}

export function Landing({ onEnter }: { onEnter: () => void }) {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.6)))
      const a = 1 - p // grid + labels fade out as the story scrolls up
      el.style.setProperty('--grid-v', `rgba(239,233,220,${(0.06 * a).toFixed(3)})`)
      el.style.setProperty('--grid-h', `rgba(239,233,220,${(0.09 * a).toFixed(3)})`)
      el.style.setProperty('--grid-op', a.toFixed(3))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="relative w-full bg-[#211b12] text-[#efe9dc]">
      <section
        ref={heroRef}
        className="relative min-h-screen w-full overflow-hidden"
        style={{ '--grid-v': GRID_V, '--grid-h': GRID_H, '--grid-op': 1 } as CSSProperties}
      >
      {/* Backdrop — monopo.nyc volumetric raymarch (flowing caustic liquid).
          Grain is a separate static overlay; the field's own alpha bleeds the
          bottom edge into the footer cream. */}
      <div className="absolute inset-0">
        <FluidVolume background="#f4efe4" quality="high" />
      </div>

      {/* Static film grain — fixed noise, does not shimmer. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0.45 0.45 0 -0.4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
          backgroundSize: '90px 90px',
          opacity: 0.6,
        }}
      />

      <ChartBackground />

      {/* Keep the upper half a touch darker for the white type. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(20,16,9,0.55), rgba(20,16,9,0.12) 42%, transparent 70%)' }}
      />

      {/* Header — fixed, inverts against whatever scrolls behind it. */}
      <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <div className="flex items-center justify-between px-8 py-5">
          <a href="#/" className="flex items-center gap-2.5">
            <img src={markUrl} alt="Lax-Stell" className="h-7 w-auto" />
            <span className="font-display text-sm font-semibold tracking-tight">
              lax-stell <span className="align-super font-mono text-[10px] tracking-[0.2em] text-[#efe9dc]/60">ZK</span>
            </span>
          </a>
          <nav className="flex items-center gap-8 font-mono text-[11px] uppercase tracking-[0.18em]">
            <a href="#/faucet" className="text-[#efe9dc]/70 transition hover:text-[#efe9dc]">
              Faucet
            </a>
            <button onClick={onEnter} className="text-[#efe9dc]/70 transition hover:text-[#efe9dc]">
              Enter →
            </button>
          </nav>
        </div>
      </header>

      {/* Hero — two fixed word-lines + one rotating, scrambling line. */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <h1
          className="text-center font-display font-medium uppercase leading-[0.98] tracking-[-0.04em] text-[#f6f1e6]"
          style={{ fontSize: 'clamp(2.6rem, 7.4vw, 5.75rem)', textShadow: '0 2px 30px rgba(20,16,9,0.45)' }}
        >
          <span className="flex flex-wrap justify-center gap-x-[0.26em]">
            <Word>private</Word>
            <Word>money</Word>
          </span>
          <span className="flex flex-wrap justify-center gap-x-[0.26em]">
            <Word>that</Word>
            <Word>stays</Word>
          </span>
          <span className="block">
            <ScrambleCycle words={ROTATING} duration={900} hold={2000} />
          </span>
        </h1>

        <span className="mt-10 font-mono text-[11px] uppercase tracking-[0.3em] text-[#efe9dc]/55">scroll</span>
      </div>

      {/* Clean seam into the footer: a long, gradual cream wash over the bottom
          (grain, lines and fluid alike) reaching pure #f4efe4 at the boundary so
          the section change is invisible. Below the z-10 content, so the headline
          and `scroll` stay crisp; the ramp stays transparent through their band. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[32rem]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(244,239,228,0) 0%, rgba(244,239,228,0) 44%, rgba(244,239,228,0.28) 64%, rgba(244,239,228,0.62) 80%, rgba(244,239,228,0.9) 92%, #f4efe4 100%)',
        }}
      />
      </section>

      <StoryShielded onEnter={onEnter} />

      <footer className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#f4efe4] px-8 py-16 text-[#1b1610]">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0.4 0.4 0 -0.4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
            backgroundSize: '90px 90px',
          }}
        />

        <div className="relative flex items-start justify-between">
          <p className="max-w-xs text-[15px] font-medium leading-snug">
            Feel free to reach out if you want private money on Stellar — or simply have a chat.
          </p>
          <img src={markUrl} alt="Lax-Stell" className="h-11 w-auto opacity-80" style={{ filter: 'brightness(0)' }} />
        </div>

        <div className="relative">
          <a
            href="mailto:hello@lax-stell.money"
            className="block font-display font-light uppercase leading-none tracking-[-0.02em] text-[#b3a081] transition-colors hover:text-[#4f3e22]"
            style={{ fontSize: 'clamp(2rem, 8.2vw, 6.5rem)' }}
          >
            hello@lax-stell.money
          </a>
          <div className="mt-6 h-px w-full bg-[#1b1610]/20" />
        </div>

        <div className="relative">
          <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
            <nav className="flex gap-6 font-mono text-[13px] uppercase tracking-[0.14em] text-[#1b1610]/70">
              <a href="#" className="transition hover:text-[#1b1610]">X</a>
              <a href="#" className="transition hover:text-[#1b1610]">GitHub</a>
              <a href="#" className="transition hover:text-[#1b1610]">Discord</a>
            </nav>

            <div className="grid max-w-2xl grid-cols-1 gap-10 sm:grid-cols-2">
              <div className="max-w-[15rem]">
                <div className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em]">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                    <circle cx="6.5" cy="6.5" r="6" stroke="currentColor" />
                  </svg>
                  Open source
                </div>
                <p className="text-[13px] leading-relaxed text-[#1b1610]/70">
                  Lax-Stell is open source and community-run. We're always looking for cryptographers, Soroban engineers and designers. Reach out with what you'd build.
                </p>
              </div>
              <div className="max-w-[15rem]">
                <div className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em]">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                    <circle cx="5" cy="6.5" r="4.5" stroke="currentColor" />
                    <circle cx="8" cy="6.5" r="4.5" stroke="currentColor" />
                  </svg>
                  Security
                </div>
                <p className="text-[13px] leading-relaxed text-[#1b1610]/70">
                  Found a vulnerability in the circuits or contracts? Disclose it responsibly at security@lax-stell.money — privacy protects everyone.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-14 flex items-center justify-between border-t border-[#1b1610]/12 pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-[#1b1610]/50">
            <span>© Lax-Stell 2026</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="transition hover:text-[#1b1610]"
            >
              Top ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
