import Question from "@/components/forms/Question";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask a Question | Dev Overflow",
  description:
    "Ready to get answers? Ask your coding questions and get help from the vibrant community of over 1,000,000 developers on Dev Overflow. Whether it's about a specific framework, a programming language, or a coding challenge, our community is here to assist you.",
};

const AskQuestionPage = async () => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  const mongooseUser = await getUserById({ userId });

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Ask a Question</h1>
      <div className="mt-9">
        <Question mongoUserId={JSON.stringify(mongooseUser._id)} />
      </div>
    </div>
  );
};

export default AskQuestionPage;
