import { Box, Typography } from '@mui/material'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined'
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined'
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import { fonts, fontSizes } from '../constants'
import { DocsShell, Keyword, NAV_HEIGHT, SectionHeading, useDocsTheme } from '../docs/DocsLayout'

const TOC_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'How It Decides', href: '#how-it-decides' },
  { label: 'Gemini', href: '#gemini' },
  { label: 'Groq', href: '#groq' },
  { label: 'OpenRouter', href: '#openrouter' },
  { label: 'Good to Know', href: '#good-to-know' },
]

const HOW_IT_DECIDES = [
  {
    icon: <CompareArrowsOutlinedIcon sx={{ fontSize: 18 }} />,
    title: 'It reads your question first',
    description: 'Before anything is answered, AI Model Router takes a quick look at what you asked — how long it is, how many parts it has, how much thinking it seems to need.',
  },
  {
    icon: <SpeedOutlinedIcon sx={{ fontSize: 18 }} />,
    title: 'Easy questions get fast models',
    description: 'A quick "what time zone is it there" doesn’t need a heavyweight thinker, so it goes to one of the fast, lightweight models.',
  },
  {
    icon: <PsychologyOutlinedIcon sx={{ fontSize: 18 }} />,
    title: 'Harder questions get a more capable model',
    description: 'Something layered or open-ended is handed to a model built for deeper reasoning, even if the reply takes a touch longer.',
  },
  {
    icon: <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 18 }} />,
    title: 'You can always ask for a specific model',
    description: "If you already know which model you'd like, you can name it directly and AI Model Router will use that one instead of deciding for you.",
  },
]

const MODELS = [
  {
    id: 'gemini',
    name: 'Gemini',
    by: 'Google',
    icon: <PsychologyOutlinedIcon sx={{ fontSize: 20 }} />,
    tagline: 'The thoughtful one.',
    description:
      "Google's Gemini is the model AI Model Router turns to when a question needs more care and reasoning — something with several steps, a longer explanation, or a bit of nuance.",
    pickedFor: 'Detailed, involved, or multi-part questions.',
    tryAsking: ['Explain a tricky concept step by step', 'Compare a few options and weigh the trade-offs', 'Draft something that needs a thoughtful tone'],
  },
  {
    id: 'groq',
    name: 'Groq',
    by: 'Groq',
    icon: <BoltOutlinedIcon sx={{ fontSize: 20 }} />,
    tagline: 'The quick one.',
    description:
      "Groq is built for raw speed. It's the first model AI Model Router reaches for on short, everyday questions where you just want a fast, no-fuss answer.",
    pickedFor: 'Simple, quick, everyday questions.',
    tryAsking: ['Quick facts or definitions', 'Simple one-line questions', 'Small everyday tasks like a unit conversion'],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    by: 'OpenRouter',
    icon: <RouteOutlinedIcon sx={{ fontSize: 20 }} />,
    tagline: 'The flexible one.',
    description:
      "OpenRouter isn't a single model — it's a gateway to many others. For questions that sit right in the middle of the difficulty scale, AI Model Router lets OpenRouter automatically pick whichever model behind it is best suited to answer.",
    pickedFor: 'Balanced, middle-of-the-road questions.',
    tryAsking: ['Everyday questions that need a bit more depth', 'Requests that don’t clearly need a fast or heavyweight model', 'General writing or explanation help'],
  },
]

const GOOD_TO_KNOW = [
  {
    icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 18 }} />,
    title: 'Quality is never sacrificed for speed',
    description: 'A fast model is only chosen when the question is genuinely simple enough for it — not as a shortcut that leaves you with a worse answer.',
  },
  {
    icon: <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 18 }} />,
    title: 'The list will keep growing',
    description: 'AI Model Router is designed to plug in new models over time, so this page will grow along with it.',
  },
]

