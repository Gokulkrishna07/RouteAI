import { Box, Typography } from '@mui/material'
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined'
import { fonts, fontSizes } from '../constants'
import { DocsShell, DocsThemeProvider, Keyword, NAV_HEIGHT, SectionHeading, useDocsTheme } from '../docs/DocsLayout'

const TOC_LINKS = [
  { label: 'Introduction', href: '#overview' },
  { label: 'Why AI Model Router', href: '#why-ai-model-router' },
  { label: 'Supported Providers', href: '#supported-providers' },
]

const INTRO_FEATURES = [
  {
    icon: <ForumOutlinedIcon sx={{ fontSize: 18 }} />,
    title: 'One place for every AI',
    description: 'No more switching apps or tabs to talk to a different AI model.',
  },
  {
    icon: <ShieldOutlinedIcon sx={{ fontSize: 18 }} />,
    title: 'Secure by default',
    description: 'You sign in once, and every conversation after that stays protected.',
  },
  {
    icon: <AutorenewOutlinedIcon sx={{ fontSize: 18 }} />,
    title: 'Room to grow',
    description: 'New AI providers can be added later without changing how you use it.',
  },
]

const PRINCIPLES = [
  {
    title: 'Smart, automatic routing',
    description:
      "You never pick a model yourself. AI Model Router reads how complex your question is and quietly sends it to the AI best suited to answer it — from a quick one-liner to a deep, detailed ask.",
  },
  {
    title: 'One doorway, many minds',
    description:
      'Behind the same simple chat, your message might be handled by Gemini, Groq, or a model chosen through OpenRouter. You never have to manage separate accounts or logins for each one.',
  },
  {
    title: 'A consistent experience',
    description: 'However the reply gets put together behind the scenes, the way you ask and read answers never changes.',
  },
  {
    title: 'Secure sign-in',
    description: 'You sign in once, and every conversation after that stays tied safely to your account.',
  },
  {
    title: 'Built to grow',
    description: 'New AI providers can be added later without changing anything about how you use the app.',
  },
]

const PROVIDERS = [
  { name: 'Gemini', description: "Google's AI — dependable for detailed, thoughtful answers." },
  { name: 'Groq', description: 'Built for speed, ideal for quick, everyday questions.' },
  { name: 'OpenRouter', description: 'A gateway to many other AI models, picked automatically for balanced tasks.' },
]

function HomeContent() {
  const { c } = useDocsTheme()

  return (
    <DocsShell tocLinks={TOC_LINKS} ctaLabel="See how it works" ctaHref="#why-ai-model-router">
      <Typography sx={{ color: c.accent, fontWeight: 600, fontSize: fontSizes.small, mb: 1 }}>Overview</Typography>
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
        AI Model Router
      </Typography>
      <Typography sx={{ fontSize: fontSizes.body, lineHeight: 1.7, color: c.textSecondary, mb: 2 }}>
        Talking to different AI assistants usually means juggling separate apps, logins, and settings.{' '}
        <Keyword>AI Model Router</Keyword> puts them all behind <Keyword>one simple, secure doorway</Keyword>
        &nbsp;&mdash; so you sign in once and chat with any supported AI without ever thinking about which one
        is answering.
      </Typography>
      <Typography sx={{ fontSize: fontSizes.body, lineHeight: 1.7, color: c.textSecondary, mb: 3.5 }}>
        Send a message, and the app quietly figures out how tricky your question is and picks the right AI to
        answer it &mdash; all in a split second, with <Keyword>your data kept safe</Keyword> along the way.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        {INTRO_FEATURES.map((feature) => (
          <Box
            key={feature.title}
            sx={{ flex: 1, p: 2, borderRadius: 2, bgcolor: c.surface, border: `1px solid ${c.border}` }}
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
              {feature.icon}
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: fontSizes.small, mb: 0.5 }}>{feature.title}</Typography>
            <Typography sx={{ fontSize: fontSizes.small, color: c.textSecondary, lineHeight: 1.6 }}>
              {feature.description}
            </Typography>
          </Box>
        ))}
      </Box>

      <SectionHeading id="why-ai-model-router" mt={10}>
        Why AI Model Router
      </SectionHeading>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {PRINCIPLES.map((principle) => (
          <Typography key={principle.title} sx={{ fontSize: fontSizes.body, lineHeight: 1.7, color: c.textSecondary }}>
            <Keyword>{principle.title}.</Keyword> {principle.description}
          </Typography>
        ))}
      </Box>

      <SectionHeading id="supported-providers">Supported Providers</SectionHeading>
      <Typography sx={{ fontSize: fontSizes.body, lineHeight: 1.7, color: c.textSecondary, mb: 3 }}>
        These are the AI models AI Model Router can currently reach for you. You never have to choose between
        them yourself &mdash; the app does that for you, automatically.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {PROVIDERS.map((provider) => (
          <Box
            key={provider.name}
            sx={{
              flex: '1 1 220px',
              p: 2.5,
              borderRadius: 2,
              bgcolor: c.bg,
              border: `1px solid ${c.border}`,
              transition: 'border-color 120ms ease',
              '&:hover': { borderColor: c.accent },
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: c.accentBg,
                color: c.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: fontSizes.small,
                mb: 1.5,
              }}
            >
              {provider.name[0]}
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: fontSizes.body, mb: 0.5 }}>{provider.name}</Typography>
            <Typography sx={{ fontSize: fontSizes.small, color: c.textSecondary, lineHeight: 1.6 }}>
              {provider.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </DocsShell>
  )
}

function Home() {
  return (
    <DocsThemeProvider>
      <HomeContent />
    </DocsThemeProvider>
  )
}

export default Home
