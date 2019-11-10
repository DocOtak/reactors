import crustU from './crust_u.json';
import crustTh from './crust_th.json';
import crustK from './crust_k.json';

interface CrustFlux {
    u: number;
    th: number;
    k: number;
}

/**
 * Given a lon/lat pair, find the correct cell of a 1x1 degree grid of 
 *   unoscilated crust neutrino fluxes and return it.
 * 
 * Edge behavior: When a lon or lat falls on the edge or corner of a cell
 *   the cell to the south/east will be the returned cell. Examples, if the
 *   latitude of -60 is entered, the cell with the midpoint latitude -60.5 will 
 *   be returned. If a longitude of 40 is entered, the cell with the midpoint 
 *   longitude of 40.5 will be returned.
 * 
 * @param lon - longitude (-180 to 180) inside the cell that will be returned
 * @param lat  - latitude (-90 to 90) inside the cell that will be returned
 */
export function getCrustFlux(lon: number, lat: number): CrustFlux{
    if (lon < -180 || lon > 180){
        throw new RangeError("lon out of range")
    }

    // force the antimeridian to be the most western edge
    if (lon === 180){
        lon = -180;
    }

    // force south pole to be just north of it so that cells 
    // which actually exist are returned
    if (lat === -90){
        lat = -89.9;
    }

    if (lat < -90 || lat > 90){
        throw new RangeError("lat out of range")
    }

    const rowLength = 360;

    const shiftedLon = lon + 180;
    const shiftedLat = lat + 90;

    const flooredLon = Math.floor(shiftedLon);
    // 180 offset because the arrays start in the north west corner
    const flooredLat = Math.floor(180 - shiftedLat);

    const rowIndexOffset = flooredLat * rowLength;
    const gridIndex = rowIndexOffset + flooredLon;

    return {
        u: crustU[gridIndex],
        th: crustTh[gridIndex],
        k: crustK[gridIndex]
    }
}