import { formatDistance } from "date-fns";

interface GoogleBookResult {
  id: string;
  title: string;
  authors?: string[];
  publishedDate?: string;
  imageLinks?: {
    thumbnail?: string;
  };
}

interface Props {
  result: GoogleBookResult;
  onSelect: () => void;
}

export const GoogleBookResult = ({ result, onSelect }: Props) => {
  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent cursor-pointer"
    >
      <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-sm">
        <img
          src={result.imageLinks?.thumbnail || "/placeholder.svg"}
          alt={result.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-medium text-foreground">{result.title}</h4>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          {result.authors && (
            <span className="truncate">
              {result.authors.join(", ")}
            </span>
          )}
          {result.publishedDate && (
            <>
              <span>•</span>
              <span>
                {formatDistance(new Date(result.publishedDate), new Date(), { addSuffix: true })}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};