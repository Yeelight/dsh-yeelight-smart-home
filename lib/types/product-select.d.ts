/** yeelight_product_select: offline product candidate selection per the reference skill. */
export interface ProductSelectArgs {
    readonly query: string;
    readonly room?: string;
    readonly goal?: string;
    readonly category?: string;
    readonly limit?: number;
}
export interface ProductSelectResult {
    readonly query: string;
    readonly normalizedQuery: string;
    readonly catalog: string;
    readonly returned: number;
    readonly candidates: readonly unknown[];
    readonly selectionGuidance: string;
    readonly runtimeRule: string;
}
/** Run the reference product-select script with the shipped catalogs. */
export declare function runProductSelect(dir: string, args: ProductSelectArgs, options: {
    readonly timeoutMs?: number;
    readonly signal?: AbortSignal;
    readonly env?: NodeJS.ProcessEnv;
}): Promise<ProductSelectResult>;
