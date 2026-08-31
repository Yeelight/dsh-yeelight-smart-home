/** The yeelight_reference tool: on-demand routing documents and assets. */
export interface ReferenceDoc {
    readonly key: string;
    readonly label: string;
    readonly kind: 'reference' | 'asset' | 'example' | 'schema';
    readonly relative: string;
    readonly bytes: number;
}
/** Scan the shipped references directory; works from both src/ and lib/ layouts. */
export declare function listReferenceDocs(dir: string): ReferenceDoc[];
/** The docs registry keyed by accepted `doc` value. */
export declare function referenceIndex(dir: string): Map<string, ReferenceDoc>;
/** Read one document by its registry key. Throws with the available keys when unknown. */
export declare function readReferenceDoc(dir: string, key: string): {
    doc: ReferenceDoc;
    content: string;
};
/**
 * The tool description line listing the most useful routing keys. Kept
 * stable and hand-written so the model sees routing guidance without
 * reading every file name first.
 */
export declare function referenceToolHints(dir: string): string;