function ModelCard({ id, name, by, icon, tagline, description, pickedFor, tryAsking }: (typeof MODELS)[number]) {
  const { c } = useDocsTheme()
  return (
    <Box sx={{ mb: 6, mt: 7 }}>
      <Box
        id={id}
        sx={{
          scrollMarginTop: NAV_HEIGHT + 24,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pb: 1.5,
          mb: 1.5,
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            bgcolor: c.accentBg,
            color: c.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography component="h2" sx={{ fontFamily: fonts.heading, fontSize: fontSizes.h2, fontWeight: 700, color: c.textPrimary }}>
          {name}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: fontSizes.small, color: c.textMuted, mb: 1.5 }}>
        By {by} &middot; {tagline}
      </Typography>
      <Typography sx={{ fontSize: fontSizes.body, lineHeight: 1.7, color: c.textSecondary, mb: 2 }}>
        {description}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          p: 2,
          borderRadius: 2,
          bgcolor: c.surface,
          border: `1px solid ${c.border}`,
          borderLeft: `3px solid ${c.accent}`,
        }}
      >
        <Typography sx={{ fontSize: fontSizes.small, color: c.textSecondary, lineHeight: 1.6 }}>
          <Keyword>Picked for:</Keyword> {pickedFor}
        </Typography>
      </Box>

      <Typography sx={{ fontSize: fontSizes.small, fontWeight: 600, color: c.textPrimary, mt: 2.5, mb: 1 }}>
        Try asking things like:
      </Typography>
      <Box component="ul" sx={{ pl: 3, m: 0, color: c.textSecondary, fontSize: fontSizes.small, lineHeight: 1.9 }}>
        {tryAsking.map((example) => (
          <li key={example}>{example}</li>
        ))}
      </Box>
    </Box>
  )
}

function Models() {
  const { c } = useDocsTheme()

  return (
    <DocsShell tocLinks={TOC_LINKS} ctaLabel="See how it works" ctaHref="/home#why-ai-model-router">
      <Typography sx={{ color: c.accent, fontWeight: 600, fontSize: fontSizes.small, mb: 1 }}>Models</Typography>
      <Typography
        id="overview"
        component="h1"
        sx={{
          scrollMarginTop: NAV_HEIGHT + 24,
          fontFamily: fonts.heading,
          fontWeight: 800,
          fontSize: fontSizes.h1,
          letterSpacing: '-0.02em',
          mb: 2,
        }}
      >
        The models behind the router
      </Typography>
      <Typography sx={{ fontSize: fontSizes.body, lineHeight: 1.7, color: c.textSecondary, mb: 6 }}>
        You never have to choose one of these yourself &mdash; <Keyword>AI Model Router</Keyword> reads your
        question and quietly picks whichever model below is the best fit, every time you hit send. Here&apos;s
        what each one brings to the table.
      </Typography>

      <SectionHeading id="how-it-decides" mt={0}>
        How It Decides
      </SectionHeading>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, flexWrap: 'wrap', gap: 2, mb: 2 }}>
        {HOW_IT_DECIDES.map((point) => (
          <Box
            key={point.title}
            sx={{
              flex: '1 1 260px',
              p: 2,
              borderRadius: 2,
              bgcolor: c.surface,
              border: `1px solid ${c.border}`,
            }}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1,
                bgcolor: c.accentBg,
                color: c.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.25,
              }}
            >
              {point.icon}
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: fontSizes.small, mb: 0.5 }}>{point.title}</Typography>
            <Typography sx={{ fontSize: fontSizes.small, color: c.textSecondary, lineHeight: 1.6 }}>
              {point.description}
            </Typography>
          </Box>
        ))}
      </Box>

      {MODELS.map((model) => (
        <ModelCard key={model.id} {...model} />
      ))}

      <SectionHeading id="good-to-know">Good to Know</SectionHeading>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {GOOD_TO_KNOW.map((point) => (
          <Box key={point.title} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1,
                bgcolor: c.accentBg,
                color: c.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {point.icon}
            </Box>
            <Typography sx={{ fontSize: fontSizes.body, lineHeight: 1.7, color: c.textSecondary }}>
              <Keyword>{point.title}.</Keyword> {point.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </DocsShell>
  )
}

export default Models
