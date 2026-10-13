import type { ServicePageSlugMap } from '../types';
import { pelnaKsiegowosc } from './pelna-ksiegowosc';
import { kpir } from './kpir';
import { ryczalt } from './ryczalt';
import { kadryIPlace } from './kadry-i-place';
import { ksef } from './ksef';
import { inkubatorSpolek } from './inkubator-spolek';

export const UK_SERVICE_PAGES: ServicePageSlugMap = {
  'pelna-ksiegowosc': pelnaKsiegowosc,
  kpir,
  ryczalt,
  'kadry-i-place': kadryIPlace,
  ksef,
  'inkubator-spolek': inkubatorSpolek,
};
