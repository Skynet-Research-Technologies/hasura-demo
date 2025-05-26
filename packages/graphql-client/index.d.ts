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
    execute(query: string, variables?: any): Promise<any>;
    setJwtToken(token: string): ClientContext;
    setAdminSecret(secret: string): ClientContext;
    getRequestHistory(): RequestHistoryItem[];
    clearRequestHistory(): ClientContext;
  }

  export function createHasuraClient(options?: ClientOptions): ClientContext;
  export function getFixtures(client: ClientContext, options?: QueryOptions): Promise<any>;
  export function getPeople(client: ClientContext, options?: QueryOptions): Promise<any>;
  export function getPlayerStats(client: ClientContext, options?: QueryOptions): Promise<any>;
  export function insertFixtures(client: ClientContext, objects: InsertFixturesObjectInput[], options?: MutationOptions): Promise<any>;
  export function insertPeople(client: ClientContext, objects: InsertPeopleObjectInput[], options?: MutationOptions): Promise<any>;
  export function insertPlayerStats(client: ClientContext, objects: InsertPlayerstatsObjectInput[], options?: MutationOptions): Promise<any>;
  export function updateFixtureById(client: ClientContext, id: number, set: any, options?: MutationOptions): Promise<any>;
  export function updatePersonById(client: ClientContext, id: number, set: any, options?: MutationOptions): Promise<any>;
  export function updatePlayerStatsById(client: ClientContext, id: number, set: any, options?: MutationOptions): Promise<any>;
  export function deleteFixtureById(client: ClientContext, id: number): Promise<any>;
  export function deletePersonById(client: ClientContext, id: number): Promise<any>;
  export function deletePlayerStatsById(client: ClientContext, id: number): Promise<any>;
  export function deletePlayerStatsByFixtureAndPerson(client: ClientContext, fixtureId: number, personId: number): Promise<any>;
  export const config: {
    endpoint: string;
    adminSecret: string | undefined;
    jwtToken: string | undefined;
    maxHistorySize: number;
  };
}
