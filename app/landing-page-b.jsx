import Image from 'next/image';
import heroImage from '../public/images/hero.jpg';
import founderImage from '../public/images/about/founder.jpg';
import Button from './components/button';
import FunnelTracker from './funnel-tracker';
import HeroReveal from './hero-reveal';
import Logo from './components/logo';
import { GOOGLE_REVIEWS_URL, reviews } from './reviews';

// Infinite horizontal scroller. Renders the items twice and slides the track
// by half its width so the loop is seamless. `copyClassName` must include a
// trailing padding equal to the gap, e.g. "gap-4 pr-4".
function Marquee({
  children,
  copyClassName,
  duration = '40s',
  className = '',
}) {
  return (
    <div
      className={`flex w-max animate-marquee motion-reduce:animate-none ${className}`}
      style={{ animationDuration: duration }}
    >
      <div className={`flex shrink-0 items-center ${copyClassName}`}>
        {children}
      </div>
      <div
        aria-hidden
        inert
        className={`flex shrink-0 items-center ${copyClassName}`}
      >
        {children}
      </div>
    </div>
  );
}

// Every "Get your bid" button on this page. On mobile: full width, 64px tall,
// 18px text (max-md: variants come after the base sizes in Tailwind's CSS, so
// they win). The text stroke makes the text heavier than bold: Helvetica Neue
// and Arial have no heavier weight on most devices, so font-black does nothing.
const B_BUTTON =
  'max-md:h-16 max-md:w-full max-md:text-[18px] [-webkit-text-stroke:0.6px_currentColor]';

// Hero entrance animations, staggered with inline animationDelay.
// They stay paused (and hidden, via `both`) until HeroReveal sets data-loaded,
// so each delay counts from when the photo has loaded. The ! beats the
// animation shorthand, which would otherwise reset the play state.
const UNTIL_LOADED =
  '[animation-play-state:paused]! group-data-[loaded]/hero:[animation-play-state:running]!';
const ENTER_RISE = `animate-rise motion-reduce:animate-none ${UNTIL_LOADED}`;
const ENTER_POP = `animate-pop motion-reduce:animate-none ${UNTIL_LOADED}`;
const ENTER_DROP = `animate-drop motion-reduce:animate-none ${UNTIL_LOADED}`;

// Line-item price tag with a connector line and pulsing end dot. `side`
// controls which way the connector points; `className` positions the tag.
function PriceTag({ label, price, side, delay, className }) {
  const right = side === 'right';
  return (
    <div
      className={`${ENTER_POP} ${className}`}
      style={{ animationDelay: delay }}
    >
      {/* Pulsing ring behind the connector's end dot (22px, matches the SVG circle). */}
      <span
        className={`absolute size-[22px] animate-dot-pulse rounded-full bg-brand motion-reduce:hidden ${right ? 'left-[293.66px] top-[64.49px]' : 'left-[-98px] top-[65.49px]'}`}
        style={{ animationDelay: delay }}
      />
      <img
        src={
          right ? '/images/connector-right.svg' : '/images/connector-left.svg'
        }
        alt=''
        width={113.659}
        height={22.4915}
        className={`absolute ${right ? 'left-[202px] top-[64px]' : 'left-[-98px] top-[65px] -scale-x-100'}`}
      />
      <PriceTagBox label={label} price={price} />
    </div>
  );
}

function PriceTagBox({ label, price }) {
  return (
    <div className='relative min-h-[76px] w-[202px] rounded-[8px] border-2 border-brand bg-brand-tint px-[14px] pb-[14px] pt-[14px] text-left shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)]'>
      <p className='text-[16px] font-bold leading-[20px] text-black opacity-50'>
        {label}
      </p>
      <p className='mt-[4px] text-[24px] font-bold leading-[20px] text-black'>
        {price}
      </p>
    </div>
  );
}

// On phones the photo is cropped too tightly for pinned tags, so two of them
// stack under the button in a zigzag, each connector pointing toward the
// middle. `zoom` shrinks them to 60% and the layout shrinks with them.
function MobilePriceTags({ priceTags }) {
  return (
    <div
      className='mt-10 flex w-full max-w-[343px] flex-col gap-6 sm:hidden'
      style={{ zoom: 0.6 }}
    >
      {priceTags.slice(0, 2).map((tag, i) => (
        <PriceTag
          key={tag.label}
          {...tag}
          side={i % 2 ? 'right' : 'left'}
          delay={`${800 + i * 200}ms`}
          className={`relative ${i % 2 ? 'self-start' : 'self-end'}`}
        />
      ))}
    </div>
  );
}

