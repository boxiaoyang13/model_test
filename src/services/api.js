const API_BASE_URL = 'http://127.0.0.1:8080/api'

export const favoritesAPI = {
  // Get favorites by protocol
  async getFavorites(protocol) {
    const response = await fetch(`${API_BASE_URL}/favorites/${protocol}`)
    if (!response.ok) throw new Error('Failed to fetch favorites')
    const data = await response.json()
    return data.data
  },

  // Create favorite
  async createFavorite(protocol, name, bodyContent) {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ protocol, name, body_content: bodyContent })
    })
    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Favorite name already exists')
      }
      throw new Error('Failed to create favorite')
    }
    const data = await response.json()
    return data.data
  },

  // Update favorite
  async updateFavorite(id, name, bodyContent) {
    const response = await fetch(`${API_BASE_URL}/favorites/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, body_content: bodyContent })
    })
    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Favorite name already exists')
      }
      throw new Error('Failed to update favorite')
    }
    const data = await response.json()
    return data.data
  },

  // Delete favorite
  async deleteFavorite(id) {
    const response = await fetch(`${API_BASE_URL}/favorites/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete favorite')
  }
}
