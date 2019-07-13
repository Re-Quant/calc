import { expect } from 'chai';
import '../src/chai/index';

import { zMath } from '../src/z-math';
import { zRisk } from '../src/z-risk';

const v = zRisk.marginCallPrice(99, 10000); /* ? */
