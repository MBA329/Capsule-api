#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/a3ec62a13dab68050a67a1788704113e9c63d660e3a5d8b0489681a66f814517/contract';
import endContract from '../../snapshots/a3ec62a13dab68050a67a1788704113e9c63d660e3a5d8b0489681a66f814517/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [];
  }
}

MigrationCLI.run(import.meta.url, M);
