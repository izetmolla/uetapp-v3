import { Input } from "@workspace/ui/components/input";
import type { ChangeEvent, FC } from "react";
import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";

interface SearchProps {
    query: string;
    setQuery: (query: string) => void;
}
const Search: FC<SearchProps> = ({ query, setQuery }) => {
    const [localValue, setLocalValue] = useState(query);
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    };

    useEffect(() => {
        setLocalValue(query);
    }, [query]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setQuery(localValue);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [localValue, setQuery]);

    return (
        <div className="relative">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                value={localValue}
                onChange={handleChange}
                placeholder="Search domains..."
                className="pl-8 w-72 h-9"
            />
        </div>
    )
}

export default Search;