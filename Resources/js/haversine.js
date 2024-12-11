/**
 * @param {number} lat1 latitude coordinate 1
 * @param {number} long1 longitude coordinate 1
 * @param {number} lat2 latitude coordinate 2
 * @param {number} long2 longitude coordinate 2
 * @returns {number} Distance in metres
 */

export function haversine(lat1, long1, lat2, long2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (long2 - long1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres

    return d

}