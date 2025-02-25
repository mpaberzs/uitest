import { createPool } from 'slonik';

import env from 'env-var';

const config = {
  dbUrl: env.get('DATABASE_URL').required().asString(),
};

const database = () => createPool(config.dbUrl, {});

export default database;
