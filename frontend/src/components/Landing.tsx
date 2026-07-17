import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import ScrambleCycle from './ScrambleCycle'
import { StoryShielded } from './StoryShielded'
import heroBanner from '../assets/hero-banner.jpg'
import logoDark from '../assets/logo-dark.png'
import logoLight from '../assets/logo-light.png'
import { ThemeToggle } from './ThemeToggle'
import { useIsDark } from '../hooks/useTheme'

const ROTATING = ['shielded', 'unlinkable', 'verified', 'private', 'yours']

/** Coordinate-label copy. Module-level so ScrambleCycle's `words` stays
 *  referentially stable across renders — an inline array would re-fire its
 *  effect every render and restart the animation. The labels settle in once
 *  (`once`) and then hold: they're fixed readouts, not a loop. Durations are
 *  staggered so the three resolve in sequence rather than snapping together. */
const NET_TITLE = ['Testnet']
const NET_VALUE = ['Stellar · SDF Horizon']
const PROOF_TITLE = ['Proof']
const PROOF_VALUE = ['UltraHonk · BN254']
const SHIELD_TITLE = ['Shielded']
const SHIELD_VALUE = ['Poseidon2 · Merkle']

const GRID_V = 'rgba(255,255,255,0.06)'
const GRID_H = 'rgba(255,255,255,0.09)'
const GRID_V_LIGHT = 'rgba(33,27,18,0.06)'
const GRID_H_LIGHT = 'rgba(33,27,18,0.09)'

/** A faint trading-chart grid behind the hero — evenly spaced vertical (time)
 *  and horizontal (price) hairlines, the horizontals a touch stronger like price
 *  levels — the same atmosphere the app surface runs, so the whole product reads
 *  as one world. Grid colour + the position labels fade out on scroll via the
 *  `--grid-*` / `--grid-op` vars so they dissolve into the incoming footer. */
function ChartBackground({ dark }: { dark: boolean }) {
  const fade = 'radial-gradient(125% 105% at 50% 46%, #000 40%, transparent 100%)'
  const textColor = dark ? 'text-[#efe9dc]/55' : 'text-[#211b12]/55'
  const textHighlight = dark ? 'text-[#efe9dc]/80' : 'text-[#211b12]/80'
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
        className={`absolute inset-0 font-mono text-[10px] uppercase tracking-[0.14em] ${textColor}`}
        style={{ opacity: 'var(--grid-op, 1)' }}
      >
        <li className="absolute left-[5%] top-[45%]">
          <span className={`block ${textHighlight}`}>
            <ScrambleCycle words={NET_TITLE} duration={620} glitch={false} once />
          </span>
          <span className="block">
            [ <ScrambleCycle words={NET_VALUE} duration={900} glitch={false} once /> ]
          </span>
        </li>
        <li className="absolute right-[5%] top-[38%] text-right">
          <span className={`block ${textHighlight}`}>
            <ScrambleCycle words={PROOF_TITLE} duration={820} glitch={false} once />
          </span>
          <span className="block">
            [ <ScrambleCycle words={PROOF_VALUE} duration={1150} glitch={false} once /> ]
          </span>
        </li>
        <li className="absolute bottom-[16%] left-1/2 -translate-x-1/2 text-center">
          <span className={`block ${textHighlight}`}>
            <ScrambleCycle words={SHIELD_TITLE} duration={1040} glitch={false} once />
          </span>
          <span className="block">
            [ <ScrambleCycle words={SHIELD_VALUE} duration={1400} glitch={false} once /> ]
          </span>
        </li>
      </ul>
    </div>
  )
}

function Word({ children }: { children: string }) {
  return <span className="inline-block">{children}</span>
}

