import * as migration_20260421_120751 from './20260421_120751';

export const migrations = [
  {
    up: migration_20260421_120751.up,
    down: migration_20260421_120751.down,
    name: '20260421_120751'
  },
];
