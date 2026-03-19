# MMC More Venues — Assets + Manifest

This folder contains venue images renamed with a consistent convention and a JSON manifest with the exact native image dimensions.

## Naming convention
mmc-venue-<slug>__w<WIDTH>__h<HEIGHT>.<ext>

Example:
mmc-venue-elysium-hotel-paphos__w375__h214.jpg

## Manifest
`mmc_more_venues_manifest.json` fields:
- name
- slug
- file
- width
- height
- aspectRatio

## Recommended rendering (no cropping)
Use `object-fit: contain` and set the card aspect ratio from the manifest.

Example (Next.js / React):

```tsx
import Image from "next/image";
import venues from "@/content/mmc_more_venues_manifest.json";

export default function MoreVenuesGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {venues.map((v) => (
        <article key={v.slug} className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <div
            className="relative w-full bg-neutral-100"
            style={{ aspectRatio: `${v.width} / ${v.height}` }}
          >
            <Image
              src={`/venues/more/${v.file}`}
              alt={v.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "contain" }}
              priority={false}
            />
          </div>

          <div className="p-5">
            <h3 className="text-lg font-semibold">{v.name}</h3>
            {/* writeUp + highlights will come from your venues content file */}
          </div>
        </article>
      ))}
    </div>
  );
}
```

Place images at: `public/venues/more/`
Place manifest at: `src/content/mmc_more_venues_manifest.json`
