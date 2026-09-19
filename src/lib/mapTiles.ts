/** Tile source for the map view.
 *
 * Defaults to OpenStreetMap's public tiles, which are fine for development but
 * are NOT allowed for production traffic under their usage policy — point
 * VITE_MAP_TILE_URL at your own provider (MapTiler, Mapbox, Geoapify,
 * self-hosted…) before shipping to customers. */
export const MAP_TILE_URL =
  import.meta.env.VITE_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export const MAP_TILE_ATTRIBUTION =
  import.meta.env.VITE_MAP_TILE_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
