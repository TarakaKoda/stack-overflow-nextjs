import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingAskQuestionPage = () => {
  return (
    <section>
      <h1 className="h1-bold text-dark100_light900">Ask Question</h1>

      <div className="mt-7 flex flex-col">
        <div className="flex flex-col gap-6 space-y-3.5 ">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-40 rounded " />
            <Skeleton className="min-h-[56px] w-full rounded-md max-xs:min-w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-40 rounded " />
            <Skeleton className="h-80 w-full rounded-md max-xs:min-w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-40 rounded " />
            <Skeleton className="min-h-[56px] w-full rounded-md max-xs:min-w-full" />
          </div>
        </div>
        <Button
          type="submit"
          className="primary-gradient mt-12 w-fit text-white"
        >
          Loading...
        </Button>
      </div>
    </section>
  );
};

export default LoadingAskQuestionPage;