// Scrolling Google review quotes. In B it sits under the hero button instead
// of floating over the photo.
function TrustedBar({ delay }) {
  return (
    <div
      style={{ animationDelay: delay }}
      className={`${ENTER_RISE} mt-10 flex w-full flex-col overflow-hidden rounded-[8px] bg-white pb-4 pt-5 md:h-[79px] md:flex-row md:items-center md:pb-0 md:pl-[40.5px] md:pr-[5.5px] md:pt-0`}
    >
      {/* Mobile: label on top, quotes across the full width below. */}
      <p className='mb-3 shrink-0 px-4 font-serif text-[18px] font-bold leading-[24px] text-black opacity-40 md:mb-0 md:w-[130px] md:px-0 md:text-[22px] md:leading-[26px]'>
        From our Google Reviews
      </p>
      <div className='relative flex h-[68px] flex-1 items-center overflow-hidden md:h-full'>
        <Marquee copyClassName='gap-[56px] pr-[56px]' duration='150s'>
          {reviews
            .filter((review) => review.short)
            .map((review) => (
              <a
                key={review.name}
                href={GOOGLE_REVIEWS_URL}
                target='_blank'
                rel='noopener noreferrer'
                className='shrink-0 whitespace-nowrap text-ink hover:opacity-70'
              >
                <p className='font-serif text-[20px] leading-[26px]'>
                  “{review.short}”
                </p>
                <span className='mt-1 flex items-center gap-2 text-[14px] leading-[18px]'>
                  <span
                    className='tracking-[2px] text-brand'
                    aria-label='5 out of 5 stars'
                  >
                    ★★★★★
                  </span>
                  <span className='font-bold text-ink/60'>{review.name}</span>
                </span>
              </a>
            ))}
        </Marquee>
        <div className='pointer-events-none absolute inset-y-0 left-0 w-[40px] bg-gradient-to-r md:w-[96px] from-white to-white/0' />
        <div className='pointer-events-none absolute inset-y-0 right-0 w-[40px] bg-gradient-to-l md:w-[96px] from-white to-white/0' />
      </div>
    </div>
  );
}

// Where each tag's connector dot lands on the photo, as % of the cropped image
// box (160px is cut off the top of the 1024x683 photo and 40px off the
// bottom; see Hero).
// x/y come from the original hero's positions (a 1440x960 crop of the photo).
// Phones crop the photo's sides, so mx/my are alternate spots on the same
// feature that stay in view.
const HERO_TAG_ANCHORS = [
  { side: 'right', x: '91.4%', y: '55.32%', mx: '80%', my: '28.99%' },
  { side: 'left', x: '9.24%', y: '65.8%', mx: '21%', my: '34.74%' },
  { side: 'right', x: '82.34%', y: '88.47%', mx: '60%', my: '60.21%' },
];

// Center of the connector dot inside a full-size PriceTag.
const DOT_OFFSET = { right: [304.66, 75.49], left: [-87, 76.49] };

// A shrunken PriceTag pinned to the photo by its connector dot, so the dot keeps
// pointing at the same spot as the photo scales.
function PhotoPriceTag({ x, y, mx, my, side, ...tag }) {
  const [dx, dy] = DOT_OFFSET[side];
  return (
    <div
      className='absolute left-[var(--mx)] top-[var(--my)] [--tag-scale:0.56] sm:left-[var(--x)] sm:top-[var(--y)] lg:[--tag-scale:0.7]'
      style={{ '--x': x, '--y': y, '--mx': mx, '--my': my }}
    >
      <div
        className='origin-top-left'
        style={{
          transform: `scale(var(--tag-scale)) translate(${-dx}px, ${-dy}px)`,
        }}
      >
        <PriceTag {...tag} side={side} className='relative' />
      </div>
    </div>
  );
}

