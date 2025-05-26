declare module '@hasura-demo/graphql-client' {
  export interface ClientOptions {
    url?: string;
    headers?: Record<string, string>;
    adminSecret?: string;
    jwtToken?: string;
    maxHistorySize?: number;
  }

  export interface QueryOptions {
    limit?: number;
    offset?: number;
    where?: any;
    orderBy?: any;
    fields?: string;
  }

  export interface MutationOptions {
    fields?: string;
    postCheck?: any;
  }
  
  // Input types from Hasura schema
  export interface InsertFixturesObjectInput {
    homeTeamId: number;
    awayTeamId: number;
    fixtureDate: string;
    sportId: number;
    venue?: string;
    status?: string;
    id?: number;
    createdAt?: string;
  }
  
  export interface InsertPeopleObjectInput {
    name: string;
    teamId?: number;
    id?: number;
  }
  
  export interface InsertPlayerstatsObjectInput {
    personId: number;
    fixtureId: number;
    goals?: number;
    assists?: number;
    yellowCards?: number;
    redCards?: number;
    minutesPlayed?: number;
    rating?: number;
    stats?: any;
    id?: number;
  }

  export interface RequestHistoryItem {
    type: string;
    variables: any;
    duration?: number;
    timestamp: string;
    success: boolean;
    error?: string;
  }

  export interface ClientContext {
    url: string;
    headers: Record<string, string>;
    client: any;
    requestHistory: RequestHistoryItem[];
    maxHistorySize: number;
  }

  // Core client creation
  export function createHasuraClient(options?: ClientOptions): ClientContext;
  
  // Authentication
  export function setJwtToken(ctx: ClientContext, token: string): ClientContext;
  export function setAdminSecret(ctx: ClientContext, secret: string): ClientContext;
  
  // Core execution
  export function execute(ctx: ClientContext, query: string, variables?: any): Promise<any>;
  
  // Query functions
  export function getFixtures(ctx: ClientContext, options?: QueryOptions): Promise<any>;
  export function getPeople(ctx: ClientContext, options?: QueryOptions): Promise<any>;
  export function getPlayerStats(ctx: ClientContext, options?: QueryOptions): Promise<any>;
  
  // Mutation functions - Insert
  export function insertFixtures(ctx: ClientContext, objects: InsertFixturesObjectInput[], options?: MutationOptions): Promise<any>;
  export function insertPeople(ctx: ClientContext, objects: InsertPeopleObjectInput[], options?: MutationOptions): Promise<any>;
  export function insertPlayerStats(ctx: ClientContext, objects: InsertPlayerstatsObjectInput[], options?: MutationOptions): Promise<any>;
  
  // Mutation functions - Update
  export function updateFixtureById(ctx: ClientContext, id: number, set: any, options?: MutationOptions): Promise<any>;
  export function updatePersonById(ctx: ClientContext, id: number, set: any, options?: MutationOptions): Promise<any>;
  export function updatePlayerStatsById(ctx: ClientContext, id: number, set: any, options?: MutationOptions): Promise<any>;
  
  // Mutation functions - Delete
  export function deleteFixtureById(ctx: ClientContext, id: number): Promise<any>;
  export function deletePersonById(ctx: ClientContext, id: number): Promise<any>;
  export function deletePlayerStatsById(ctx: ClientContext, id: number): Promise<any>;
  export function deletePlayerStatsByFixtureAndPerson(ctx: ClientContext, fixtureId: number, personId: number): Promise<any>;
  
  // History management
  export function getRequestHistory(ctx: ClientContext): RequestHistoryItem[];
  export function clearRequestHistory(ctx: ClientContext): ClientContext;
  
  // Config
  export const config: {
    endpoint: string;
    adminSecret: string | undefined;
    jwtToken: string | undefined;
    maxHistorySize: number;
  };

  // Helper factory functions for backwards compatibility
  export function createClient(options?: ClientOptions): ClientContext;
  export function createAdminClient(options?: ClientOptions): ClientContext;
  export function createAuthClient(options?: ClientOptions): ClientContext;
}
