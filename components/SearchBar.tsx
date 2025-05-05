import { Search } from "lucide-react";
import Form from "next/form";
import { IoIosSearch } from "react-icons/io";

export default function SearchBar() {
  return (
    <>
      <div className="relative mx-auto flex h-18 w-[800px] rounded-4xl border-1 border-gray-300 bg-base-100 shadow">
        <div className="flex h-18 w-[175px] rounded-4xl hover:bg-base-200 items-center focus-within:bg-base-200">
          <fieldset className="fieldset ml-4">
            <legend className="fieldset-legend ml-3 mb-0 pb-0">
              From Where?
            </legend>
            <input
              type="text"
              placeholder="Enter Source"
              className="input input-ghost w-30 input-xs mt-0 pt-0 focus:bg-base-200 focus:outline-none focus:ring-0 focus:border-transparent"
            />
          </fieldset>
        </div>
        <div className="flex h-18 w-[175px] rounded-4xl hover:bg-base-200 items-center focus-within:bg-base-200">
          <fieldset className="fieldset ml-4">
            <legend className="fieldset-legend ml-3 mb-0 pb-0">
              To Where?
            </legend>
            <input
              type="text"
              placeholder="Enter Destination"
              className="input input-ghost w-30 input-xs mt-0 pt-0 focus:bg-base-200 focus:outline-none focus:ring-0 focus:border-transparent"
            />
          </fieldset>
        </div>
        <div className="flex h-18 w-[175px] rounded-4xl hover:bg-base-200 items-center focus-within:bg-base-200">
          <fieldset className="fieldset ml-4">
            <legend className="fieldset-legend ml-3 mb-0 pb-0">
              Latest Arrival?
            </legend>
            <input
              type="date"
              placeholder="Enter Destination"
              className="input input-ghost input-xs mt-0 pt-0 focus:bg-base-200 focus:outline-none focus:ring-0 focus:border-transparent"
            />
          </fieldset>
        </div>
        <div className="flex h-18 w-[175px] rounded-4xl hover:bg-base-200 items-center focus-within:bg-base-200">
          <fieldset className="fieldset ml-4">
            <legend className="fieldset-legend ml-3 mb-0 pb-0">
              Truck Type?
            </legend>
            <select
              defaultValue="Pick a font"
              className="select select-ghost input-xs mt-0 pt-0 focus:bg-base-200 focus:outline-none focus:ring-0 focus:border-transparent"
            >
              <option disabled={true}>Pick a Truck</option>
              <option>Box Van</option>
              <option>Lowbed</option>
              <option>Lowbed + crane</option>
            </select>
          </fieldset>
        </div>
        <div className="flex h-18 w-[100px] rounded-4xl items-center justify-center">
          <button className="btn btn-lg btn-circle bg-primary outline-none">
            <IoIosSearch />
          </button>
        </div>
      </div>
    </>
  );
}
