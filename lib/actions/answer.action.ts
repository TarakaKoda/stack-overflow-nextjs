"use server";

import Answer from "@/database/answer.model";
import Interaction from "@/database/interaction.model";
import Question from "@/database/question.model";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../mongoose";
import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from "./shared.types";

export async function createAnswer(params: CreateAnswerParams) {
  try {
    connectToDatabase();

    const { content, question, author, path } = params;
    const newAnswer = await Answer.create({ content, question, author });

    // * Add new answer to the question answers array
    const questionObject = await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    }).populate("author", "_id");

    // Todo: add interaction...
    await Interaction.create({
      user: author,
      action: "answer",
      answer: newAnswer._id,
      question,
      tags: questionObject.tags,
    });

    const answerAuthor = newAnswer.author.toString();
    const questionAuthor = questionObject.author._id.toString();

    if (answerAuthor !== questionAuthor) {
      await User.findByIdAndUpdate(author, { $inc: { reputation: 10 } });
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAnswers(params: GetAnswersParams) {
  try {
    connectToDatabase();

    const { questionId, sortBy, page = 1, pageSize = 5 } = params;

    const skipAmount = (page - 1) * pageSize;

    let sortOptions = {};

    switch (sortBy) {
      case "highestUpvotes":
        sortOptions = { upvotes: -1 };
        break;
      case "lowestUpvotes":
        sortOptions = { upvotes: 1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "old":
        sortOptions = { createdAt: 1 };
        break;

      default:
        break;
    }

    const answers = await Answer.find({ question: questionId })
      .populate("author", "_id clerkId name picture")
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const totalAnswers = await Answer.countDocuments({ question: questionId });

    const isNext = totalAnswers > skipAmount + answers.length;

    return { answers, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function upvoteAnswer(params: AnswerVoteParams) {
  try {
    connectToDatabase();

    const { answerId, hasdownVoted, hasupVoted, path, userId } = params;

    let updateQuery = {};

    if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userId },
      };
    } else if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      updateQuery = {
        $addToSet: { upvotes: userId },
      };
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) {
      throw new Error("Answer no found");
    }

    // Todo: Adjust the author's reputation based on the received upvote/downvote to the answer.
    // ? Increment value: +2 for an upvote, -2 for a downvote on the voter's reputation.
    // ? Increment value: +10 for an upvote, -10 for a downvote on the answer author's reputation.
    // !Note: If the user is attempting to upvote their own answer, their reputation remains unaffected. This ensures fair reputation management.

    const answerAuthorId = answer.author.toString();

    if (userId !== answerAuthorId) {
      await User.findByIdAndUpdate(userId, {
        $inc: { reputation: hasupVoted ? -2 : 2 },
      });

      await User.findByIdAndUpdate(answer.author, {
        $inc: { reputation: hasupVoted ? -10 : 10 },
      });
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function downvoteAnswer(params: AnswerVoteParams) {
  try {
    connectToDatabase();

    const { answerId, hasdownVoted, hasupVoted, path, userId } = params;

    let updateQuery = {};

    if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userId },
      };
    } else if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = {
        $addToSet: { downvotes: userId },
      };
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    }).populate("author", "reputation");

    if (!answer) {
      throw new Error("Answer no found");
    }

    // Todo: Adjust the author's reputation based on the received upvote/downvote to the answer.
    // ? Increment value: +2 for an upvote, -2 for a downvote on the voter's reputation.
    // ? Increment value: +10 for an upvote, -10 for a downvote on the answer author's reputation.
    // !Note: If the user is attempting to downvote their own answer, their reputation remains unaffected. This ensures fair reputation management.

    const answerAuthorId = answer.author.toString();

    const reputationIncrement = hasdownVoted ? 10 : -10;

    if (userId !== answerAuthorId) {
      // * Update the voter's reputation
      await User.findByIdAndUpdate(userId, {
        $inc: { reputation: hasdownVoted ? -2 : 2 },
      });

      // * Update the author's reputation, ensuring it doesn't go below zero
      const updatedReputation = Math.max(
        0,
        answer.author.reputation + reputationIncrement,
      );
      await User.findByIdAndUpdate(answer.author, {
        $set: { reputation: updatedReputation },
      });
    } else {
      // * If the user is the author of the answer, update only their reputation
      await User.findByIdAndUpdate(userId, {
        $inc: { reputation: hasdownVoted ? -2 : 2 },
      });
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteAnswer(params: DeleteAnswerParams) {
  try {
    connectToDatabase();

    const { answerId, path } = params;

    const answer = await Answer.findById(answerId);

    if (!answer) {
      throw new Error("Answer not found");
    }

    await Answer.deleteOne({ _id: answerId });

    await Question.updateMany(
      { question: answerId },
      { $pull: { answers: answerId } },
    );

    await Interaction.deleteMany({ answer: answerId });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
