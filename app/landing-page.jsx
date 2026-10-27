import Image from 'next/image';
import heroImage from '../public/images/hero.jpg';
import ctaImage from '../public/images/cta.jpg';
import Button from './components/button';
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

// Hero entrance animations, staggered with inline animationDelay.
const ENTER_RISE = 'animate-rise motion-reduce:animate-none';
const ENTER_POP = 'animate-pop motion-reduce:animate-none';

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

// Below lg the photo is too narrow for pinned tags, so two of them stack under
// the button in a zigzag, each connector pointing toward the middle.
function MobilePriceTags({ priceTags }) {
  return (
    <div className='mt-10 flex w-full max-w-[343px] flex-col gap-6 lg:hidden'>
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

function TrustedBar({ delay }) {
  return (
    <div
      style={{ animationDelay: delay }}
      className={`${ENTER_RISE} absolute bottom-[21px] left-1/2 flex w-[897px] max-w-[calc(100%-32px)] -translate-x-1/2 flex-col overflow-hidden rounded-[8px] bg-white pb-4 pt-5 md:h-[79px] md:flex-row md:items-center md:pb-0 md:pl-[40.5px] md:pr-[5.5px] md:pt-0`}
    >
      {/* Mobile: label on top, quotes across the full width below. */}
      <p className='mb-3 shrink-0 px-4 font-serif text-[18px] font-bold leading-[24px] text-black opacity-40 md:mb-0 md:w-[130px] md:px-0 md:text-[22px] md:leading-[26px]'>
        Real Google Reviews
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

function Hero({ project }) {
  return (
    <section className='relative min-h-[960px] overflow-hidden text-white lg:h-[960px]'>
      <Image
        src={heroImage}
        alt=''
        fill
        priority
        sizes='100vw'
        className='object-cover'
      />
      <div className='absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/25 via-50% to-ink/0' />

      <div
        className={`absolute left-1/2 top-[24px] -translate-x-1/2 ${ENTER_RISE}`}
      >
        <Logo />
      </div>

      <div className='relative mx-auto flex max-w-[757px] flex-col items-center px-4 pb-[206px] pt-[200px] text-center lg:pb-0'>
        <h1
          className={`font-serif text-[44px] font-bold leading-[0.95] md:text-[64px] ${ENTER_RISE}`}
          style={{ animationDelay: '150ms' }}
        >
          {project.headline}
        </h1>
        <p
          className={`mt-[12px] font-serif text-[22px] font-medium leading-[1.3] md:text-[28px] ${ENTER_RISE}`}
          style={{ animationDelay: '300ms' }}
        >
          Our founder comes to your home or lot and gives you detailed bid going
          line by line through every cost.
        </p>
        <div
          className={`mt-[24px] ${ENTER_RISE}`}
          style={{ animationDelay: '450ms' }}
        >
          <Button href={`/bid/${project.slug}`} />
        </div>
        <MobilePriceTags priceTags={project.priceTags} />
      </div>

      <PriceTag
        {...project.priceTags[0]}
        side='right'
        delay='800ms'
        className='absolute hidden lg:block left-[70.21%] top-[525px]'
      />
      <PriceTag
        {...project.priceTags[1]}
        side='left'
        delay='1000ms'
        className='absolute hidden lg:block left-[15.28%] top-[595px]'
      />
      <PriceTag
        {...project.priceTags[2]}
        side='right'
        delay='1200ms'
        className='absolute hidden lg:block left-[61.18%] top-[750px]'
      />

      <TrustedBar delay='1450ms' />
    </section>
  );
}

function Intro({ project }) {
  return (
    <section className='mx-auto grid max-w-[1248px] gap-12 px-4 py-24 lg:grid-cols-[648px_560px] lg:justify-between lg:gap-0'>
      <div className='lg:pt-[47px]'>
        <h2 className='font-serif text-[36px] font-bold leading-[0.95] md:text-[48px]'>
          {project.headline}
        </h2>
        <div className='mt-4 space-y-10 font-serif text-[20px] leading-[40px] md:text-[24px]'>
          <p>
            So this is a test... we are going to type basically whatever we want
            into here to see what this thing can do. And then we will change it
            and make it look better.
          </p>
          <p>
            So just to be careful, lets also see what it takes to make it look
            like a second paragraph up in hizzle. Boom.
          </p>
        </div>
        <div className='mt-8'>
          <Button href={`/bid/${project.slug}`} />
        </div>
      </div>
      {/* Image sits above the copy on mobile, to the right on desktop. */}
      <div className='-order-1 aspect-[560/582] w-full bg-placeholder lg:order-none' />
    </section>
  );
}

function Projects({ project }) {
  // Duration scales with the photo count so every carousel moves at the same speed.
  const count = project.gallery?.length ?? 5;
  return (
    <section className='overflow-hidden bg-brand/5 py-24'>
      <h2 className='px-4 text-center font-serif text-[36px] font-bold leading-[0.95] text-black md:text-[48px]'>
        {project.plural} we’ve completed
      </h2>
      <Marquee
        className='mt-10 hover:[animation-play-state:paused]'
        copyClassName='gap-4 pr-4'
        duration={`${count * 20}s`}
      >
        {project.gallery
          ? project.gallery.map((photo) => (
              <div
                key={photo.src}
                className='relative aspect-[548/531] w-[min(548px,80vw)] shrink-0 bg-placeholder'
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes='(min-width: 685px) 548px, 80vw'
                  className='object-cover'
                />
              </div>
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
    <figure className='flex w-[471px] max-w-[85vw] shrink-0 snap-start flex-col bg-brand/5 p-6 md:min-h-[540px] md:p-10'>
      <p
        className='text-[18px] tracking-[3px] text-brand md:text-[24px] md:tracking-[4px]'
        aria-label='5 out of 5 stars'
      >
        ★★★★★
      </p>
      <blockquote className='mt-4 flex-1 font-serif text-[18px] leading-[28px] text-ink md:mt-6 md:text-[22px] md:leading-[34px]'>
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
    <section className='py-24'>
      <h2 className='mx-auto max-w-[1232px] px-4 font-serif text-[36px] font-bold leading-[0.95] text-black md:text-[48px]'>
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
    <section className='bg-brand/5 px-4 pb-[120px] pt-[157px]'>
      <h2 className='text-center font-serif text-[40px] font-bold leading-[0.95] text-black md:text-[56px]'>
        Frequently Asked Questions
      </h2>
      <div className='mx-auto mt-[63px] max-w-[829px] space-y-4'>
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
            <p className='-mt-2 px-6 pb-8 font-serif text-[18px] leading-[30px] text-ink/80'>
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
    <section className='relative h-[642px] overflow-hidden text-white'>
      <Image
        src={ctaImage}
        alt=''
        fill
        sizes='100vw'
        className='object-cover object-[50%_56%]'
      />
      <div className='absolute inset-0 bg-gradient-to-b from-ink/40 to-ink/0' />
      <div className='relative mx-auto flex max-w-[757px] flex-col items-center px-4 pt-[201px] text-center'>
        <h2 className='font-serif text-[44px] font-bold leading-[0.95] md:text-[64px]'>
          {project.headline}
        </h2>
        <div className='mt-8'>
          <Button href={`/bid/${project.slug}`} />
        </div>
      </div>
    </section>
  );
}

export default function LandingPage({ project }) {
  return (
    <main>
      <Hero project={project} />
      <Intro project={project} />
      <Projects project={project} />
      <Reviews />
      <Faq faqs={project.faqs} />
      <ClosingCta project={project} />
      <footer className='h-[630px] bg-ink' />
    </main>
  );
}
