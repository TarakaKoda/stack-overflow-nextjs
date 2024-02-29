import Link from "next/link";

import Metric from "@/components/shared/Metric";

import { getFormattedNumber, getTimestamp } from "@/lib/utils";
import { SignedIn } from "@clerk/nextjs";
import EditDeleteAction from "../shared/EditDeleteAction";

interface Props {
  clerkId?: string | null;
  _id: string;
  question: {
    _id: string;
    title: string;
  };
  author: {
    _id: string;
    clerkId: string;
    name: string;
    picture: string;
  };
  upvotes: number;
  createdAt: Date;
}

const AnswerCard = ({
  clerkId,
  _id,
  question,
  author,
  upvotes,
  createdAt,
}: Props) => {
  const showActionButtons = clerkId && clerkId === author.clerkId;
  return (
    <Link
      href={`/question/${question._id}/#${_id}`}
      className="card-wrapper rounded-[10px] px-11 py-9"
    >
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div>
          <span className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">
            {getTimestamp(createdAt)}
          </span>
          <Link href={`/question/${question._id}`}>
            <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
              {question.title}
            </h3>
          </Link>
        </div>
        <SignedIn>
          {showActionButtons && (
            <EditDeleteAction type="answer" itemId={JSON.stringify(_id)} />
          )}
        </SignedIn>
      </div>
      <div className="flex-between mt-6 w-full flex-wrap gap-3">
        <Metric
          imgUrl={author.picture || "/assets/icons/avatar.svg"}
          alt="User"
          value={author.name}
          title={`- asked ${getTimestamp(createdAt)}`}
          href={`/profile/${author._id}`}
          isAuthor
          textStyles="bogy-medium text-dark400_light700"
        />
        <Metric
          imgUrl="/assets/icons/like.svg"
          alt="Upvotes"
          value={getFormattedNumber(upvotes)}
          title=" Votes"
          textStyles="small-medium text-dark400_light800"
        />
      </div>
    </Link>
  );
};

export default AnswerCard;
