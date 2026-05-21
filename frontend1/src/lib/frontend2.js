const DEFAULT_FRONTEND2_PORT = '3000'

function normalizePath(path) {
  return path.startsWith('/') ? path : `/${path}`
}

export function getFrontend2Url(path = '/login') {
  const configuredOrigin = import.meta.env.VITE_FRONTEND2_ORIGIN
  const targetPath = normalizePath(path)

  if (configuredOrigin) {
    return new URL(targetPath, configuredOrigin).toString()
  }

  if (typeof window === 'undefined') {
    return `http://localhost:${DEFAULT_FRONTEND2_PORT}${targetPath}`
  }

  const { protocol, hostname, origin, port } = window.location
  const isViteDevServer = port && port !== DEFAULT_FRONTEND2_PORT
  const fallbackOrigin = isViteDevServer ? `${protocol}//${hostname}:${DEFAULT_FRONTEND2_PORT}` : origin

  return `${fallbackOrigin}${targetPath}`
}

export function goToFrontend2(path = '/login', replace = false) {
  const url = getFrontend2Url(path)
  if (replace) {
    window.location.replace(url)
    return
  }
  window.location.assign(url)
}