// Entrance: once the photo has loaded, the logo drops in, then the photo,
// copy, reviews bar and price tags rise in. Delays below are measured from the photo loading.
function Hero({ project }) {
  return (
    <HeroReveal>
      <nav className='flex justify-center bg-white py-4'>
        {/* Logo at 60% of its normal 86x80 size. */}
        <div
          className={`h-[48px] w-[52px] ${ENTER_DROP}`}
          style={{ animationDelay: '0ms' }}
        >
          <div className='origin-top-left scale-[0.6]'>
            <Logo dark />
          </div>
        </div>
      </nav>

      {/* The photo spans the screen width, never narrower than 600px; below
          that it's cropped from the center. */}
      <div className='overflow-hidden'>
        {/* Cropped to 1024x483: most of the ceiling is cut off the top and a
            little off the bottom (160px and 40px, hence 80% below). */}
        <div
          className={`relative left-1/2 aspect-[1024/483] w-full min-w-[600px] -translate-x-1/2 bg-placeholder ${ENTER_RISE}`}
          style={{ animationDelay: '150ms' }}
        >
          <Image
            src={heroImage}
            alt=''
            fill
            priority
            unoptimized
            data-hero-image
            className='object-cover object-[50%_80%]'
          />
          {HERO_TAG_ANCHORS.map((anchor, i) => (
            <PhotoPriceTag
              key={project.priceTags[i].label}
              {...project.priceTags[i]}
              {...anchor}
              delay={`${400 + i * 150}ms`}
            />
          ))}
        </div>
      </div>

      <section className='mx-auto flex max-w-[757px] flex-col items-center px-6 py-6 text-left md:py-24'>
        <h1
          className={`font-serif text-[33px] font-bold leading-[0.95] md:text-[64px] ${ENTER_RISE}`}
          style={{ animationDelay: '500ms' }}
        >
          {project.headline}
        </h1>
        <p
          className={`mt-[12px] font-serif text-[20px] font-medium leading-[1.2] md:text-[28px] ${ENTER_RISE}`}
          style={{ animationDelay: '650ms' }}
        >
          Our founder comes to your home or lot and gives you detailed bid going
          line by line through every cost.
        </p>
        <div
          className={`mt-[24px] max-md:w-full ${ENTER_RISE}`}
          style={{ animationDelay: '800ms' }}
        >
          <Button href={`/bid/${project.slug}`} className={B_BUTTON} />
        </div>
        <TrustedBar delay='950ms' />
      </section>
    </HeroReveal>
  );
}

function Intro({ project }) {
  return (
    // Full-width light grey band (same grey as the quote page).
    <div className='bg-[#f7f7f7]'>
      <section className='mx-auto grid max-w-[1248px] gap-12 px-4 py-24 lg:grid-cols-[minmax(0,1fr)_560px] lg:gap-x-20 lg:gap-y-0'>
        <div className='lg:pt-[47px]'>
          <h2 className='font-serif text-[28px] font-bold leading-[0.95] md:text-[48px]'>
            {project.introHeadline}
          </h2>
          <div className='mt-4 space-y-10 font-serif text-[20px] leading-[1.2] md:text-[24px]'>
            <p>
              At CC Builders, we do estimates different. Our founder, Cameron
              Cook, comes to you to measure and understand what you want.
            </p>
            <p>
              Using projects done in the same year as reference, Cameron prices
              every individual item in your project. This helps you see exactly
              what it could cost, and how your design decisions can change that
              estimate. All in one easy to find link we send to your phone, as
              well as a polished PDF.
            </p>
          </div>
          <div className='mt-8'>
            <Button href={`/bid/${project.slug}`} className={B_BUTTON} />
          </div>
        </div>
        {/* Video sits above the copy on mobile, to the right on desktop. The file
          is pre-cropped to this box's 560:582 shape to keep it small. */}
        <video
          src='/videos/quote-demo.mp4'
          poster='/videos/quote-demo-poster.jpg'
          autoPlay
          muted
          loop
          playsInline
          preload='metadata'
          aria-label='Scrolling through a CC Builders bid on a phone'
          className='-order-1 aspect-[560/582] w-full bg-placeholder object-cover lg:order-none'
        />
      </section>
    </div>
  );
}

