import { Shell } from './ui'

const fonts = [
  { name: '1. Montserrat (Current)', style: { fontFamily: '"Montserrat", sans-serif', fontWeight: 700 } },
  { name: '2. Oswald (Condensed & Industrial)', style: { fontFamily: '"Oswald", sans-serif', fontWeight: 600 } },
  { name: '3. Space Grotesk (Engineered & Technical)', style: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 } },
  { name: '4. Outfit (Premium & Modern)', style: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 } },
  { name: '5. Roboto Slab (Heavy Steel)', style: { fontFamily: '"Roboto Slab", serif', fontWeight: 700 } },
  { name: '6. Archivo Black (Ultra Solid)', style: { fontFamily: '"Archivo Black", sans-serif', fontWeight: 400 } },
  { name: '7. Bebas Neue (Tall & Imposing)', style: { fontFamily: '"Bebas Neue", sans-serif', fontWeight: 400, letterSpacing: '0.05em' } },
]

export default function FontOptions() {
  return (
    <div className="min-h-screen bg-ground py-24">
      <Shell>
        <div className="mb-16">
          <h1 className="text-3xl font-light text-heading mb-4">Industrial Typography Options</h1>
          <p className="text-body max-w-xl">
            I have curated a new set of fonts specifically chosen for a pre-engineered building and heavy industry group. 
            These are bolder, stronger, and more structural than the previous elegant serifs.
          </p>
        </div>

        <div className="space-y-16">
          {fonts.map((font) => (
            <div key={font.name} className="border-t border-line pt-8">
              <div className="mb-6 flex items-center gap-4">
                <span className="tech text-accent">{font.name}</span>
                <span className="h-px flex-grow bg-line/50"></span>
              </div>
              
              <div className="bg-raised rounded-2xl p-8 lg:p-16">
                <h2 
                  style={font.style}
                  className="text-[clamp(1.7rem,3.2vw,2.75rem)] leading-[1.1] tracking-tight text-heading"
                >
                  <span className="block">The building is made</span>
                  <span className="block text-accent">before the slab cures.</span>
                </h2>
              </div>
            </div>
          ))}
        </div>
      </Shell>
    </div>
  )
}
