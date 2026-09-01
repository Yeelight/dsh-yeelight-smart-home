/** /yeelight web routes: the settings card's host side. */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { type InvokeLogEntry } from './types.ts';
import type { YeelightConfig } from './types.ts';
export interface WebServerSeam {
    register(route: {
        kind: 'exact' | 'prefix';
        path: string;
        handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
    }): unknown;
}
export interface RouteService {
    readonly env: NodeJS.ProcessEnv;
    readonly dataDir: string;
    readonly config: () => YeelightConfig;
    readonly configFile: string;
    readonly logger: {
        append(entry: InvokeLogEntry): void;
        list(limit: number): readonly InvokeLogEntry[];
        detail(id: string): InvokeLogEntry | undefined;
        clear(): void;
        enabled(): boolean;
    };
    readonly patchConfig: (patch: Record<string, unknown>) => YeelightConfig;
    readonly resetConfig: () => YeelightConfig;
    /** Debug only: the host settings.describe() result (namespaces), when reachable. */
    readonly settingsDescribe?: () => Array<{
        ns: string;
    }>;
}
/** Register the /yeelight prefix route. */
export declare function registerYeelightRoutes(webServer: WebServerSeam, service: RouteService): void;