// Draft copy built from what's already on the site (the founder visit, the
// reviews). Swap in real content when ready.
function About() {
  return (
    <section className='bg-white px-4 py-24'>
      <div className='mx-auto grid max-w-[1248px] items-center gap-12 lg:grid-cols-[480px_minmax(0,1fr)] lg:gap-20'>
        <div className='relative aspect-[4/5] w-full max-w-[480px] bg-placeholder'>
          <Image
            src={founderImage}
            alt='Cameron Cook, founder of CC Builders, on a job site'
            fill
            sizes='(min-width: 512px) 480px, 100vw'
            className='object-cover'
          />
        </div>
        <div>
          <h2 className='font-serif text-[28px] font-bold leading-[0.95] text-black md:text-[48px]'>
            Meet who will do your estimate
          </h2>
          <div className='mt-4 space-y-6 font-serif text-[20px] leading-[1.2] md:text-[24px]'>
            <p>
              CC Builders is led by our founder, Cameron Cook and he is the one
              who will be doing your estimate and leading your project.{' '}
            </p>
            <p>
              If you read our reviews, you'll hear most people talking about
              Cameron's attention to detail and his ability to calmly navigate
              the headaches of construction.
            </p>
            <p>
              Cam takes hours on each review, making sure what you get is the
              most accurate estimate possible to do high quality work.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Projects({ project }) {
  // Duration scales with the photo count so every carousel moves at the same speed.
  const count = project.gallery?.length ?? 5;
  return (
    <section className='overflow-hidden bg-[#f7f7f7] py-24'>
      <h2 className='px-4 text-center font-serif text-[28px] font-bold leading-[0.95] text-black md:text-[48px]'>
        {project.plural} we’ve completed
      </h2>
      <Marquee
        className='mt-10 hover:[animation-play-state:paused]'
        copyClassName='items-start! gap-4 pr-4'
        duration={`${count * 20}s`}
      >
        {project.gallery
          ? project.gallery.map((photo) => (
              <figure key={photo.src} className='w-[min(548px,80vw)] shrink-0'>
                <div className='relative aspect-[548/531] bg-placeholder'>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes='(min-width: 685px) 548px, 80vw'
                    className='object-cover'
                  />
                </div>
                {photo.caption && (
                  <figcaption className='mt-3 font-serif text-[16px] leading-[1.2] text-ink/60 md:text-[18px]'>
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            ))
          : Array.from({ length: count }, (_, i) => (
              <div
                key={i}
                className='aspect-[548/531] w-[min(548px,80vw)] shrink-0 bg-placeholder'
              />
            ))}
      </Marquee>
    </section>
  );
}

function ReviewCard({ name, project, text }) {
  return (
    <figure className='flex w-[471px] max-w-[85vw] shrink-0 snap-start flex-col bg-[#f7f7f7] p-6 md:min-h-[540px] md:p-10'>
      <p
        className='text-[18px] tracking-[3px] text-brand md:text-[24px] md:tracking-[4px]'
        aria-label='5 out of 5 stars'
      >
        ★★★★★
      </p>
      <blockquote className='mt-4 flex-1 font-serif text-[18px] leading-[1.2] text-ink md:mt-6 md:text-[22px]'>
        “{text}”
      </blockquote>
      <figcaption className='mt-6 border-t border-brand/20 pt-4 md:mt-8 md:pt-6'>
        <p className='text-[16px] font-bold text-ink md:text-[18px]'>{name}</p>
        <p className='mt-1 text-[14px] text-ink/60 md:text-[16px]'>
          {project && `${project} · `}
          <a
            href={GOOGLE_REVIEWS_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='underline underline-offset-2 hover:text-ink'
          >
            Read on Google
          </a>
        </p>
      </figcaption>
    </figure>
  );
}

function Reviews() {
  return (
    <section className='bg-white py-24'>
      <h2 className='mx-auto max-w-[1232px] px-4 font-serif text-[28px] font-bold leading-[0.95] text-black md:text-[48px]'>
        Read some of our Google Reviews
      </h2>
      <div className='mt-8 flex snap-x gap-4 overflow-x-auto px-[max(1rem,calc((100%-1200px)/2))] scroll-px-[max(1rem,calc((100%-1200px)/2))] [scrollbar-width:none]'>
        {reviews.map((review, i) => (
          <ReviewCard key={i} {...review} />
        ))}
      </div>
    </section>
  );
}

function Faq({ faqs }) {
  return (
    <section className='bg-[#f7f7f7] px-4 py-24'>
      <h2 className='text-center font-serif text-[28px] font-bold leading-[0.95] text-black md:text-[48px]'>
        Frequently Asked Questions
      </h2>
      <div className='mx-auto mt-10 max-w-[829px] space-y-4'>
        {faqs.map((faq, i) => (
          <details key={i} className='group border border-black bg-white'>
            <summary className='flex min-h-[96px] cursor-pointer list-none items-center justify-between gap-4 px-6 py-4'>
              <span className='font-serif text-[20px] font-bold leading-[1.3] text-black md:text-[22px]'>
                {faq.question}
              </span>
              <img
                src='/images/chevron-down.svg'
                alt=''
                width={36}
                height={36}
                className='shrink-0 transition-transform group-open:rotate-180'
              />
            </summary>
            <p className='-mt-2 px-6 pb-8 font-serif text-[18px] leading-[1.2] text-ink/80'>
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

function ClosingCta({ project }) {
  return (
    <section className='bg-brand px-4 py-24 text-white md:py-32'>
      <div className='mx-auto flex max-w-[757px] flex-col items-center text-center'>
        <h2 className='font-serif text-[28px] font-bold leading-[0.95] md:text-[48px]'>
          {project.headline}
        </h2>
        <div className='mt-8 max-md:w-full'>
          {/* A darker shade of the brand color so it stands out on the
              brand-colored background. The ! beats the button's own bg-brand. */}
          <Button
            href={`/bid/${project.slug}`}
            className={`${B_BUTTON} bg-[#123b3b]!`}
          />
        </div>
      </div>
    </section>
  );
}

export default function LandingPage({ project }) {
  return (
    <main>
      <FunnelTracker slug={project.slug} design='b' />
      <Hero project={project} />
      <Intro project={project} />
      <About />
      <Projects project={project} />
      <Reviews />
      <Faq faqs={project.faqs} />
      <ClosingCta project={project} />
      <footer className='bg-ink px-4 py-6 text-center text-xs text-white/50'>
        © {new Date().getFullYear()} CC Builders. All rights reserved.
      </footer>
    </main>
  );
}
