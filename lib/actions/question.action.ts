"use server";

import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../mongoose";
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
  RecommendedParams,
} from "./shared.types";
import Answer from "@/database/answer.model";
import Interaction from "@/database/interaction.model";
import { FilterQuery } from "mongoose";

export async function createQuestion(params: CreateQuestionParams) {
  try {
    connectToDatabase();

    const { title, content, tags, author, path } = params;

    // ? Creating a question.
    const question = await Question.create({
      title,
      content,
      author,
    });

    const tagDocuments = [];

    // ? Create the tags and get them if they already exist.
    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } }, //* filtering the tags using the name.
        { $setOnInsert: { name: tag }, $push: { questions: question._id } }, //* updating the tags question field with the question id.
        { upsert: true, new: true }, //* if the tag does'nt exist then it will create an new tag with the same values specified in the update.
      );
      tagDocuments.push(existingTag._id);
    }

    // ? Pushing the tags into the question.
    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    });

    // TODO Create an interaction record for the user's ask question action

    await Interaction.create({
      user: author,
      question: question._id,
      tags: tagDocuments,
      action: "ask_question",
    });

    // TODO Increment the author reputation with +5 for creating a question and answers an question.

    await User.findByIdAndUpdate(author, { $inc: { reputation: 10 } });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
}

export async function getQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 10 } = params;

    // * Calculate the number of posts to skip based on the page number and page size.

    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof Question> = {};

    if (searchQuery) {
      query.$or = [
        { title: { $regex: new RegExp(searchQuery, "i") } },
        { content: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    let sortOptions = {};

    switch (filter) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "frequent":
        sortOptions = { views: -1 };
        break;

      case "unanswered":
        query.answers = { $size: 0 };
        break;

      default:
        break;
    }

    const questions = await Question.find(query)
      .populate({ path: "author", model: User })
      .populate({ path: "tags", model: Tag })
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const totalQuestions = await Question.countDocuments(query);

    const isNext = totalQuestions > skipAmount + questions.length;
    return { questions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    connectToDatabase();
    const { questionId } = params;
    const question = await Question.findById(questionId)
      .populate({
        path: "tags",
        model: Tag,
        select: "_id name",
      })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      });
    if (!question) {
      throw new Error("Question does not exists.");
    }
    return { question };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function upvoteQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();

    const { userId, questionId, hasupVoted, hasdownVoted, path } = params;
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
      updateQuery = { $addToSet: { upvotes: userId } };
    }

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) {
      throw new Error("Question not found");
    }

    // Todo: Adjust the author's reputation based on the received upvote/downvote to the question.
    // ? Increment value: +2 for an upvote, -2 for a downvote on the voter's reputation.
    // ? Increment value: +10 for an upvote, -10 for a downvote on the question author's reputation.
    // !Note: If the user is attempting to upvote their own question, their reputation remains unaffected. This ensures fair reputation management.

    const questionAuthorId = question.author.toString();

    if (userId !== questionAuthorId) {
      await User.findByIdAndUpdate(userId, {
        $inc: { reputation: hasupVoted ? -1 : 1 },
      });

      await User.findByIdAndUpdate(question.author, {
        $inc: { reputation: hasupVoted ? -10 : 10 },
      });
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function downvoteQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();
    const { userId, questionId, hasdownVoted, hasupVoted, path } = params;

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

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    }).populate("author", "reputation");

    if (!question) {
      throw new Error("Question not found");
    }

    // Todo: Adjust the author's reputation based on the received upvote/downvote to the question.
    // ? Increment value: +2 for an upvote, -2 for a downvote on the voter's reputation.
    // ? Increment value: +10 for an upvote, -10 for a downvote on the question author's reputation.
    // !Note: If the user is attempting to downvote their own question, their reputation remains unaffected. This ensures fair reputation management.

    const questionAuthorId = question.author.toString();

    const reputationIncrement = hasdownVoted ? 10 : -10;

    if (userId !== questionAuthorId) {
      // * Update the voter's reputation
      await User.findByIdAndUpdate(userId, {
        $inc: { reputation: hasdownVoted ? -2 : 2 },
      });

      // * Update the author's reputation, ensuring it doesn't go below zero
      const updatedReputation = Math.max(
        0,
        question.author.reputation + reputationIncrement,
      );
      await User.findByIdAndUpdate(question.author, {
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

export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    connectToDatabase();

    const { questionId, path } = params;

    const deletedQuestion = await Question.findById(questionId).populate(
      "author",
      "_id reputation",
    );

    await Question.deleteOne({ _id: questionId });
    await Answer.deleteMany({ question: questionId });
    await Interaction.deleteMany({ question: questionId });

    await Tag.updateMany(
      { questions: questionId },
      { $pull: { questions: questionId } },
    );

    await User.findByIdAndUpdate(deletedQuestion.author._id, {
      $inc: { reputation: -10 },
    });
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function editQuestion(params: EditQuestionParams) {
  try {
    connectToDatabase();

    const { content, path, title, questionId } = params;

    const question = await Question.findById(questionId).populate("tags");

    if (!question) {
      throw new Error("Question not found");
    }

    question.title = title;
    question.content = content;

    await question.save();

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getHotQuestions() {
  try {
    connectToDatabase();

    const hotQuestions = await Question.find({})
      .sort({
        views: -1,
        upvotes: -1,
      })
      .limit(5);

    return hotQuestions;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getRecommendedQuestions(params: RecommendedParams) {
  try {
    connectToDatabase();

    const { userId, page = 1, pageSize = 20, searchQuery } = params;

    // find user
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      throw new Error("user not found");
    }

    const skipAmount = (page - 1) * pageSize;

    // Find the user's interactions
    const userInteractions = await Interaction.find({ user: user._id })
      .populate("tags")
      .exec();

    // Extract tags from user's interactions
    const userTags = userInteractions.reduce((tags, interaction) => {
      if (interaction.tags) {
        tags = tags.concat(interaction.tags);
      }
      return tags;
    }, []);

    // Get distinct tag IDs from user's interactions
    const distinctUserTagIds = [
      // @ts-ignore
      ...new Set(userTags.map((tag: any) => tag._id)),
    ];

    const query: FilterQuery<typeof Question> = {
      $and: [
        { tags: { $in: distinctUserTagIds } }, // Questions with user's tags
        { author: { $ne: user._id } }, // Exclude user's own questions
      ],
    };

    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { content: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const totalQuestions = await Question.countDocuments(query);

    const recommendedQuestions = await Question.find(query)
      .populate({
        path: "tags",
        model: Tag,
      })
      .populate({
        path: "author",
        model: User,
      })
      .skip(skipAmount)
      .limit(pageSize);

    const isNext = totalQuestions > skipAmount + recommendedQuestions.length;

    return { questions: recommendedQuestions, isNext };
  } catch (error) {
    console.error("Error getting recommended questions:", error);
    throw error;
  }
}
