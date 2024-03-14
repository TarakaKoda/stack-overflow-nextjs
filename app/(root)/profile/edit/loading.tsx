import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingProfileEditPage = () => {
  return (
    <section>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>

      <div className="mt-7 flex flex-col">
        <div className="flex flex-col gap-6 space-y-3.5 ">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="flex flex-col gap-2">
              <Skeleton className="h-8 w-40 rounded " />
              <Skeleton className="min-h-[56px] w-full rounded-md max-xs:min-w-full" />
            </div>
          ))}
        </div>
        <Button
          type="submit"
          className="primary-gradient mt-12 w-fit self-end text-white"
        >
          Loading...
        </Button>
      </div>
    </section>
  );
};

export default LoadingProfileEditPage;