export function Landing({ onEnter }: { onEnter: () => void }) {
  // Smooth section scrolling is driven by the ScrollStack's window-scroll Lenis
  // (in StoryShielded), so no separate Lenis instance is mounted here.
  const heroRef = useRef<HTMLElement>(null)
  const dark = useIsDark()

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.6)))
      const a = 1 - p // grid + labels fade out as the story scrolls up
      const colorPrefix = dark ? '255,255,255' : '33,27,18'
      el.style.setProperty('--grid-v', `rgba(${colorPrefix},${(0.06 * a).toFixed(3)})`)
      el.style.setProperty('--grid-h', `rgba(${colorPrefix},${(0.09 * a).toFixed(3)})`)
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
  }, [dark])

  return (
    <div
      className="relative w-full transition-colors duration-300"
      style={{
        backgroundColor: dark ? '#211b12' : '#efe9dc',
        color: dark ? '#efe9dc' : '#211b12',
      }}
    >
      <section
        ref={heroRef}
        className="relative min-h-screen w-full overflow-hidden"
        style={{ '--grid-v': dark ? GRID_V : GRID_V_LIGHT, '--grid-h': dark ? GRID_H : GRID_H_LIGHT, '--grid-op': 1 } as CSSProperties}
      >
      {/* Backdrop — hero banner, graded onto the brand's sepia axis so the gold
          reads as the same world as the app surface rather than a standalone
          illustration. `isolate` keeps the blend layers acting on the image
          only, never on the page beneath. Grain is a separate static overlay. */}
      <div className="absolute inset-0 isolate overflow-hidden">
        <img
          src={heroBanner}
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
          style={{
            filter: dark
              ? 'saturate(0.45) contrast(1.05) brightness(0.44)'
              : 'saturate(0.4) contrast(0.9) brightness(1.06)',
          }}
        />
        {/* Hue tint — the same base colours the fluid field used, so the palette
            carries over unchanged from the previous backdrop. */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: dark ? '#4f3e22' : '#b2a590', mixBlendMode: 'color', opacity: 0.55 }}
        />
        {/* Ground wash — sinks the image toward the story ground (dark) or the
            page cream (light) so the headline keeps its contrast. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: dark ? '#17120b' : '#efe9dc',
            mixBlendMode: dark ? 'multiply' : 'screen',
            opacity: dark ? 0.5 : 0.55,
          }}
        />
      </div>

      {/* Static film grain — fixed noise, does not shimmer. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0.45 0.45 0 -0.4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
          backgroundSize: '90px 90px',
          opacity: dark ? 0.6 : 0.25,
        }}
      />

      <ChartBackground dark={dark} />

      {/* Keep the upper half a touch darker for the white type. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: dark
            ? 'linear-gradient(to bottom, rgba(20,16,9,0.55), rgba(20,16,9,0.12) 42%, transparent 70%)'
            : 'linear-gradient(to bottom, rgba(239,233,220,0.55), rgba(239,233,220,0.12) 42%, transparent 70%)',
        }}
      />

      {/* Header — fixed, inverts against whatever scrolls behind it. */}
      <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <div className="flex items-center justify-between px-8 py-5">
          <a href="#/" className="flex items-center gap-3">
            {/* Dark logo (black mark) works with mix-blend-difference: inverts to white on dark bg */}
            <img src={logoDark} alt="Lax-Stell" className="h-12 w-auto" />
            <span className="font-display text-base font-semibold tracking-tight text-[#efe9dc]">
              lax-stell
            </span>
          </a>
          <nav className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.18em]">
            <a href="#/faucet" className="text-[#efe9dc]/70 transition hover:text-[#efe9dc]">
              Faucet
            </a>
            <ThemeToggle />
            <button onClick={onEnter} className="text-[#efe9dc]/70 transition hover:text-[#efe9dc]">
              Enter →
            </button>
          </nav>
        </div>
      </header>

      {/* Hero — two fixed word-lines + one rotating, scrambling line. */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <h1
          className="text-center font-display font-medium uppercase leading-[0.98] tracking-[-0.04em]"
          style={{
            fontSize: 'clamp(2.6rem, 7.4vw, 5.75rem)',
            textShadow: dark ? '0 2px 30px rgba(20,16,9,0.45)' : 'none',
            color: dark ? '#f6f1e6' : '#211b12',
          }}
        >
          <span className="flex flex-wrap justify-center gap-x-[0.26em]">
            <Word>private</Word>
            <Word>your</Word>
            <Word>assets</Word>
          </span>
          <span className="flex flex-wrap justify-center gap-x-[0.26em]">
            <Word>that</Word>
            <Word>stay</Word>
          </span>
          <span className="block">
            <ScrambleCycle words={ROTATING} duration={900} hold={2000} />
          </span>
        </h1>

        <span className={`mt-10 font-mono text-[11px] uppercase tracking-[0.3em] ${dark ? 'text-[#efe9dc]/55' : 'text-[#211b12]/55'}`}>scroll</span>
      </div>

      {/* Clean seam into the dark story: a long, gradual wash over the bottom
          (grain and fluid alike) reaching the story ground #17120b at the
          boundary so the section change is invisible. Below the z-10 content, so
          the headline and `scroll` stay crisp; the ramp stays transparent through
          their band. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[32rem]"
        style={{
          background: dark
            ? 'linear-gradient(to bottom, rgba(23,18,11,0) 0%, rgba(23,18,11,0) 48%, rgba(23,18,11,0.35) 70%, rgba(23,18,11,0.72) 86%, rgba(23,18,11,0.92) 94%, #17120b 100%)'
            : 'linear-gradient(to bottom, rgba(239,233,220,0) 0%, rgba(239,233,220,0) 48%, rgba(239,233,220,0.35) 70%, rgba(239,233,220,0.72) 86%, rgba(239,233,220,0.92) 94%, #efe9dc 100%)',
        }}
      />
      </section>

      <StoryShielded onEnter={onEnter} />

      <footer className="relative flex min-h-screen flex-col justify-between overflow-hidden px-8 py-16 transition-colors duration-300"
              style={{
                backgroundColor: dark ? '#17120b' : '#efe9dc',
                color: dark ? '#efe9dc' : '#211b12',
              }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0.35 0.35 0.35 0 -0.36'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
            backgroundSize: '90px 90px',
          }}
        />

        <div className="relative flex items-start justify-between">
          <p className={`max-w-xs text-[15px] font-medium leading-snug ${dark ? 'text-[#efe9dc]/80' : 'text-[#211b12]/80'}`}>
            Feel free to reach out if you want private money on Stellar — or simply have a chat.
          </p>
          <a href="#/" className="transition hover:opacity-75">
            <img src={dark ? logoDark : logoLight} alt="Lax-Stell" className="h-36 w-auto opacity-85" />
          </a>
        </div>

        <div className="relative">
          <a
            href="mailto:hello@lax-stell.money"
            className="block font-display font-light uppercase leading-none tracking-[-0.02em] transition-colors hover:text-[#efe9dc]"
            style={{
              fontSize: 'clamp(2rem, 8.2vw, 6.5rem)',
              color: dark ? '#b3a081' : '#8e7a5c',
            }}
          >
            firdaussyah03@gmail.com
          </a>
          <div className="mt-6 h-px w-full" style={{ backgroundColor: dark ? 'rgba(239,233,220,0.2)' : 'rgba(33,27,18,0.2)' }} />
        </div>

        <div className="relative">
          <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
            <nav className={`flex gap-6 font-mono text-[13px] uppercase tracking-[0.14em] ${dark ? 'text-[#efe9dc]/70' : 'text-[#211b12]/70'}`}>
              <a href="https://github.com/ln-tc999/LaxStell.git" className={`transition ${dark ? 'hover:text-[#efe9dc]' : 'hover:text-[#211b12]'}`}>GitHub</a>
            </nav>

            <div className="grid max-w-2xl grid-cols-1 gap-10 sm:grid-cols-2">
              <div className="max-w-[15rem]">
                <div className={`mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] ${dark ? 'text-[#efe9dc]' : 'text-[#211b12]'}`}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                    <circle cx="6.5" cy="6.5" r="6" stroke="currentColor" />
                  </svg>
                  Open source
                </div>
                <p className={`text-[13px] leading-relaxed ${dark ? 'text-[#efe9dc]/70' : 'text-[#211b12]/70'}`}>
                  Lax-Stell is open source and community-run. We're always looking for cryptographers, Soroban engineers and designers. Reach out with what you'd build.
                </p>
              </div>
              <div className="max-w-[15rem]">
                <div className={`mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] ${dark ? 'text-[#efe9dc]' : 'text-[#211b12]'}`}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                    <circle cx="5" cy="6.5" r="4.5" stroke="currentColor" />
                    <circle cx="8" cy="6.5" r="4.5" stroke="currentColor" />
                  </svg>
                  Security
                </div>
                <p className={`text-[13px] leading-relaxed ${dark ? 'text-[#efe9dc]/70' : 'text-[#211b12]/70'}`}>
                  Found a vulnerability in the circuits or contracts? Disclose it responsibly at security@lax-stell.money — privacy protects everyone.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-14 flex items-center justify-between border-t pt-6 font-mono text-[11px] uppercase tracking-[0.14em]"
               style={{
                 borderColor: dark ? 'rgba(239,233,220,0.12)' : 'rgba(33,27,18,0.12)',
                 color: dark ? 'rgba(239,233,220,0.5)' : 'rgba(33,27,18,0.5)',
               }}
          >
            <span>© Lax-Stell 2026</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`transition ${dark ? 'hover:text-[#efe9dc]' : 'hover:text-[#211b12]'}`}
            >
              Top ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
