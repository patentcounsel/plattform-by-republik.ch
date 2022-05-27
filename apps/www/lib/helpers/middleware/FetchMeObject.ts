import { NextRequest } from 'next/server'

/**
 * Function to fetch the roles of the user and updated cookies
 * @param req
 */
async function fetchMeObject(
  req: NextRequest,
): Promise<{ me: null | { roles: string[] }; cookie: string }> {
  const response = await fetch(process.env.API_URL, {
    method: 'POST',
    body: JSON.stringify({ query: 'query { me { roles } }' }),
    headers: {
      'Content-Type': 'application/json',
      // Attach headers to the request to ensure `me` is returned
      Cookie: req.headers.get('cookie'),
    },
  })

  console.log('new cookie values', response.headers.get('set-cookie'))

  if (response.ok) {
    const { data } = await response.json()

    return {
      me: data?.me,
      cookie: response.headers.get('set-cookie'),
    }
  }

  // Return the updated cookie-header in case the request was not successful
  return {
    me: null,
    cookie: response.headers.get('set-cookie'),
  }
}

export default fetchMeObject
