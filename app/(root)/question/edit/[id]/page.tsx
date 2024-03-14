import Question from "@/components/forms/Question";
import { getQuestionById } from "@/lib/actions/question.action";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs";

interface Props {
  params: { id: string };
}

const EditQuestionPage = async ({ params: { id } }: Props) => {
  const { userId: clerkId } = auth();
  if (!clerkId) return null;

  const mongoUser = await getUserById({ userId: clerkId });

  const { question } = await getQuestionById({ questionId: id });
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Question</h1>
      <div className="mt-9">
        <Question
          type="edit"
          mongoUserId={JSON.stringify(mongoUser._id)}
          questionDetails={JSON.stringify(question)}
        />
      </div>
    </>
  );
};

export default EditQuestionPage;
