import { useEffect, useState } from 'react'

type OS = 'mac' | 'windows' | 'linux' | 'unknown'

export function useOS() {
  const [os, setOS] = useState<OS>('unknown')

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    const macosPlatforms = /(macintosh|macintel|macppc|mac68k|macos)/i
    const windowsPlatforms = /(win32|win64|windows|wince)/i
    const iosPlatforms = /(iphone|ipad|ipod)/i

    if (macosPlatforms.test(userAgent) || iosPlatforms.test(userAgent)) {
      setOS('mac')
    } else if (windowsPlatforms.test(userAgent)) {
      setOS('windows')
    } else if (/linux/.test(userAgent)) {
      setOS('linux')
    } else {
      setOS('unknown')
    }
  }, [])

  return {
    os,
    isMac: os === 'mac',
    isWindows: os === 'windows',
    isLinux: os === 'linux',
    modifierKey: os === 'mac' ? '⌘' : 'Ctrl',
  }
} 