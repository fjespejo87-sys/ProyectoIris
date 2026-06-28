const KEY = 'iris_token'

export function getToken() {
  return localStorage.getItem(KEY) || sessionStorage.getItem(KEY)
}

export function setToken(token, remember) {
  clearToken()
  if (remember) {
    localStorage.setItem(KEY, token)
  } else {
    sessionStorage.setItem(KEY, token)
  }
}

export function clearToken() {
  localStorage.removeItem(KEY)
  sessionStorage.removeItem(KEY)
}

export function isAuthenticated() {
  return Boolean(getToken())
}
