import { TiffViewSettings } from "TiffViewSettings";
import { MinimalPlugin } from "ViewPluginBase";

// HACK implementation that uses the sorted nature of Map to implement a LRU cache
// instead of keeping a separate LRU list of records
//
// TODO detection of changed files      
export class DataCache extends Map<string, string> {
    private sizeBytes: number = 0;

    constructor(private settings: TiffViewSettings) {
        super();
    }

    set(key: string, value: string): this {
        const itemSize = value.length;
        while (this.size > 0 && this.sizeBytes > this.settings.cacheMegaBytes * 1024 * 1024 - itemSize) {
            // evict oldest item
            const firstKey = this.keys().next().value;
            const firstValue = this.get(firstKey);
            this.sizeBytes -= firstValue?.length ?? 0;
            this.delete(firstKey);
        }
        if (this.size == 0) {
            // recover from any bugs or hot reloads causing drift
            this.sizeBytes = 0;
        }
        if (itemSize > this.settings.cacheMegaBytes * 1024 * 1024) {
            // this also handles the case of the cache being set to 0
            return this;
        }
        this.sizeBytes += itemSize;
        return super.set(key, value);
    }

    get(key: string): string | undefined {
        const value = super.get(key);
        if (value !== undefined) {
            // refresh to back
            this.delete(key);
            this.set(key, value);
        }
        return value;
    }
}

export interface DataCacheHost extends MinimalPlugin {
    cache: DataCache;
}