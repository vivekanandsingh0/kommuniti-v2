/**
 * Kommuniti Map Geo Service
 * Handles math for L6 (1km x 1km) grid generation and coordinate mapping.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GridDimensions {
  cols: number;
  rows: number;
}

// 1 degree of Lat is approx 111.32 km
// 1 degree of Lng is approx 111.32 * cos(lat) km
const KM_PER_LAT_DEGREE = 111.32;

export const MapGeoService = {
  /**
   * Calculates the grid dimensions needed to cover a radius from a center point.
   * For L6, each cell is 1km.
   */
  calculateGridBounds(radiusKm: number): GridDimensions {
    const side = Math.ceil(radiusKm * 2);
    return {
      cols: side,
      rows: side
    };
  },

  /**
   * Gets the center Lat/Lng for a specific grid cell
   * @param index The flat index of the cell
   * @param cols Number of columns in the grid
   * @param center Anchor point (center of the grid)
   */
  getLatLngForCell(index: number, cols: number, rows: number, center: LatLng): LatLng {
    const col = index % cols;
    const row = Math.floor(index / cols);

    // Offsets from the center of the grid in km
    // (col - cols/2) puts the center of the grid at the center of the coordinate system
    const offsetInKmX = (col - (cols - 1) / 2);
    const offsetInKmY = ((rows - 1) / 2 - row); // Flip Y because grid rows go down

    const latOffset = offsetInKmY / KM_PER_LAT_DEGREE;
    const lngOffset = offsetInKmX / (KM_PER_LAT_DEGREE * Math.cos(center.lat * Math.PI / 180));

    return {
      lat: center.lat + latOffset,
      lng: center.lng + lngOffset
    };
  },

  /**
   * Returns which grid index a specific GPS coordinate falls into
   */
  getGridIndex(userLat: number, userLng: number, cols: number, rows: number, center: LatLng): number | null {
    const latDiff = userLat - center.lat;
    const lngDiff = userLng - center.lng;

    const offsetInKmY = latDiff * KM_PER_LAT_DEGREE;
    const offsetInKmX = lngDiff * (KM_PER_LAT_DEGREE * Math.cos(center.lat * Math.PI / 180));

    const col = Math.round(offsetInKmX + (cols - 1) / 2);
    const row = Math.round((rows - 1) / 2 - offsetInKmY);

    if (col < 0 || col >= cols || row < 0 || row >= rows) return null;

    return row * cols + col;
  },

  /**
   * Mock DigiPin L6 Generator based on coordinates
   */
  generateDigiPin(lat: number, lng: number): string {
    const prefix = "KCH"; // Kochi Prefix
    const latPart = Math.abs(Math.floor(lat * 100)).toString().slice(-3);
    const lngPart = Math.abs(Math.floor(lng * 100)).toString().slice(-3);
    return `${prefix}-L6-${latPart}${lngPart}`;
  }
};
