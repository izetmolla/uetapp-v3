import { Input } from "@workspace/ui/components/input";
import { Search } from "lucide-react";
import { useState, type FC } from "react";
import { useEffect } from "react";


interface SearchBoxProps {
    keyword: string;
    onChange: (keyword: string) => void;
}


const SearchBox: FC<SearchBoxProps> = ({ keyword, onChange }) => {
    const [localSearchQuery, setLocalSearchQuery] = useState(keyword);

    useEffect(() => {
        setLocalSearchQuery(keyword);
    }, [keyword]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onChange(localSearchQuery);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [localSearchQuery, onChange]);

    return (
        <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="entity-search" value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)}
                placeholder="Search entities... (⌘K)" className="w-64 pl-9" />
        </div>
    );
};

export default SearchBox;