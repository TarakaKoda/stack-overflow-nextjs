import LocalSearchBar from "@/components/shared/search/LocalSearchBar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between sm:items-center gap-4 sm:flex-row ">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Link href={`/ask-question`} className="flex justify-end max-sm:w-full">
          <Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900">
            Ask a Question
          </Button>
        </Link>
      </div>
      <div className="flex mt-11 justify-between gap-5 max-sm:flex-col sm:items-center">
    <LocalSearchBar
    route="/"
    iconPosition="left"
    imgSrc="/assets/icons/search.svg"
    placeholder="Search for questions"
    otherClasses="flex-1"/>
    Filters
      </div>
    </>
  );
}
