import { memoize } from 'lodash';

export enum MassOrdering {
    Inverted = "Inverted",
    Normal = "Normal",
}

export const s2t12 = 0.297;
export const dmsq21 = 7.37e-5;
export const s2t13Normal =  0.0215;
export const s2t13Inverted =  0.0216;
export const dmsq31Normal =  2.56e-3;
export const dmsq31Inverted =  2.4663e-3;

const c4t13Normal = (1 - s2t13Normal) * (1 - s2t13Normal);
const c4t13Inverted = (1 - s2t13Inverted) * (1 - s2t13Inverted);

const dmsq32Normal = dmsq31Normal - dmsq21;
const dmsq32Inverted = dmsq31Inverted + dmsq21;

const s22t12 = 4 * s2t12 * (1 - s2t12);
const c2t12 = 1 - s2t12;

const s22t13Normal = 4 * s2t13Normal * (1-s2t13Normal);
const s22t13Inverted = 4 * s2t13Inverted * (1-s2t13Inverted);

export const averageSurvivalProbabilityNormal = c4t13Normal * (1. - s22t12 * 0.5) + s2t13Normal * s2t13Normal;
export const averageSurvivalProbabilityInverted = c4t13Inverted * (1. - s22t12 * 0.5) + s2t13Inverted * s2t13Inverted;

function normalNeutrinoFlavor(Ev: number, dist: number): number{
  const oscarg21 = 1.27 * dmsq21 * dist * 1000;
  const oscarg31 = 1.27 * dmsq31Normal * dist * 1000;
  const oscarg32 = 1.27 * dmsq32Normal * dist * 1000;

  const supr21 = c4t13Normal * s22t12 * (Math.sin(oscarg21/Ev) ** 2);
  const supr31 = s22t13Normal * c2t12 * (Math.sin(oscarg31/Ev) ** 2);
  const supr32 = s22t13Normal * s2t12 * (Math.sin(oscarg32/Ev) ** 2);
  
  return 1 - supr21 - supr31 - supr32;
}

export const normalNeutrinoOscilationSpectrum = memoize((dist: number): Float64Array => {
    const oscspec = new Float64Array(1000);
    oscspec.fill(0);

    return oscspec.map((value, index) => normalNeutrinoFlavor((index+1)*0.01, dist))
})

function invertedNeutrinoFlavor(Ev: number, dist: number): number{
  const oscarg21 = 1.27 * dmsq21 * dist * 1000;
  const oscarg31 = 1.27 * dmsq31Inverted * dist * 1000;
  const oscarg32 = 1.27 * dmsq32Inverted * dist * 1000;

  const supr21 = c4t13Inverted * s22t12 * (Math.sin(oscarg21/Ev) ** 2);
  const supr31 = s22t13Inverted * c2t12 * (Math.sin(oscarg31/Ev) ** 2);
  const supr32 = s22t13Inverted * s2t12 * (Math.sin(oscarg32/Ev) ** 2);
  
  return 1 - supr21 - supr31 - supr32;
}

export const invertedNeutrinoOscilationSpectrum = memoize((dist: number): Float64Array => {
    const oscspec = new Float64Array(1000);
    oscspec.fill(0);

    return oscspec.map((value, index) => invertedNeutrinoFlavor((index+1)*0.01, dist))
})