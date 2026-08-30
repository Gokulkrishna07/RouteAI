type BrandMarkProps = {
  size?: number | string
  color?: string
}

const GLYPH =
  'M0 0h178c53 0 96 39 96 88s-43 88-96 88h-4l98 132c3 4 0 6-4 6h-92c-4 0-7-2-9-5L76 176v138H0V0Z' +
  'M30 60c0-26 18-38 38-34s32 18 44 32c8 10 16 14 28 14h65c23 0 35 12 35 28s-12 28-35 28H92c-26 0-46-10-54-32-5-12-8-24-8-36Z'

function BrandMark({ size = '1em', color = 'currentColor' }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 314 314"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path transform="translate(20)" fill={color} fillRule="evenodd" clipRule="evenodd" d={GLYPH} />
    </svg>
  )
}

export default BrandMark
