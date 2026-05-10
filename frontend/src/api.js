const BASE_URL = import.meta.env.VITE_API_URL || ''

const getJsonHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

async function handleResponse(response) {
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(body?.error || body?.message || 'API request failed')
  }
  return body
}

export async function fetchSneakers() {
  const response = await fetch(`${BASE_URL}/api/sneakers?per_page=100`)
  return handleResponse(response)
}

export async function fetchSneakerDetail(id) {
  const response = await fetch(`${BASE_URL}/api/sneakers/${id}`)
  return handleResponse(response)
}

export async function loginUser(email, password) {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: getJsonHeaders(),
    body: JSON.stringify({ email, password }),
  })
  return handleResponse(response)
}

export async function registerUser(full_name, email, password, phone) {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: getJsonHeaders(),
    body: JSON.stringify({ full_name, email, password, phone }),
  })
  return handleResponse(response)
}

export async function fetchProfile(token) {
  const response = await fetch(`${BASE_URL}/api/auth/profile`, {
    headers: getJsonHeaders(token),
  })
  return handleResponse(response)
}

export async function fetchCurrentUser(token) {
  const response = await fetch(`${BASE_URL}/api/auth/current-user`, {
    headers: getJsonHeaders(token),
  })
  return handleResponse(response)
}

export async function fetchCart(token) {
  const response = await fetch(`${BASE_URL}/api/cart`, {
    headers: getJsonHeaders(token),
  })
  return handleResponse(response)
}

export async function addCartItem(token, sneaker_id, size_id, quantity = 1) {
  const response = await fetch(`${BASE_URL}/api/cart/add`, {
    method: 'POST',
    headers: getJsonHeaders(token),
    body: JSON.stringify({ sneaker_id, size_id, quantity }),
  })
  return handleResponse(response)
}

export async function updateCartItem(token, item_id, quantity) {
  const response = await fetch(`${BASE_URL}/api/cart/update/${item_id}`, {
    method: 'PUT',
    headers: getJsonHeaders(token),
    body: JSON.stringify({ quantity }),
  })
  return handleResponse(response)
}

export async function removeCartItem(token, item_id) {
  const response = await fetch(`${BASE_URL}/api/cart/remove/${item_id}`, {
    method: 'DELETE',
    headers: getJsonHeaders(token),
  })
  return handleResponse(response)
}

export async function placeOrder(token, payment_method, shipping_address) {
  const response = await fetch(`${BASE_URL}/api/checkout`, {
    method: 'POST',
    headers: getJsonHeaders(token),
    body: JSON.stringify({ payment_method, shipping_address }),
  })
  return handleResponse(response)
}

export async function logoutUser(token) {
  const response = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: getJsonHeaders(token),
  })
  return handleResponse(response)
}

export async function refreshToken(refreshToken) {
  const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: getJsonHeaders(refreshToken),
  })
  return handleResponse(response)
}

export async function fetchWishlist(token) {
  const response = await fetch(`${BASE_URL}/api/wishlist`, {
    headers: getJsonHeaders(token),
  })
  return handleResponse(response)
}

export async function addWishlist(token, sneaker_id, priority = 1) {
  const response = await fetch(`${BASE_URL}/api/wishlist/add/${sneaker_id}`, {
    method: 'POST',
    headers: getJsonHeaders(token),
    body: JSON.stringify({ priority }),
  })
  return handleResponse(response)
}

export async function removeWishlist(token, sneaker_id) {
  const response = await fetch(`${BASE_URL}/api/wishlist/remove/${sneaker_id}`, {
    method: 'DELETE',
    headers: getJsonHeaders(token),
  })
  return handleResponse(response)
}
