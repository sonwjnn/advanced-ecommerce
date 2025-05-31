import { Categories } from "./categories";
import { SearchInput } from "./search-input";

interface Props {
  data: any;
}

export const SearchFilter = ({ data }: Props) => {
  return (
    <div className="px-4 py-8 lg:px-12 border-b flex flex-col gap-4 w-full">
      <SearchInput />
      <Categories data={data} />
    </div>
  );
};
