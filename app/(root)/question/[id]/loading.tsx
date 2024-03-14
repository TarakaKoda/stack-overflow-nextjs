import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

const LoadingQuestionPage = () => {
  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="h-[24px] w-[24px] rounded-full" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-8 w-40" />
          </div>
        </div>
        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full text-left">
          <Skeleton className="h-14 w-full" />
        </h2>
      </div>
      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="mt-14">
        <Skeleton className="h-screen w-full" />
      </div>

      <div className="mt-8 flex flex-row items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <div className="flex-start mt-8 w-full flex-col">
        <Skeleton className="h-[3px] w-full" />
        <Skeleton className="my-5 h-8 w-32 self-start" />
        <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="h-[24px] w-[24px] rounded-full" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-8 w-40" />
          </div>
        </div>
      </div>

      <div className="mt-14">
        <Skeleton className="h-screen w-full" />
      </div>
      <div className="mt-14 flex flex-col gap-5">
        <Skeleton className="h-[3px] w-full" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Button
            className="btn light-border-2 gap-1.5 rounded-md px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500"
            type="submit"
          >
            <>
              <Image
                src="/assets/icons/stars.svg"
                alt="start"
                width={12}
                height={12}
                className="object-contain text-white"
              />
              Generate AI answer
            </>
          </Button>
        </div>
        <Skeleton className="h-64 w-full" />
        <Button
          type="submit"
          className="primary-gradient w-fit self-end text-white"
        >
          Loading...
        </Button>
      </div>
    </>
  );
};

export default LoadingQuestionPage;
