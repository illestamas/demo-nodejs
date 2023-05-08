export interface ArtworkParameters {
  page: number,
  limit: number
}

export interface Pagination {
  totalPages: number,
  currentPage: number
}

export interface Artwork {
  id: number,
  title: string,
  author: string,
  thumbnail: string,
  error?: any
}

export interface Artworks {
  pagination: Pagination,
  data: Array<Artwork>
}