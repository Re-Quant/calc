import * as chai from 'chai';
import { floatEqualModule } from './float-equal';
import { roundEqualModule } from './round-equal';

chai.use(floatEqualModule);
chai.use(roundEqualModule);
