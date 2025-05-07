import FilterBtn from "@/components/FilterBtn";
import SearchBar from "@/components/SearchBar";
import TripList from "@/components/TripList";

// app/discover/page.tsx
export default function DiscoverPage() {
  return (
    <>
      <div className="relative top-20 flex justify-center w-full px-4">
        {/* Search Bar - Centered */}
        <div className="w-full max-w-4xl">
          <SearchBar />
        </div>
      </div>

      {/* Filter Button - Positioned below with some space */}
      <div className="flex justify-center mt-19">
        <div className="ml-4">
          <FilterBtn />
        </div>
      </div>

      <hr className="border-t border-base-200 my-0" />

      <TripList></TripList>
    </>
  );
}
