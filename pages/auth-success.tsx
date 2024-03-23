import { useEffect } from 'react'
import { useRouter } from 'next/router'

function AuthSuccess() {
  const router = useRouter()

  useEffect(() => {
    const { token } = router.query
    if (token) {
      // Store the token in localStorage or cookies
      localStorage.setItem('authToken', token as string)
      // Redirect or fetch user data as needed
      // router.push('/')
    }
  }, [router])

  return <div>Logging you in...</div>
}

export default AuthSuccess
