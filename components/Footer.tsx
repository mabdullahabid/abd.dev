import * as React from 'react'

import { analytics } from '@/lib/analytics'
import * as config from '@/lib/config'
import { GitHubIcon } from '@/lib/icons/github'
import { LinkedInIcon } from '@/lib/icons/linkedin'
import { MoonIcon } from '@/lib/icons/moon'
import { SunIcon } from '@/lib/icons/sun'
import { TwitterIcon } from '@/lib/icons/twitter'
import { useDarkMode } from '@/lib/use-dark-mode'

import styles from './styles.module.css'

export function FooterImpl() {
  const [hasMounted, setHasMounted] = React.useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const currentYear = new Date().getFullYear()

  const onToggleDarkMode = React.useCallback(
    (e: any) => {
      e.preventDefault()
      const currentTheme = isDarkMode ? 'dark' : 'light'
      const newTheme = isDarkMode ? 'light' : 'dark'
      
      // Track theme toggle
      analytics.trackThemeToggle({
        from_theme: currentTheme,
        to_theme: newTheme
      })
      
      toggleDarkMode()
    },
    [isDarkMode, toggleDarkMode]
  )

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <footer className={styles.footer}>
      <div className={styles.copyright}>
        Copyright {currentYear} {config.author}
      </div>

      <div className={styles.settings}>
        {hasMounted && (
          <a
            className={styles.toggleDarkMode}
            href='#'
            role='button'
            onClick={onToggleDarkMode}
            title='Toggle dark mode'
          >
            {isDarkMode ? <MoonIcon /> : <SunIcon />}
          </a>
        )}
      </div>

      <div className={styles.social}>
        {config.twitter && (
          <a
            className={styles.twitter}
            href={`https://x.com/${config.twitter}`}
            title={`X @${config.twitter}`}
            target='_blank'
            rel='noopener noreferrer'
            onClick={() => analytics.trackSocialClick({
              platform: 'twitter',
              location: 'footer',
              url: `https://twitter.com/${config.twitter}`
            })}
          >
            <TwitterIcon />
          </a>
        )}

        {config.github && (
          <a
            className={styles.github}
            href={`https://github.com/${config.github}`}
            title={`GitHub @${config.github}`}
            target='_blank'
            rel='noopener noreferrer'
            onClick={() => analytics.trackSocialClick({
              platform: 'github',
              location: 'footer',
              url: `https://github.com/${config.github}`
            })}
          >
            <GitHubIcon />
          </a>
        )}

        {config.linkedin && (
          <a
            className={styles.linkedin}
            href={`https://www.linkedin.com/in/${config.linkedin}`}
            title={`LinkedIn ${config.author}`}
            target='_blank'
            rel='noopener noreferrer'
            onClick={() => analytics.trackSocialClick({
              platform: 'linkedin',
              location: 'footer',
              url: `https://www.linkedin.com/in/${config.linkedin}`
            })}
          >
            <LinkedInIcon />
          </a>
        )}
      </div>
    </footer>
  )
}

export const Footer = React.memo(FooterImpl)
