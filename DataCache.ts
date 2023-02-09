import { TiffViewSettings } from "TiffViewSettings";
import { MinimalPlugin } from "ViewPluginBase";

// HACK implementation that uses the sorted nature of Map to implement a LRU cache
// instead of keeping a separate LRU list of records
export class DataCache extends Map<string, string> {
    private sizeBytes: number = 0;

    constructor(private settings: TiffViewSettings) {
        super();
    }

    set(key: string, value: string): this {
        const itemSize = value.length;
        if (itemSize > this.settings.cacheMegaBytes * 1024 * 1024) {
            // this also handles the case of the cache being set to 0
            return this;
        }
        while (this.sizeBytes > this.settings.cacheMegaBytes * 1024 * 1024 - itemSize) {
            // evict oldest item
            const firstKey = this.keys().next().value;
            this.delete(firstKey);
        }
        return super.set(key, value);
    }

    get(key: string): string | undefined {
        const value = super.get(key);
        if (value !== undefined) {
            // refresh to front
            this.delete(key);
            this.set(key, value);
        }
        return value;
    }
}

export interface DataCacheHost extends MinimalPlugin {
    cache: DataCache;
}