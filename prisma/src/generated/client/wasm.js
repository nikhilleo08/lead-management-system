
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/wasm.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.3.0-dev.1
 * Query Engine version: 4123509d24aa4dede1e864b46351bf2790323b69
 */
Prisma.prismaVersion = {
  client: "6.3.0-dev.1",
  engine: "4123509d24aa4dede1e864b46351bf2790323b69"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.LeadScalarFieldEnum = {
  id: 'id',
  name: 'name',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastAction: 'lastAction',
  lastActionAt: 'lastActionAt',
  reason: 'reason',
  nextFollowUp: 'nextFollowUp'
};

exports.Prisma.LeadHistoryScalarFieldEnum = {
  id: 'id',
  leadId: 'leadId',
  previousStatus: 'previousStatus',
  actionDescription: 'actionDescription',
  performedAt: 'performedAt',
  reason: 'reason',
  updatedById: 'updatedById'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  role: 'role',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Status = exports.$Enums.Status = {
  NEW: 'NEW',
  REQUIRES_FOLLOWUP: 'REQUIRES_FOLLOWUP',
  IN_PROGRESS: 'IN_PROGRESS',
  STALE: 'STALE',
  CLOSED: 'CLOSED'
};

exports.Role = exports.$Enums.Role = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF'
};

exports.Prisma.ModelName = {
  Lead: 'Lead',
  LeadHistory: 'LeadHistory',
  User: 'User'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/home/nikhil/express-typescript-prisma-boilerplate/prisma/src/generated/client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "debian-openssl-3.0.x",
        "native": true
      }
    ],
    "previewFeatures": [
      "driverAdapters",
      "multiSchema"
    ],
    "sourceFilePath": "/home/nikhil/express-typescript-prisma-boilerplate/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": "../../../../.env",
    "schemaEnvPath": "../../../../.env"
  },
  "relativePath": "../../..",
  "clientVersion": "6.3.0-dev.1",
  "engineVersion": "4123509d24aa4dede1e864b46351bf2790323b69",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider        = \"prisma-client-js\"\n  previewFeatures = [\"multiSchema\", \"driverAdapters\"]\n  output          = \"./src/generated/client\"\n}\n\ngenerator zod {\n  provider              = \"zod-prisma\"\n  output                = \"./src/generated/zod\"\n  relationModel         = true\n  modelCase             = \"PascalCase\"\n  modelSuffix           = \"Schema\"\n  useDecimalJs          = true\n  prismaJsonNullability = true\n}\n\ngenerator markdown {\n  provider = \"prisma-markdown\"\n  output   = \"./docs/prisma/datahub-job-prisma.md\"\n  title    = \"Job (MJDB) for ATS Alignment\"\n}\n\ngenerator docs {\n  provider = \"node node_modules/prisma-docs-generator\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel Lead {\n  id           String        @id @default(uuid())\n  name         String?\n  status       Status        @default(NEW)\n  createdAt    DateTime      @default(now())\n  updatedAt    DateTime      @updatedAt\n  lastAction   String?\n  lastActionAt DateTime?\n  reason       String?\n  nextFollowUp DateTime?\n  histories    LeadHistory[]\n\n  @@index([updatedAt, lastActionAt])\n}\n\nmodel LeadHistory {\n  id                String   @id @default(uuid())\n  leadId            String\n  lead              Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)\n  previousStatus    Status\n  actionDescription String\n  performedAt       DateTime\n  reason            String?\n  updatedBy         User?    @relation(\"UpdatedByUsers\", fields: [updatedById], references: [id])\n  updatedById       String?\n\n  @@index([leadId, updatedById, performedAt])\n}\n\nmodel User {\n  id        String        @id @default(uuid())\n  name      String\n  email     String        @unique\n  role      Role          @default(STAFF)\n  createdAt DateTime      @default(now())\n  updates   LeadHistory[] @relation(\"UpdatedByUsers\")\n}\n\nenum Status {\n  NEW\n  REQUIRES_FOLLOWUP\n  IN_PROGRESS\n  STALE\n  CLOSED\n}\n\nenum Role {\n  ADMIN\n  STAFF\n}\n",
  "inlineSchemaHash": "bc88e2305ce022d2623cb33d84801e1afa0d54de4a23a11f36b6fab9c62d9e30",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"Lead\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"Status\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"lastAction\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lastActionAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"reason\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"nextFollowUp\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"histories\",\"kind\":\"object\",\"type\":\"LeadHistory\",\"relationName\":\"LeadToLeadHistory\"}],\"dbName\":null},\"LeadHistory\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"leadId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lead\",\"kind\":\"object\",\"type\":\"Lead\",\"relationName\":\"LeadToLeadHistory\"},{\"name\":\"previousStatus\",\"kind\":\"enum\",\"type\":\"Status\"},{\"name\":\"actionDescription\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"performedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"reason\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"updatedBy\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"UpdatedByUsers\"},{\"name\":\"updatedById\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"enum\",\"type\":\"Role\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updates\",\"kind\":\"object\",\"type\":\"LeadHistory\",\"relationName\":\"UpdatedByUsers\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = {
  getRuntime: () => require('./query_engine_bg.js'),
  getQueryEngineWasmModule: async () => {
    const loader = (await import('#wasm-engine-loader')).default
    const engine = (await loader).default
    return engine 
  }
}

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

